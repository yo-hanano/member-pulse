package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 最新予定をキャンセルへ変更する入力値です。
 */
@Name("ScheduleEventStatusChangeInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleEventStatusChangeInput {

  @NotBlank @Size(max = 1000) private String reason;

  @Size(max = 1000) private String note;
}
