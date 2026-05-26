package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 予定の作成・更新で使う入力値です。 現在の schedule_event テーブルの基本項目をそのまま扱います。
 */
@Name("ScheduleEventInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleEventInput {

  @NotBlank @Size(max = 21) private String scheduleSubjectId;

  @NotBlank @Size(max = 40) private String scheduleType;

  @NotNull private LocalDateTime scheduledAt;

  @NotBlank @Size(max = 30) private String status;

  @Size(max = 1000) private String reason;

  @Size(max = 1000) private String note;
}
