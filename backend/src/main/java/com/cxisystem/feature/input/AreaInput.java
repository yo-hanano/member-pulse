package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * エリアの作成・更新で受け取る入力値です。 会社との紐付けはサーバー側で補うため、画面からは管理項目だけを受け取ります。
 */
@Name("AreaInput")
@Input
@Data
@NoArgsConstructor
public class AreaInput {

  @NotBlank private String name;

  // jOOQ の Record.from() はフィールド名で対応付けるため、DB カラム display_order に名前を合わせる。
  // GraphQL 上の名前は既存クライアントに合わせて dispOrder のまま保つ
  @Name("dispOrder")
  private Integer displayOrder;
}
