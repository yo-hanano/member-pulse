package com.cxisystem.security;

import com.cxisystem.feature.util.TokenUtil;
import io.vertx.mutiny.redis.client.RedisAPI;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Redis の INCR/EXPIRE を使った簡易レート制限。 公開招待・リセットAPIの乱打対策として最小実装を持つ。
 */
@Slf4j
@ApplicationScoped
public class RateLimitService {

  @Inject
  RedisAPI redisAPI;

  @ConfigProperty(name = "app.rate-limit.invite.verify.limit", defaultValue = "20")
  int inviteVerifyLimit;

  @ConfigProperty(name = "app.rate-limit.invite.verify.window", defaultValue = "PT10M")
  Duration inviteVerifyWindow;

  @ConfigProperty(name = "app.rate-limit.invite.complete.limit", defaultValue = "10")
  int inviteCompleteLimit;

  @ConfigProperty(name = "app.rate-limit.invite.complete.window", defaultValue = "PT10M")
  Duration inviteCompleteWindow;

  @ConfigProperty(name = "app.rate-limit.reset.request.limit", defaultValue = "10")
  int resetRequestLimit;

  @ConfigProperty(name = "app.rate-limit.reset.request.window", defaultValue = "PT10M")
  Duration resetRequestWindow;

  @ConfigProperty(name = "app.rate-limit.reset.complete.limit", defaultValue = "10")
  int resetCompleteLimit;

  @ConfigProperty(name = "app.rate-limit.reset.complete.window", defaultValue = "PT10M")
  Duration resetCompleteWindow;

  /** 招待トークン検証 API の呼び出しを許可するか判定します。 */
  public boolean allowInviteVerify(String rawToken, String ip) {
    String tokenHash = TokenUtil.hashToken(rawToken);
    return checkLimit("rate:invite:verify:" + tokenHash + ":" + ip, inviteVerifyLimit,
        inviteVerifyWindow);
  }

  /** 招待完了 API の呼び出しを許可するか判定します。 */
  public boolean allowInviteComplete(String rawToken, String ip) {
    String tokenHash = TokenUtil.hashToken(rawToken);
    return checkLimit("rate:invite:complete:" + tokenHash + ":" + ip, inviteCompleteLimit,
        inviteCompleteWindow);
  }

  /** パスワードリセット要求 API の呼び出しを許可するか判定します。 */
  public boolean allowResetRequest(String ip) {
    return checkLimit("rate:reset:request:" + ip, resetRequestLimit, resetRequestWindow);
  }

  /** パスワードリセット完了 API の呼び出しを許可するか判定します。 */
  public boolean allowResetComplete(String rawToken, String ip) {
    String tokenHash = TokenUtil.hashToken(rawToken);
    return checkLimit("rate:reset:complete:" + tokenHash + ":" + ip, resetCompleteLimit,
        resetCompleteWindow);
  }

  private boolean checkLimit(String key, int limit, Duration window) {
    try {
      long count = redisAPI.incr(key).await().indefinitely().toLong();
      if (count == 1L) {
        redisAPI.expire(List.of(key, String.valueOf(window.toSeconds()))).await().indefinitely();
      }
      return count <= limit;
    } catch (Exception exception) {
      log.warn("Rate limit check failed: key={}", key);
      return true;
    }
  }
}
