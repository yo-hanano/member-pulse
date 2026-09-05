package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * エリアの表示順を一括更新するときの入力値です。 対象IDと表示順の組だけを受け取り、まとめて更新します。
 */
@Name("AreaOrderInput")
@NoArgsConstructor
@Data
@Input
public class AreaOrderInput {

  @NotNull private String id;

  // jOOQ の Record.from() はフィールド名で対応付けるため、DB カラム display_order に名前を合わせる。
  // GraphQL 上の名前は既存クライアントに合わせて dispOrder のまま保つ
  @Name("dispOrder")
  private Integer displayOrder;
}
