package com.cxisystem.identity.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * パスワードリセット完了リクエスト。
 */
@NoArgsConstructor
@Data
public class PublicPasswordResetCompleteRequest {

  @NotBlank private String token;

  @NotBlank private String newPassword;
}
