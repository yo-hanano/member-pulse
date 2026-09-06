package com.cxisystem.feature;

import static io.restassured.RestAssured.given;

import com.cxisystem.test.GraphQlTestProfile;
import com.cxisystem.test.GraphQlTestSupport;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.smallrye.jwt.build.Jwt;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.jwt.Claims;
import org.junit.jupiter.api.Test;

/**
 * 認証境界の契約テストです。
 *
 * <p>
 * どこが認証を要求し、どこが素通りするかは `application.yaml` の
 * {@code quarkus.http.auth.permission} で決まります。設定の並び順ひとつで公開範囲が変わるため、
 * 意図した境界を固定します。
 *
 * <p>
 * あわせて、受け付けてはいけない JWT を並べます。backend は JWT の {@code jti} を Redis キーとして UserInfo
 * を引くため、署名が正しくてもセッションが無ければ通してはいけません。
 */
@QuarkusTest
@TestProfile(GraphQlTestProfile.class)
class AuthBoundaryGraphQlTest extends GraphQlTestSupport {

  private static final String SIMPLE_QUERY = "{ allAreas { id } }";

  /** 認証なしの GraphQL が 401 になることを確かめます。 */
  @Test
  void graphQlRejectsAnonymousAccess() {
    given().contentType("application/json").body(Map.of("query", SIMPLE_QUERY)).when()
        .post("/graphql").then().statusCode(401);
  }

  /** 正しく発行したトークンなら通ることを確かめます。境界テストの対照群です。 */
  @Test
  void graphQlAcceptsValidToken() {
    given().header("Authorization", "Bearer " + issueAdminToken()).contentType("application/json")
        .body(Map.of("query", SIMPLE_QUERY)).when().post("/graphql").then().statusCode(200);
  }

  /** 署名が検証鍵と対応しないトークンを拒むことを確かめます。 */
  @Test
  void graphQlRejectsTokenSignedWithUnknownKey() {
    // テスト用とは別の鍵で署名する。鍵の取り違えに気づけるようにしておく
    String token = Jwt.issuer("cxi-system.com").subject("someone")
        .claim(Claims.jti, UUID.randomUUID().toString()).groups(Set.of("admin"))
        .expiresIn(Duration.ofMinutes(5)).signWithSecret("this-is-not-the-configured-rsa-key-32");
    expectUnauthorized(token);
  }

  /** issuer が異なるトークンを拒むことを確かめます。 */
  @Test
  void graphQlRejectsTokenWithWrongIssuer() {
    String token = Jwt.issuer("https://evil.example.com").subject("someone")
        .claim(Claims.jti, UUID.randomUUID().toString()).groups(Set.of("admin"))
        .expiresIn(Duration.ofMinutes(5)).sign();
    expectUnauthorized(token);
  }

  /** 期限切れのトークンを拒むことを確かめます。 */
  @Test
  void graphQlRejectsExpiredToken() {
    String token = Jwt.issuer("cxi-system.com").subject("someone")
        .claim(Claims.jti, UUID.randomUUID().toString()).groups(Set.of("admin"))
        .expiresAt(java.time.Instant.now().minusSeconds(60)).sign();
    expectUnauthorized(token);
  }

  /**
   * 署名は正しいが Redis にセッションが無いトークンを拒むことを確かめます。
   *
   * <p>
   * ログアウト後のトークンがこの形になります。ここが通ると、セッションを切っても JWT の期限内は アクセスできてしまいます。
   */
  @Test
  void graphQlRejectsTokenWithoutSession() {
    String token = Jwt.issuer("cxi-system.com").subject("someone")
        .claim(Claims.jti, UUID.randomUUID().toString()).groups(Set.of("admin"))
        .expiresIn(Duration.ofMinutes(5)).sign();
    expectUnauthorized(token);
  }

  /** スキーマ公開エンドポイントが認証なしで読めることを確かめます。frontend の gen-schema が依存します。 */
  @Test
  void schemaEndpointStaysPublic() {
    given().when().get("/graphql/schema.graphql").then().statusCode(200);
  }

  /** ヘルスチェックが認証なしで読めることを確かめます。 */
  @Test
  void healthEndpointStaysPublic() {
    given().when().get("/q/health").then().statusCode(200);
  }

  /** 与えたトークンで GraphQL を叩き、401 になることを確かめます。 */
  private void expectUnauthorized(String token) {
    given().header("Authorization", "Bearer " + token).contentType("application/json")
        .body(Map.of("query", SIMPLE_QUERY)).when().post("/graphql").then().statusCode(401);
  }
}
