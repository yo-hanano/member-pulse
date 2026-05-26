package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * ログイン中ユーザー自身のアカウント更新入力です。
 */
@Name("OwnAccountUpdateInput")
@NoArgsConstructor
@Data
@Input
public class OwnAccountUpdateInput {

  @NotBlank private String name;

  @NotBlank private String currentPassword;

  // 空/未指定の場合はパスワード変更なし
  private String newPassword;
}
