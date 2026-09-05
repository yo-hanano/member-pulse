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
 * コース契約の業務ルールの契約テストです。
 *
 * <p>
 * 「コースの切れ目は月単位」という方針が実装のあちこちに現れます。新契約の開始日は月初、契約終了日は月末、 プラン変更では旧契約が前月末で終わる、という 3
 * 点がその中身です。数字を 1 つ変えるだけで崩れる一方、 崩れても画面はそれらしく動いてしまうため、テストで固定します。
 *
 * <p>
 * 各テストは専用の会社を作って動かします。seed の会社に契約履歴を積むと、次のテストや手元の確認に 影響するためです。
 */
@QuarkusTest
@TestProfile(GraphQlTestProfile.class)
class MembershipSubscriptionGraphQlTest extends GraphQlTestSupport {

  private static final String CHANGE_PLAN =
      """
          mutation changeMembershipPlan($memberId: String!, $subscription: MembershipSubscriptionInput!) {
            changeMembershipPlan(memberId: $memberId, input: $subscription) {
              id
              status
              startDate
              endDate
              monthlyFee
            }
          }
          """;

  private static final String END_SUBSCRIPTION =
      """
          mutation endMembershipSubscription($membershipSubscriptionId: String!, $endDate: Date!) {
            endMembershipSubscription(membershipSubscriptionId: $membershipSubscriptionId, endDate: $endDate) {
              id
              status
              endDate
            }
          }
          """;

  private static final String PAUSE = """
      mutation pauseMembershipSubscription($membershipSubscriptionId: String!) {
        pauseMembershipSubscription(membershipSubscriptionId: $membershipSubscriptionId) {
          id
          status
        }
      }
      """;

  private static final String RESUME = """
      mutation resumeMembershipSubscription($membershipSubscriptionId: String!) {
        resumeMembershipSubscription(membershipSubscriptionId: $membershipSubscriptionId) {
          id
          status
        }
      }
      """;

  private static final String HISTORY = """
      query membershipSubscriptionsByMemberId($memberId: String!) {
        membershipSubscriptionsByMemberId(memberId: $memberId) {
          id
          status
          startDate
          endDate
        }
      }
      """;

  /** 契約開始日が月初でなければ拒まれることを確かめます。 */
  @Test
  void subscriptionMustStartOnFirstDayOfMonth() {
    withFixture(fixture -> {
      List<Map<String, Object>> errors = executeExpectingErrors(fixture.token(), CHANGE_PLAN,
          Map.of("memberId", fixture.memberId(), "subscription",
              Map.of("membershipPlanId", fixture.planId(), "startDate", "2026-04-15")));
      Assertions.assertFalse(errors.isEmpty(), "a mid-month start date must be rejected");
    });
  }

  /** 契約終了日が月末でなければ拒まれることを確かめます。 */
  @Test
  void subscriptionMustEndOnLastDayOfMonth() {
    withFixture(fixture -> {
      String subscriptionId =
          startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");

      List<Map<String, Object>> errors = executeExpectingErrors(fixture.token(), END_SUBSCRIPTION,
          Map.of("membershipSubscriptionId", subscriptionId, "endDate", "2026-04-20"));
      Assertions.assertFalse(errors.isEmpty(), "a mid-month end date must be rejected");

      // 月末なら通る。2 月のような短い月でも月末判定が効くことをあわせて見る
      JsonPath ended = execute(fixture.token(), END_SUBSCRIPTION,
          Map.of("membershipSubscriptionId", subscriptionId, "endDate", "2026-04-30"));
      Assertions.assertEquals("ended", ended.getString("data.endMembershipSubscription.status"));
      Assertions.assertEquals("2026-04-30",
          ended.getString("data.endMembershipSubscription.endDate"));
    });
  }

  /** うるう年でない 2 月の月末が正しく判定されることを確かめます。 */
  @Test
  void endDateAcceptsShortMonthLastDay() {
    withFixture(fixture -> {
      String subscriptionId =
          startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-02-01");

      JsonPath ended = execute(fixture.token(), END_SUBSCRIPTION,
          Map.of("membershipSubscriptionId", subscriptionId, "endDate", "2026-02-28"));
      Assertions.assertEquals("2026-02-28",
          ended.getString("data.endMembershipSubscription.endDate"),
          "the last day of February must be accepted");
    });
  }

