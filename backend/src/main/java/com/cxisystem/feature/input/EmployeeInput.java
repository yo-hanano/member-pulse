package com.cxisystem.feature.input;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * employee 作成・更新で共通利用する入力型。 いまは管理用CRUDだけを対象にし、パスワードや招待操作は別機能へ分離する。
 */
@Name("EmployeeInput")
@Input
@Data
@NoArgsConstructor
public class EmployeeInput {

  @NotBlank private String name;

  @NotBlank @Email private String email;

  @NotBlank @Size(max = 32) private String genderCode;

  @NotNull private Boolean isAdmin;
}
