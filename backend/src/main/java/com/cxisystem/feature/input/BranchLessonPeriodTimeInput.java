package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 拠点時限時刻セット内の時限別時刻入力です。 */
@Name("BranchLessonPeriodTimeInput")
@Input
@Data
@NoArgsConstructor
public class BranchLessonPeriodTimeInput {

  @NotBlank private String lessonPeriodId;

  @NotNull private LocalTime startTime;

  @NotNull private LocalTime endTime;
}
