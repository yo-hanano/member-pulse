package com.cxisystem.feature;

import com.cxisystem.test.GraphQlTestProfile;
import com.cxisystem.test.GraphQlTestSupport;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.path.json.JsonPath;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * 月謝売上の自動生成の契約テストです。
 *
 * <p>
 * この処理は月次レビューのたびに人が実行します。二重に押しても、前回の実行から契約が変わっていても、
 * 同じ月の同じ会員に月謝が二重計上されてはいけません。売上が水増しされても数字がそれらしく並ぶだけで 気づきにくいため、冪等性をテストで固定します。
 *
 * <p>
 * 各テストは専用の会社を作って動かします。seed の会社に売上を積むと手元の確認に影響するためです。
 */
@QuarkusTest
@TestProfile(GraphQlTestProfile.class)
class RevenueGenerationGraphQlTest extends GraphQlTestSupport {

  private static final String GENERATE = """
      mutation generateMembershipFeeRevenues($targetMonth: Date!) {
        generateMembershipFeeRevenues(targetMonth: $targetMonth)
      }
      """;

  private static final String REVENUES_BY_MONTH = """
      query revenueRecordsByMonth($targetMonth: Date!) {
        revenueRecordsByMonth(targetMonth: $targetMonth) {
          id
          memberId
          amount
          revenueDate
          revenueType
          sourceType
        }
      }
      """;

  private static final String PAUSE = """
      mutation pauseMembershipSubscription($membershipSubscriptionId: String!) {
        pauseMembershipSubscription(membershipSubscriptionId: $membershipSubscriptionId) { id }
      }
      """;

  private static final String CHANGE_PLAN =
      """
          mutation changeMembershipPlan($memberId: String!, $subscription: MembershipSubscriptionInput!) {
            changeMembershipPlan(memberId: $memberId, input: $subscription) { id }
          }
          """;

  /** 同じ月に 2 回実行しても、2 回目は 0 件で売上も増えないことを確かめます。 */
  @Test
  void generatingTwiceForSameMonthCreatesNothingTheSecondTime() {
    withFixture(fixture -> {
      startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");

      int firstRun = generate(fixture.token(), "2026-04-01");
      Assertions.assertEquals(1, firstRun, "the first run must create one revenue row");

      int secondRun = generate(fixture.token(), "2026-04-01");
      Assertions.assertEquals(0, secondRun, "re-running for the same month must create nothing");

      List<Map<String, Object>> revenues = revenuesOf(fixture.token(), "2026-04-01");
      Assertions.assertEquals(1, revenues.size(),
          "the member must not be billed twice for the same month");
      Assertions.assertEquals("membership_fee", revenues.get(0).get("revenueType"));
      Assertions.assertEquals("auto", revenues.get(0).get("sourceType"));
    });
  }

  /** 生成後にプランを変えて再実行しても、その月の売上が増えないことを確かめます。 */
  @Test
  void planChangeAfterGenerationDoesNotAddAnotherRevenue() {
    withFixture(fixture -> {
      startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");
      generate(fixture.token(), "2026-04-01");

      // 同じ月のうちに契約が増えても、その月の請求はすでに立っている
      String secondPlanId = createMembershipPlan(fixture.token(), "切替先 " + shortId(), 12000);
      execute(fixture.token(), CHANGE_PLAN, Map.of("memberId", fixture.memberId(), "subscription",
          Map.of("membershipPlanId", secondPlanId, "startDate", "2026-05-01")));

      Assertions.assertEquals(0, generate(fixture.token(), "2026-04-01"),
          "a plan change must not re-open an already generated month");
      Assertions.assertEquals(1, revenuesOf(fixture.token(), "2026-04-01").size(),
          "the already generated month must keep exactly one row");
    });
  }

  /** 休会中の契約には月謝が立たないことを確かめます。 */
  @Test
  void pausedSubscriptionIsSkipped() {
    withFixture(fixture -> {
      String subscriptionId =
          startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");
      execute(fixture.token(), PAUSE, Map.of("membershipSubscriptionId", subscriptionId));

      Assertions.assertEquals(0, generate(fixture.token(), "2026-04-01"),
          "a paused subscription must not be billed");
      Assertions.assertTrue(revenuesOf(fixture.token(), "2026-04-01").isEmpty(),
          "no revenue row must exist for a paused subscription");
    });
  }

  /** 対象月より後に始まる契約には月謝が立たないことを確かめます。 */
  @Test
  void subscriptionStartingLaterIsNotBilledForEarlierMonth() {
    withFixture(fixture -> {
      startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-05-01");

      Assertions.assertEquals(0, generate(fixture.token(), "2026-04-01"),
          "a subscription starting in May must not be billed for April");
      Assertions.assertEquals(1, generate(fixture.token(), "2026-05-01"),
          "the same subscription must be billed for May");
    });
  }

  /** 月の途中の日付を渡しても、その月の 1 日として扱われることを確かめます。 */
  @Test
  void targetMonthIsNormalizedToFirstDay() {
    withFixture(fixture -> {
      startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");

      // 月内のどの日を渡しても同じ月を指す。月初で正規化されていないと二重生成になる
      Assertions.assertEquals(1, generate(fixture.token(), "2026-04-20"));
      Assertions.assertEquals(0, generate(fixture.token(), "2026-04-01"),
          "a mid-month target must resolve to the same month as its first day");

      List<Map<String, Object>> revenues = revenuesOf(fixture.token(), "2026-04-01");
      Assertions.assertEquals(1, revenues.size());
      Assertions.assertEquals("2026-04-01", revenues.get(0).get("revenueDate"),
          "the revenue date must be normalized to the first day of the month");
    });
  }

  /** 月謝の自動生成を実行し、作成件数を返します。 */
  private int generate(String token, String targetMonth) {
    return execute(token, GENERATE, Map.of("targetMonth", targetMonth))
        .getInt("data.generateMembershipFeeRevenues");
  }

  /** 対象月の売上を取得します。 */
  private List<Map<String, Object>> revenuesOf(String token, String targetMonth) {
    JsonPath body = execute(token, REVENUES_BY_MONTH, Map.of("targetMonth", targetMonth));
    return body.getList("data.revenueRecordsByMonth");
  }

  /** テスト専用の会社・拠点・プラン・会員を用意し、検証後にまとめて片付けます。 */
  private void withFixture(FixtureAssertion assertion) {
    String companyId = createCompany("rev-" + shortId());
    try {
      String token = issueToken(companyId, "rev-user", Set.of("admin"));
      String locationId = createLocation(token, "売上テスト拠点");
      String planId = createMembershipPlan(token, "売上テストプラン " + shortId(), 8000);
      String memberId = createMember(token, "売上テスト会員", locationId, "2026-04-01");
      assertion.check(new Fixture(token, memberId, planId));
    } finally {
      purgeCompanyData(companyId);
      deleteCompany(companyId);
    }
  }

  /** 会社コードは一意制約があるため、テストごとに短いランダム値を使います。 */
  private String shortId() {
    return UUID.randomUUID().toString().substring(0, 8);
  }

  /** テストで使う会員・プランの組。 */
  private record Fixture(String token, String memberId, String planId) {}

  /** 検証本体を受け取る関数型インタフェース。 */
  @FunctionalInterface
  private interface FixtureAssertion {
    void check(Fixture fixture);
  }
}
