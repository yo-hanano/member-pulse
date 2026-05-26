package com.cxisystem.feature.input;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 管理画面から従業員招待を発行する入力。
 */
@Name("EmployeeInviteInput")
@Input
@Data
@NoArgsConstructor
public class EmployeeInviteInput {

  @NotBlank @Email private String email;
}
