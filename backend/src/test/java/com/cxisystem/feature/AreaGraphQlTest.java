package com.cxisystem.feature;

import com.cxisystem.test.GraphQlTestProfile;
import com.cxisystem.test.GraphQlTestSupport;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.path.json.JsonPath;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * エリアの GraphQL 契約テストです。
 *
 * <p>
 * 主目的は「入力した値がそのまま取り出せるか」の検証です。Input のフィールド名が DB カラムと 対応していないと jOOQ の
 * {@code Record.from()} がそのフィールドを黙って捨てるため、 型検査でもビルドでも lint でも捕まりません。実際に
 * dispOrder が保存されない不具合が起きています。
 */
@QuarkusTest
@TestProfile(GraphQlTestProfile.class)
class AreaGraphQlTest extends GraphQlTestSupport {

  private static final String CREATE_AREA = """
      mutation createArea($input: AreaInput!) {
        createArea(input: $input) {
          id
          name
          dispOrder: displayOrder
        }
      }
      """;

  private static final String AREA_BY_ID = """
      query areaById($areaId: String!) {
        areaById(areaId: $areaId) {
          id
          name
          dispOrder: displayOrder
          companyId
        }
      }
      """;

  private static final String UPDATE_AREA = """
      mutation updateArea($areaId: String!, $input: AreaInput!) {
        updateArea(areaId: $areaId, input: $input) {
          id
          name
          dispOrder: displayOrder
        }
      }
      """;

  private static final String DELETE_AREA = """
      mutation deleteArea($areaId: String!) {
        deleteArea(areaId: $areaId)
      }
      """;

  /** 作成した値が作成レスポンスでも再取得でも返ることを確かめます。 */
  @Test
  void createdAreaKeepsAllInputValues() {
    String token = issueAdminToken();
    String areaId = null;
    try {
      JsonPath created = execute(token, CREATE_AREA,
          Map.of("input", Map.of("name", "往復テスト用エリア", "dispOrder", 91)));
      areaId = created.getString("data.createArea.id");

      Assertions.assertNotNull(areaId, "created area should have an id");
      Assertions.assertEquals("往復テスト用エリア", created.getString("data.createArea.name"));
      Assertions.assertEquals(Integer.valueOf(91), created.get("data.createArea.dispOrder"),
          "dispOrder should survive the create mutation");

      // 作成レスポンスだけでなく、DB へ保存された値が読み出せることまで確かめる
      JsonPath fetched = execute(token, AREA_BY_ID, Map.of("areaId", areaId));
      Assertions.assertEquals("往復テスト用エリア", fetched.getString("data.areaById.name"));
      Assertions.assertEquals(Integer.valueOf(91), fetched.get("data.areaById.dispOrder"),
          "dispOrder should be persisted, not silently dropped");
      Assertions.assertEquals(SEED_COMPANY_ID, fetched.getString("data.areaById.companyId"),
          "companyId should be filled from the caller's identity");
    } finally {
      deleteIfPresent(token, areaId);
    }
  }

  /** 更新した値が再取得でも返ることを確かめます。 */
  @Test
  void updatedAreaKeepsAllInputValues() {
    String token = issueAdminToken();
    String areaId = null;
    try {
      JsonPath created =
          execute(token, CREATE_AREA, Map.of("input", Map.of("name", "更新前エリア", "dispOrder", 92)));
      areaId = created.getString("data.createArea.id");

      execute(token, UPDATE_AREA,
          Map.of("areaId", areaId, "input", Map.of("name", "更新後エリア", "dispOrder", 93)));

      JsonPath fetched = execute(token, AREA_BY_ID, Map.of("areaId", areaId));
      Assertions.assertEquals("更新後エリア", fetched.getString("data.areaById.name"));
      Assertions.assertEquals(Integer.valueOf(93), fetched.get("data.areaById.dispOrder"),
          "dispOrder should survive the update mutation");
    } finally {
      deleteIfPresent(token, areaId);
    }
  }

  /** 任意項目を省いたときに、値が入らないだけで作成自体は通ることを確かめます。 */
  @Test
  void areaCanBeCreatedWithoutOptionalDisplayOrder() {
    String token = issueAdminToken();
    String areaId = null;
    try {
      JsonPath created = execute(token, CREATE_AREA, Map.of("input", Map.of("name", "表示順なしエリア")));
      areaId = created.getString("data.createArea.id");

      JsonPath fetched = execute(token, AREA_BY_ID, Map.of("areaId", areaId));
      Assertions.assertEquals("表示順なしエリア", fetched.getString("data.areaById.name"));
      Assertions.assertNull(fetched.get("data.areaById.dispOrder"),
          "omitted dispOrder should stay null instead of being defaulted");
    } finally {
      deleteIfPresent(token, areaId);
    }
  }

  /** 認証なしのアクセスが 401 になることを確かめます。 */
  @Test
  void graphQlRequiresAuthentication() {
    io.restassured.RestAssured.given().contentType("application/json")
        .body(Map.of("query", "{ allAreas { id } }")).when().post("/graphql").then()
        .statusCode(401);
  }

  /** 必須項目が欠けている入力が、バリデーションで弾かれることを確かめます。 */
  @Test
  void areaNameIsRequired() {
    String token = issueAdminToken();
    List<Map<String, Object>> errors =
        executeExpectingErrors(token, CREATE_AREA, Map.of("input", Map.of("dispOrder", 94)));
    Assertions.assertFalse(errors.isEmpty(), "missing name should be rejected");
  }

  /** テストで作ったエリアを消します。作成に失敗していた場合は何もしません。 */
  private void deleteIfPresent(String token, String areaId) {
    if (areaId != null) {
      execute(token, DELETE_AREA, Map.of("areaId", areaId));
    }
  }
}
