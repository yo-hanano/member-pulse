package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * リードの作成・更新で使う入力値です。 current schema の lead テーブルにある基本項目をそのまま扱います。
 */
@Name("LeadInput")
@Input
@Data
@NoArgsConstructor
public class LeadInput {

  @NotNull private LocalDateTime inquiryAt;

  @NotBlank @Size(max = 21) private String branchId;

  @NotBlank @Size(max = 100) private String studentName;

  @Size(max = 100) private String studentKana;

  @Size(max = 100) private String guardianName;

  @Size(max = 100) private String guardianKana;

  @Size(max = 120) private String schoolName;

  @Size(max = 40) private String gradeName;

  @Size(max = 20) private String phone;

  @Size(max = 255) private String email;

  @Size(max = 40) private String channel;

  @NotBlank @Size(max = 30) private String status;

  @Size(max = 1000) private String note;
}
