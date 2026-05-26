package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 講師の作成・更新で受け取る入力値です。 current schema の講師テーブルにある基本項目をまとめて扱います。
 */
@Name("TeacherInput")
@Input
@Data
@NoArgsConstructor
public class TeacherInput {

  @NotBlank @Size(max = 50) private String code;

  @NotBlank @Size(max = 100) private String name;

  @NotBlank @Size(max = 100) private String kana;

  private LocalDate birthday;

  @NotBlank @Size(max = 32) private String genderCode;

  @NotBlank @Size(max = 16) private String schoolCode;

  @NotBlank @Size(max = 32) private String schoolGradeCode;

  @Size(max = 20) private String phone;

  @Size(max = 255) private String email;

  @NotBlank @Size(max = 30) private String status;

  @Size(max = 1000) private String note;
}
