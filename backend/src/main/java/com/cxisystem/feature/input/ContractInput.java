package com.cxisystem.feature.input;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * コース契約の作成・更新で受け取る入力値です。 MVP ではコース本体と座席展開対象の判定情報を保持します。
 */
@Name("ContractInput")
@Input
@Data
@NoArgsConstructor
public class ContractInput {

  @NotBlank @Pattern(regexp = "regular|trial|seasonal|other") private String courseType;

  @Size(max = 100) private String coursePlanName;

  @NotNull private LocalDate contractStartDate;

  private LocalDate contractEndDate;

  @NotBlank @Size(max = 21) private String subjectId;

  @NotNull @Min(1) private Integer weeklyLessons;

  @Min(1) @Max(7) private Short preferredWeekday;

  private LocalTime preferredStartTime;

  private LocalTime preferredEndTime;

  @NotNull @Min(0) private Long monthlyFee;

  @NotNull @Min(0) private Long discountAmount;

  @NotNull private Boolean seatGenerationEligible;

  @Size(max = 1000) private String note;
}
