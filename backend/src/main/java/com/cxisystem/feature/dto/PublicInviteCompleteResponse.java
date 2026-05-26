package com.cxisystem.feature.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 招待完了レスポンス。 完了した employeeId のみ返して BFF 側の後続処理に使う。
 */
@NoArgsConstructor
@Getter
public class PublicInviteCompleteResponse {

  private String employeeId;

  /** 招待完了後に返す employeeId を設定します。 */
  public PublicInviteCompleteResponse(String employeeId) {
    this.employeeId = employeeId;
  }
}
