package com.cxisystem.feature.dto;

import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 招待トークン検証の応答。 公開画面では対象メールと期限だけ返せば足りる。
 */
@NoArgsConstructor
@Getter
public class PublicInviteVerifyResponse {

  private String email;
  private Instant expiresAt;

  /** 招待トークン検証結果のメールアドレスと有効期限を設定します。 */
  public PublicInviteVerifyResponse(String email, Instant expiresAt) {
    this.email = email;
    this.expiresAt = expiresAt;
  }
}
