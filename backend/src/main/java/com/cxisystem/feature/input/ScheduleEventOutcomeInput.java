package com.cxisystem.feature.input;

import jakarta.enterprise.context.Dependent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 実施後の営業結果をリードへ反映する入力値です。
 */
@Name("ScheduleEventOutcomeInput")
@Input
@Data
@NoArgsConstructor
@Dependent
public class ScheduleEventOutcomeInput {

  @NotBlank @Pattern(regexp = "contracted|lost") private String leadStatus;

  @Size(max = 1000) private String note;
}