  /** プラン変更で旧契約が前月末に終わり、履歴が途切れも重なりもしないことを確かめます。 */
  @Test
  void planChangeClosesPreviousSubscriptionAtEndOfPreviousMonth() {
    withFixture(fixture -> {
      String firstId =
          startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");
      String secondPlanId = createMembershipPlan(fixture.token(), "切替先プラン " + shortId(), 9000);

      JsonPath changed =
          execute(fixture.token(), CHANGE_PLAN, Map.of("memberId", fixture.memberId(),
              "subscription", Map.of("membershipPlanId", secondPlanId, "startDate", "2026-06-01")));
      Assertions.assertEquals("active", changed.getString("data.changeMembershipPlan.status"));
      Assertions.assertEquals("2026-06-01",
          changed.getString("data.changeMembershipPlan.startDate"));

      JsonPath history = execute(fixture.token(), HISTORY, Map.of("memberId", fixture.memberId()));
      List<Map<String, Object>> rows = history.getList("data.membershipSubscriptionsByMemberId");
      Assertions.assertEquals(2, rows.size(), "both the old and the new subscription must remain");

      Map<String, Object> previous =
          rows.stream().filter(row -> firstId.equals(row.get("id"))).findFirst().orElseThrow();
      Assertions.assertEquals("ended", previous.get("status"));
      // 新契約の開始が 6/1 なので、旧契約は 5/31 で終わる。ここが 6/1 だと 1 日重なる
      Assertions.assertEquals("2026-05-31", previous.get("endDate"),
          "the previous subscription must end on the last day of the previous month");
    });
  }

  /** 現契約の開始日以前へは切り替えられないことを確かめます。 */
  @Test
  void planChangeCannotStartOnOrBeforeCurrentStartDate() {
    withFixture(fixture -> {
      startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");
      String secondPlanId = createMembershipPlan(fixture.token(), "過去日プラン " + shortId(), 9000);

      // 同日への切替は、旧契約の終了日が開始日より前になり履歴が壊れるため拒まれる
      List<Map<String, Object>> sameDay = executeExpectingErrors(fixture.token(), CHANGE_PLAN,
          Map.of("memberId", fixture.memberId(), "subscription",
              Map.of("membershipPlanId", secondPlanId, "startDate", "2026-04-01")));
      Assertions.assertFalse(sameDay.isEmpty(),
          "switching on the same start date must be rejected");

      List<Map<String, Object>> past = executeExpectingErrors(fixture.token(), CHANGE_PLAN,
          Map.of("memberId", fixture.memberId(), "subscription",
              Map.of("membershipPlanId", secondPlanId, "startDate", "2026-03-01")));
      Assertions.assertFalse(past.isEmpty(), "switching to an earlier month must be rejected");
    });
  }

  /** 休会と再開が状態に応じてのみ行えることを確かめます。 */
  @Test
  void pauseAndResumeFollowStatusTransitions() {
    withFixture(fixture -> {
      String subscriptionId =
          startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");

      JsonPath paused =
          execute(fixture.token(), PAUSE, Map.of("membershipSubscriptionId", subscriptionId));
      Assertions.assertEquals("paused",
          paused.getString("data.pauseMembershipSubscription.status"));

      // 休会中の契約はもう一度休会できない
      Assertions.assertFalse(
          executeExpectingErrors(fixture.token(), PAUSE,
              Map.of("membershipSubscriptionId", subscriptionId)).isEmpty(),
          "pausing an already paused subscription must be rejected");

      JsonPath resumed =
          execute(fixture.token(), RESUME, Map.of("membershipSubscriptionId", subscriptionId));
      Assertions.assertEquals("active",
          resumed.getString("data.resumeMembershipSubscription.status"));

      // 契約中の契約は再開できない
      Assertions.assertFalse(
          executeExpectingErrors(fixture.token(), RESUME,
              Map.of("membershipSubscriptionId", subscriptionId)).isEmpty(),
          "resuming an active subscription must be rejected");
    });
  }

  /** 終了済みの契約をもう一度終了できないことを確かめます。 */
  @Test
  void endedSubscriptionCannotBeEndedAgain() {
    withFixture(fixture -> {
      String subscriptionId =
          startSubscription(fixture.token(), fixture.memberId(), fixture.planId(), "2026-04-01");
      execute(fixture.token(), END_SUBSCRIPTION,
          Map.of("membershipSubscriptionId", subscriptionId, "endDate", "2026-04-30"));

      Assertions.assertFalse(executeExpectingErrors(fixture.token(), END_SUBSCRIPTION,
          Map.of("membershipSubscriptionId", subscriptionId, "endDate", "2026-05-31")).isEmpty(),
          "ending an already ended subscription must be rejected");
    });
  }

  /** テスト専用の会社・拠点・プラン・会員を用意し、検証後にまとめて片付けます。 */
  private void withFixture(FixtureAssertion assertion) {
    String companyId = createCompany("sub-" + shortId());
    try {
      String token = issueToken(companyId, "sub-user", Set.of("admin"));
      String locationId = createLocation(token, "契約テスト拠点");
      String planId = createMembershipPlan(token, "契約テストプラン " + shortId(), 8000);
      String memberId = createMember(token, "契約テスト会員", locationId, "2026-04-01");
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
