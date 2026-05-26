package com.cxisystem.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import java.util.concurrent.TimeUnit;

/**
 * UserInfo を保持する Caffeine キャッシュを生成します。 JWT の `jti` に紐づく Redis
 * 参照を減らすためのローカルキャッシュです。
 */
@ApplicationScoped
public class CacheProducer {

  /** UserInfo キャッシュを DI コンテナへ登録します。 */
  @Produces
  @ApplicationScoped
  public Cache<String, UserInfo> userInfoCache() {
    return Caffeine.newBuilder().expireAfterAccess(55, TimeUnit.MINUTES).maximumSize(10_000)
        .build();
  }
}
