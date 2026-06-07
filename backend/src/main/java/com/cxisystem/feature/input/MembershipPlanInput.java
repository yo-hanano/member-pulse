package com.cxisystem.feature.input;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 月額プラン（コース）の作成・更新で使う入力値です。
 */
@Name("MembershipPlanInput")
@Input
@Data
@NoArgsConstructor
public class MembershipPlanInput {

  @NotBlank @Size(max = 100) private String name;

  /** 月額料金。 */
  @NotNull @DecimalMin("0") private BigDecimal monthlyFee;

  /** 拠点 ID。未指定なら全拠点共通のプランとして扱う。 */
  @Size(max = 21) private String locationId;

  /** 募集中フラグ。未指定は募集中として扱う。 */
  private Boolean active;

  private Integer displayOrder;

  @Size(max = 1000) private String note;
}
