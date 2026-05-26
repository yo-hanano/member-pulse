package com.cxisystem.feature.input;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 生徒の作成・更新で受け取る入力値です。 current schema の生徒テーブルにある基本項目だけを扱います。
 */
@Name("StudentInput")
@Input
@Data
@NoArgsConstructor
public class StudentInput {

  @NotBlank @Size(max = 50) private String code;

  @NotBlank @Size(max = 100) private String name;

  @NotBlank @Size(max = 100) private String kana;

  @NotNull private LocalDate birthday;

  @NotBlank @Size(max = 32) private String genderCode;

  @NotBlank @Size(max = 16) private String schoolCode;

  @NotBlank @Size(max = 21) private String branchId;

  @NotBlank @Size(max = 32) private String schoolGradeCode;

  @NotBlank @Size(max = 30) private String status;

  @Size(max = 1000) private String note;

  @Valid private GuardianInput guardian;
}
