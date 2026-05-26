package com.cxisystem.identity.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * パスワードリセット要求リクエスト。
 */
@NoArgsConstructor
@Data
public class PublicPasswordResetRequest {

  @NotBlank private String companyCode;

  @NotBlank @Email private String email;
}
