package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 体験セッションの作成・更新で使う入力値です。リード関連情報として予定と実施結果を扱います。
 */
@Name("TrialSessionInput")
@Input
@Data
@NoArgsConstructor
public class TrialSessionInput {

  @NotBlank @Size(max = 21) private String leadId;

  @Size(max = 21) private String locationId;

  @NotNull private LocalDateTime scheduledAt;

  private LocalDateTime completedAt;

  @NotBlank @Size(max = 40) @Pattern(regexp = "scheduled|completed|no_show|canceled") private String status;

  @Size(max = 1000) private String note;
}
