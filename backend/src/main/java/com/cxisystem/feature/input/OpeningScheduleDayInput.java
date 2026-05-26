package com.cxisystem.feature.input;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 開校スケジュールの曜日別設定入力です。 */
@Name("OpeningScheduleDayInput")
@Input
@Data
@NoArgsConstructor
public class OpeningScheduleDayInput {

  @NotNull @Min(0) @Max(6) private Short weekday;

  @NotNull private Boolean isOpen;

  private List<@Valid OpeningSchedulePeriodInput> periods;
}
