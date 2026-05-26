package com.cxisystem.feature.input;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 拠点の期間付き通常開校スケジュール入力です。 */
@Name("BranchOpeningScheduleInput")
@Input
@Data
@NoArgsConstructor
public class BranchOpeningScheduleInput {

  @NotBlank private String branchId;

  @NotNull private LocalDate effectiveFrom;

  private LocalDate effectiveTo;

  private String timeSetId;

  private String note;

  private List<@Valid OpeningScheduleDayInput> days;
}
