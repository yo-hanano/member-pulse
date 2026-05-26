package com.cxisystem.feature.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * パスワードリセット系の共通レスポンス。 存在推測を避けるため request 完了時は常に ok=true を返す。
 */
@NoArgsConstructor
@Getter
public class PublicPasswordResetResponse {

  private boolean ok;

  /** パスワードリセット処理の成否を設定します。 */
  public PublicPasswordResetResponse(boolean ok) {
    this.ok = ok;
  }
}
