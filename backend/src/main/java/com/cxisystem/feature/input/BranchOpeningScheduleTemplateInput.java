package com.cxisystem.feature.input;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 会社別の開校スケジュールテンプレート入力です。 */
@Name("BranchOpeningScheduleTemplateInput")
@Input
@Data
@NoArgsConstructor
public class BranchOpeningScheduleTemplateInput {

  @NotBlank private String name;

  private String note;

  private List<@Valid OpeningScheduleDayInput> days;
}
