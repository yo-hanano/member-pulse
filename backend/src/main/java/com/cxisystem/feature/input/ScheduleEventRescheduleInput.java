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
 * 最新予定を日程変更済みにして、次の予定を登録する入力値です。
 */
@Name("ScheduleEventRescheduleInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleEventRescheduleInput {

  @NotBlank @Size(max = 40) private String scheduleType;

  @NotNull private LocalDateTime scheduledAt;

  @NotBlank @Size(max = 1000) private String reason;

  @Size(max = 1000) private String note;
}
