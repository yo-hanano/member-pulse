package com.cxisystem.feature.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * 招待・リセット用トークンの生成とハッシュ化。 生トークンは保存せず、DBには SHA-256 ハッシュだけ保持する。
 */
public final class TokenUtil {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();
  private static final int TOKEN_BYTES = 32;

  private TokenUtil() {}

  /** 招待やリセット用のランダムトークンを生成します。 */
  public static String generateToken() {
    byte[] bytes = new byte[TOKEN_BYTES];
    SECURE_RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  /** 生トークンを保存用の SHA-256 ハッシュへ変換します。 */
  public static String hashToken(String token) {
    if (token == null || token.isBlank()) {
      throw new IllegalArgumentException("token must not be blank");
    }
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      StringBuilder stringBuilder = new StringBuilder(hashed.length * 2);
      for (byte value : hashed) {
        stringBuilder.append(String.format("%02x", value));
      }
      return stringBuilder.toString();
    } catch (Exception exception) {
      throw new IllegalStateException("failed to hash token", exception);
    }
  }
}
