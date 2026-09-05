package com.cxisystem.test;

import static io.restassured.RestAssured.given;

import com.cxisystem.security.UserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.path.json.JsonPath;
import io.smallrye.jwt.build.Jwt;
import io.vertx.mutiny.redis.client.RedisAPI;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.jwt.Claims;
import org.jooq.DSLContext;
import org.junit.jupiter.api.Assertions;

/**
 * GraphQL の契約テストの土台です。
 *
 * <p>
 * Service を直接呼ばず、実サーバへ HTTP で GraphQL を投げます。RLS は {@code @Rls} と
 * トランザクション境界の組み合わせで効くため、Service を単体で呼ぶと本番と違う経路になるためです。
 *
 * <p>
 * 認証は本番と同じ形をなぞります。backend は JWT の {@code jti} を Redis キーとして UserInfo を引き、 そこから
 * companyId を得て RLS を張ります。そのためテストでも「Redis へ UserInfo を置く」と 「その sessionId を jti
 * に持つ JWT を発行する」の両方を行います。
 *
 * <p>
 * 期待レスポンスを丸ごと固定する形は取りません。データが動くたびに壊れるためです。検証するのは
 * 入れた値が取り出せるか、会社境界を越えないかといった、変更で壊れうる性質に絞ります。
 */
public abstract class GraphQlTestSupport {

  /** seed が投入する開発用の会社。テストはこの会社のデータとして振る舞います。 */
  protected static final String SEED_COMPANY_ID = "m3JjAoupaZaQUXzGWKE4q";

  /** seed が投入する管理者ユーザー。 */
  protected static final String SEED_USER_ID = "hjZ8c5G9zQpXhFT_wv6EQ";

  private static final Duration SESSION_TTL = Duration.ofMinutes(10);

  @Inject
  RedisAPI redisAPI;

  @Inject
  DSLContext dsl;

  @Inject
  ObjectMapper objectMapper;

  /**
   * seed の会社に属する管理者としてアクセストークンを発行します。
   *
   * @return Authorization ヘッダに載せる JWT
   */
  protected String issueAdminToken() {
    return issueToken(SEED_COMPANY_ID, SEED_USER_ID, Set.of("admin"));
  }

  /**
   * 任意の会社・ユーザーとしてアクセストークンを発行します。会社境界の検証で使います。
   *
   * @param companyId 会社ID
   * @param userId ユーザーID
   * @param groups 付与するロール
   * @return Authorization ヘッダに載せる JWT
   */
  protected String issueToken(String companyId, String userId, Set<String> groups) {
    String sessionId = UUID.randomUUID().toString();
    storeSession(sessionId, companyId, userId, groups);
    // backend は jti を Redis キーとして UserInfo を引くため、sessionId を jti に載せる
    return Jwt.issuer("cxi-system.com").subject(userId).claim(Claims.jti, sessionId).groups(groups)
        .expiresIn(SESSION_TTL).sign();
  }

  /** backend が参照する UserInfo を Redis へ置きます。キーは JWT の jti と同じです。 */
  private void storeSession(String sessionId, String companyId, String userId, Set<String> groups) {
    UserInfo userInfo = new UserInfo();
    userInfo.setUserId(userId);
    userInfo.setCompanyId(companyId);
    userInfo.setName("test user");
    userInfo.setEmail("test@example.com");
    userInfo.setGroups(groups);
    try {
      String payload = objectMapper.writeValueAsString(userInfo);
      redisAPI.setex(sessionId, String.valueOf(SESSION_TTL.toSeconds()), payload).await()
          .atMost(Duration.ofSeconds(5));
    } catch (Exception exception) {
      throw new IllegalStateException("failed to store test session", exception);
    }
  }

  /**
   * 会社境界の検証用に、もう 1 社を作ります。
   *
   * <p>
   * {@code company} テーブルは {@code company_id} を持たないため RLS の対象外です （RLS は company_id
   * を持つテーブルにだけ自動で張られます）。そのためテストから直接挿入できます。 作った会社のデータは、その会社のトークンで GraphQL
   * を叩いて用意します。
   *
   * @param code 会社コード。テスト間で衝突しない値を渡します
   * @return 作成した会社のID
   */
  @Transactional
  protected String createCompany(String code) {
    String companyId = "test" + UUID.randomUUID().toString().replace("-", "").substring(0, 17);
    dsl.execute("insert into company (id, code, name, status) values (?, ?, ?, 'active')",
        companyId, code, "boundary test " + code);
    return companyId;
  }

  /**
   * 指定会社のエリアを物理削除します。GraphQL の削除は論理削除で company への参照が残るため、 会社ごと片付けるときに使います。
   *
   * @param companyId 会社ID
   */
  @Transactional
  protected void purgeAreas(String companyId) {
    // area は RLS の対象。app.current_company_id を立てないと対象行が見えず 0 件削除になる
    dsl.execute("select set_config('app.current_company_id', ?, true)", companyId);
    dsl.execute("delete from area where company_id = ?", companyId);
  }

  /**
   * テストで作った会社を消します。参照している行が残っていると失敗するため、後始末の最後に呼びます。
   *
   * @param companyId 会社ID
   */
  @Transactional
  protected void deleteCompany(String companyId) {
    dsl.execute("delete from company where id = ?", companyId);
  }

  /**
   * 認証つきで GraphQL を実行し、エラーが無いことを確かめたうえで data 部分を返します。
   *
   * @param token アクセストークン
   * @param query クエリ本文
   * @param variables 変数（無い場合は空 Map）
   * @return レスポンスの data を指す JsonPath
   */
  protected JsonPath execute(String token, String query, Map<String, Object> variables) {
    JsonPath body = post(token, query, variables);
    Object errors = body.get("errors");
    Assertions.assertNull(errors, () -> "GraphQL returned errors: " + errors);
    return body;
  }

  /**
   * 認証つきで GraphQL を実行し、エラーが返ることを期待して errors を返します。
   *
   * @param token アクセストークン
   * @param query クエリ本文
   * @param variables 変数（無い場合は空 Map）
   * @return errors 配列
   */
  protected List<Map<String, Object>> executeExpectingErrors(String token, String query,
      Map<String, Object> variables) {
    JsonPath body = post(token, query, variables);
    List<Map<String, Object>> errors = body.getList("errors");
    Assertions.assertNotNull(errors, "expected GraphQL errors but got none");
    return errors;
  }

  /** GraphQL エンドポイントへ POST し、レスポンス全体を JsonPath として返します。 */
  protected JsonPath post(String token, String query, Map<String, Object> variables) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("query", query);
    payload.put("variables", variables == null ? Map.of() : variables);

    return given().header("Authorization", "Bearer " + token).contentType("application/json")
        .body(payload).when().post("/graphql").then().statusCode(200).extract().jsonPath();
  }
}
