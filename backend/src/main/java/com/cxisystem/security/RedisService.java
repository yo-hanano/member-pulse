package com.cxisystem.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.redis.client.RedisAPI;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Redis からセッション単位の UserInfo を取得します。 現在の認証モデルでは JWT の `jti` を Redis キーとして利用します。
 */
@ApplicationScoped
public class RedisService {

  @Inject
  RedisAPI redisAPI;

  @Inject
  ObjectMapper objectMapper;

  /**
   * 指定キーの UserInfo を Redis から取得します。
   *
   * @param key Redis キー
   * @return 取得できた場合は UserInfo、失敗時や未存在時は null
   */
  @SuppressWarnings("null")
  public Uni<UserInfo> getUserInfoByKey(String key) {
    return redisAPI.get(key).onItem().transform(response -> {
      if (response == null) {
        return null;
      }
      try {
        return objectMapper.readValue(response.toString(), UserInfo.class);
      } catch (Exception exception) {
        return null;
      }
    });
  }
}
