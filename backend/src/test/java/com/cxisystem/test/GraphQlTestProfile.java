package com.cxisystem.test;

import io.quarkus.test.junit.QuarkusTestProfile;
import java.util.Map;

/**
 * GraphQL 契約テスト用のプロファイルです。
 *
 * <p>
 * 本番の JWT 検証鍵は bff の JWKS ですが、テストでは bff を立てずに完結させたいので、リポジトリに置いた
 * 鍵ペアで発行と検証を行います。devcontainer は {@code MP_JWT_VERIFY_PUBLICKEY_LOCATION} を
 * 環境変数として渡しており、環境変数は application.properties より優先度が高いため、 ここで上書きしないとテストが 401
 * になります。
 */
public class GraphQlTestProfile implements QuarkusTestProfile {

  /**
   * テスト実行時にだけ効かせる設定を返します。
   *
   * @return 上書きする設定
   */
  @Override
  public Map<String, String> getConfigOverrides() {
    return Map.of("mp.jwt.verify.publickey.location", "test-public-key.pem", "mp.jwt.verify.issuer",
        "cxi-system.com", "smallrye.jwt.sign.key.location", "test-private-key.pem");
  }
}
