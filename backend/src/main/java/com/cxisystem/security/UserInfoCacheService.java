package com.cxisystem.security;

import com.github.benmanes.caffeine.cache.Cache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * UserInfo のキャッシュ参照をまとめます。 認証時の Redis アクセスを避けるため、まずメモリキャッシュを見ます。
 */
@ApplicationScoped
public class UserInfoCacheService {

  @Inject
  Cache<String, UserInfo> cache;

  @Inject
  RedisService redisService;

  /**
   * 指定キーの UserInfo をキャッシュ優先で取得します。
   *
   * @param key Redis キー
   * @return UserInfo を返す Uni
   */
  public Uni<UserInfo> getUserInfo(String key) {
    UserInfo cached = cache.getIfPresent(key);
    if (cached != null) {
      return Uni.createFrom().item(cached);
    }
    return redisService.getUserInfoByKey(key).invoke(userInfo -> {
      if (userInfo != null) {
        cache.put(key, userInfo);
      }
    });
  }

  /**
   * 指定キーのキャッシュを破棄します。
   *
   * @param key キャッシュキー
   */
  public void invalidate(String key) {
    cache.invalidate(key);
  }
}
