package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 予定を実施済みにする入力値です。
 */
@Name("ScheduleEventCompleteInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleEventCompleteInput {

  @Size(max = 1000) private String note;
}
