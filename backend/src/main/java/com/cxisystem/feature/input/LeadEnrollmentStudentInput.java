package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * リード入会時に作成する生徒情報です。 保護者と請求先は別モデルとして LeadEnrollmentInput 側で受け取ります。
 */
@Name("LeadEnrollmentStudentInput")
@Input
@Data
@NoArgsConstructor
public class LeadEnrollmentStudentInput {

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
}
