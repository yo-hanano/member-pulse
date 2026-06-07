package com.cxisystem.feature.input;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 売上明細（revenue_record）の手入力で使う入力値です。月謝の自動生成では使いません。
 */
@Name("RevenueRecordInput")
@Input
@Data
@NoArgsConstructor
public class RevenueRecordInput {

  /** 拠点 ID。未指定は全社共通の売上として扱う。 */
  @Size(max = 21) private String locationId;

  /** 会員 ID。会員に紐づかない売上（物販等）は未指定でよい。 */
  @Size(max = 21) private String memberId;

  /** 売上日。 */
  @NotNull private LocalDate revenueDate;

  /** 売上種別。月謝・入会金・物販・その他のいずれか。 */
  @NotBlank @Pattern(regexp = "membership_fee|enrollment_fee|goods|other") private String revenueType;

  /** 金額。 */
  @NotNull @DecimalMin("0") private BigDecimal amount;

  @Size(max = 1000) private String note;
}
