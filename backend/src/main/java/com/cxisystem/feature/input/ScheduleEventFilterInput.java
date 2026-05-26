package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 予定一覧の絞り込み条件です。 種別、ステータス、メモで検索できるようにします。
 */
@Name("ScheduleEventFilterInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleEventFilterInput {

  @Size(max = 21) private String scheduleSubjectId;

  @Size(max = 40) private String scheduleType;

  @Size(max = 30) private String status;

  private String reason;

  private String note;
}
