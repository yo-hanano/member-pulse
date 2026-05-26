package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 予定主体一覧の絞り込み条件です。 lead / student / teacher / guardian の各紐づきを検索できます。
 */
@Name("ScheduleSubjectFilterInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleSubjectFilterInput {

  @Size(max = 21) private String leadId;

  @Size(max = 21) private String studentId;

  @Size(max = 21) private String teacherId;

  @Size(max = 21) private String guardianId;
}
