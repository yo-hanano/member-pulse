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
 * 会員の作成・更新で使う入力値です。契約履歴を除いた基本情報だけを扱います。
 */
@Name("MemberInput")
@Input
@Data
@NoArgsConstructor
public class MemberInput {

  @NotBlank @Size(max = 21) private String locationId;

  @Size(max = 21) private String leadId;

  @NotBlank @Size(max = 100) private String name;

  @NotBlank @Size(max = 40) private String status;

  @NotNull private LocalDate joinedAt;

  private LocalDate resignedAt;

  @Size(max = 40) private String resignationReasonCode;

  @Size(max = 1000) private String resignationNote;

  @Size(max = 40) private String phone;

  @Size(max = 255) private String email;

  @Size(max = 100) private String lineDisplayName;

  @Size(max = 1000) private String address;

  private LocalDate birthDate;

  @Size(max = 100) private String source;

  @Size(max = 1000) private String note;
}
