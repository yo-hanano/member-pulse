package com.cxisystem.identity.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 招待完了リクエスト。 生トークンと新規パスワードを受けて初回設定を完了する。
 */
@NoArgsConstructor
@Data
public class PublicInviteCompleteRequest {

  @NotBlank private String token;

  @NotBlank private String newPassword;
}
