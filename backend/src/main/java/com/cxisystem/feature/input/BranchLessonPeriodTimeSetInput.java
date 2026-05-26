package com.cxisystem.feature.input;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 拠点時限時刻セットの作成・更新で受け取る入力値です。 */
@Name("BranchLessonPeriodTimeSetInput")
@Input
@Data
@NoArgsConstructor
public class BranchLessonPeriodTimeSetInput {

  @NotBlank private String branchId;

  @NotBlank private String name;

  private String note;

  private List<@Valid BranchLessonPeriodTimeInput> times;
}
