package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 開校曜日で利用する時限の入力値です。 */
@Name("OpeningSchedulePeriodInput")
@Input
@Data
@NoArgsConstructor
public class OpeningSchedulePeriodInput {

  @NotBlank private String lessonPeriodId;

}
