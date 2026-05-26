package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/** 時限マスタの作成・更新で受け取る入力値です。 */
@Name("LessonPeriodInput")
@Input
@Data
@NoArgsConstructor
public class LessonPeriodInput {

  @NotBlank private String name;

  @NotNull @Positive private Integer dispOrder;
}
