package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * リードの作成・更新で使う入力値です。Phase 0 の lead テーブルにある基本項目を扱います。
 */
@Name("LeadInput")
@Input
@Data
@NoArgsConstructor
public class LeadInput {

  @Size(max = 21) private String locationId;

  @NotBlank @Size(max = 100) private String name;

  @Size(max = 40) private String phone;

  @Size(max = 255) private String email;

  @Size(max = 100) private String source;

  @NotBlank @Size(max = 40) private String status;

  private LocalDateTime inquiryAt;

  private LocalDateTime lostAt;

  @Size(max = 1000) private String lostReason;

  @Size(max = 1000) private String note;
}
