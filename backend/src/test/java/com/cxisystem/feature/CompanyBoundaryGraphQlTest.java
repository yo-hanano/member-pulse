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
 * 会社境界（RLS）の契約テストです。
 *
 * <p>
 * RLS は {@code @Rls} が {@code app.current_company_id} を設定することで効きます。設定が抜けたり
 * トランザクション境界がずれたりすると、他社のデータが見えてしまいます。壊れたときの被害が最も大きい一方、 手元では 1
 * 社分のデータしか無く気づきにくいため、テストで押さえます。
 *
 * <p>
 * 検証はいずれも「別会社のトークンで作ったデータが、こちらからは存在しないように見えるか」という形にします。
 */
@QuarkusTest
@TestProfile(GraphQlTestProfile.class)
class CompanyBoundaryGraphQlTest extends GraphQlTestSupport {

  private static final String CREATE_AREA = """
      mutation createArea($input: AreaInput!) {
        createArea(input: $input) {
          id
        }
      }
      """;

  private static final String AREA_BY_ID = """
      query areaById($areaId: String!) {
        areaById(areaId: $areaId) {
          id
          name
        }
      }
      """;

  private static final String ALL_AREAS = """
      query { allAreas { id companyId } }
      """;

  private static final String AREA_PAGINATION = """
      query areaPage($pagination: Pagination!) {
        areaPagination(pagination: $pagination) {
          contents { id companyId }
          totalCount
        }
      }
      """;

  private static final String DELETE_AREA = """
      mutation deleteArea($areaId: String!) {
        deleteArea(areaId: $areaId)
      }
      """;

  private static final String UPDATE_AREA = """
      mutation updateArea($areaId: String!, $input: AreaInput!) {
        updateArea(areaId: $areaId, input: $input) {
          id
          name
        }
      }
      """;

  /** 他社が作ったエリアを ID 直指定で引けないことを確かめます。 */
  @Test
  void areaOfAnotherCompanyIsNotVisibleById() {
    withOtherCompanyArea((otherAreaId, ownToken) -> {
      // RLS で行が見えないため「存在しない」として扱われる。他社の存在を推測させないためにも
      // 権限エラーではなく NOT_FOUND が返るのが期待どおり
      List<Map<String, Object>> errors =
          executeExpectingErrors(ownToken, AREA_BY_ID, Map.of("areaId", otherAreaId));
      Assertions.assertTrue(
          errors.stream().anyMatch(error -> String.valueOf(error).contains("NOT_FOUND")),
          () -> "expected NOT_FOUND for another company's area but got " + errors);
    });
  }

  /** 一覧とページングに他社のデータが混ざらないことを確かめます。 */
  @Test
  void listingsOnlyContainOwnCompanyRows() {
    withOtherCompanyArea((otherAreaId, ownToken) -> {
      JsonPath all = execute(ownToken, ALL_AREAS, Map.of());
      List<String> allCompanyIds = all.getList("data.allAreas.companyId");
      Assertions.assertFalse(allCompanyIds.isEmpty(), "own company should still see its own rows");
      Assertions.assertTrue(allCompanyIds.stream().allMatch(SEED_COMPANY_ID::equals),
          "allAreas must not contain rows of another company");

      JsonPath page = execute(ownToken, AREA_PAGINATION,
          Map.of("pagination", Map.of("offset", 0, "limit", 100)));
      List<String> pageCompanyIds = page.getList("data.areaPagination.contents.companyId");
      Assertions.assertTrue(pageCompanyIds.stream().allMatch(SEED_COMPANY_ID::equals),
          "areaPagination must not contain rows of another company");
      Assertions.assertEquals(pageCompanyIds.size(), page.getInt("data.areaPagination.totalCount"),
          "totalCount must be counted within the company boundary");
    });
  }

  /** 他社のエリアを更新できないことを確かめます。 */
  @Test
  void areaOfAnotherCompanyCannotBeUpdated() {
    withOtherCompanyArea((otherAreaId, ownToken) -> {
      // 見えない行への更新は「対象が無い」として扱われる。成功して他社のデータが書き換わらないことが要点
      List<Map<String, Object>> errors = executeExpectingErrors(ownToken, UPDATE_AREA,
          Map.of("areaId", otherAreaId, "input", Map.of("name", "他社を書き換えた")));
      Assertions.assertFalse(errors.isEmpty(),
          "updating an area of another company must not succeed");
    });
  }

  /** 他社のエリアを削除しても、実際には消えないことを確かめます。 */
  @Test
  void areaOfAnotherCompanyIsNotDeleted() {
    String otherCompanyId = createCompany("bt-" + shortId());
    try {
      String otherToken = issueToken(otherCompanyId, "other-user", Set.of("admin"));
      String otherAreaId = execute(otherToken, CREATE_AREA,
          Map.of("input", Map.of("name", "他社のエリア", "dispOrder", 1)))
          .getString("data.createArea.id");

      String ownToken = issueAdminToken();
      execute(ownToken, DELETE_AREA, Map.of("areaId", otherAreaId));

      // 所有者から見てまだ存在していることを確かめる。RLS が抜けていればここで消えている
      JsonPath stillThere = execute(otherToken, AREA_BY_ID, Map.of("areaId", otherAreaId));
      Assertions.assertNotNull(stillThere.get("data.areaById"),
          "delete issued by another company must not remove the row");
      Assertions.assertEquals("他社のエリア", stillThere.getString("data.areaById.name"));
    } finally {
      cleanUp(otherCompanyId);
    }
  }

  /** 他社のエリアを 1 件用意し、自社トークンとあわせて検証本体へ渡します。 */
  private void withOtherCompanyArea(BoundaryAssertion assertion) {
    String otherCompanyId = createCompany("bt-" + shortId());
    try {
      String otherToken = issueToken(otherCompanyId, "other-user", Set.of("admin"));
      String otherAreaId = execute(otherToken, CREATE_AREA,
          Map.of("input", Map.of("name", "他社のエリア", "dispOrder", 1)))
          .getString("data.createArea.id");

      assertion.check(otherAreaId, issueAdminToken());
    } finally {
      cleanUp(otherCompanyId);
    }
  }

  /**
   * テスト会社とそのデータを消します。
   *
   * <p>
   * 検証の途中で落ちても会社が残らないよう、areaId の有無にかかわらず物理削除します。GraphQL の削除は 論理削除で company
   * への参照が残り、会社を消せなくなるためです。テスト専用の会社なので全件消して構いません。
   */
  private void cleanUp(String companyId) {
    purgeAreas(companyId);
    deleteCompany(companyId);
  }

  /** 会社コードは一意制約があるため、テストごとに短いランダム値を使います。 */
  private String shortId() {
    return UUID.randomUUID().toString().substring(0, 8);
  }

  /** 検証本体を受け取る関数型インタフェース。 */
  @FunctionalInterface
  private interface BoundaryAssertion {
    void check(String otherAreaId, String ownToken);
  }
}
