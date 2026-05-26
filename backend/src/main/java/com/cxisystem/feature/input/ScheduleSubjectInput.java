package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 予定主体の作成・更新で使う入力値です。 lead / student / teacher / guardian のいずれか 1 件を保持します。
 */
@Name("ScheduleSubjectInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleSubjectInput {

  @Size(max = 21) private String leadId;

  @Size(max = 21) private String studentId;

  @Size(max = 21) private String teacherId;

  @Size(max = 21) private String guardianId;
}
