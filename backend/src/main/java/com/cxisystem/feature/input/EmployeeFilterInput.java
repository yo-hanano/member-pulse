package com.cxisystem.feature.input;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * employee 一覧の管理画面フィルタ。 MVP では名前・メール・権限・状態の絞り込みだけを持たせる。
 */
@Name("EmployeeFilterInput")
@Input
@Data
@NoArgsConstructor
public class EmployeeFilterInput {

  private String name;
  private String email;
  private Boolean isAdmin;
  private String status;
}
