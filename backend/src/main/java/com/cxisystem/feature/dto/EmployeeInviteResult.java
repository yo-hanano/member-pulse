package com.cxisystem.feature.dto;

import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 管理者の招待発行結果。 管理画面でURLをコピーできるよう、URLと期限を返す。
 */
@NoArgsConstructor
@Getter
public class EmployeeInviteResult {

  private String employeeId;
  private String email;
  private String inviteUrl;
  private Instant expiresAt;

  public EmployeeInviteResult(String employeeId, String email, String inviteUrl,
      Instant expiresAt) {
    this.employeeId = employeeId;
    this.email = email;
    this.inviteUrl = inviteUrl;
    this.expiresAt = expiresAt;
  }
}
