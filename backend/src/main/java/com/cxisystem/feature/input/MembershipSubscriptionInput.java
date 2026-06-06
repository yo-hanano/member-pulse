package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * コース契約（membership_subscription）の作成で使う入力値です。入会処理のコース登録で利用します。
 */
@Name("MembershipSubscriptionInput")
@Input
@Data
@NoArgsConstructor
public class MembershipSubscriptionInput {

  /** 契約する月額プラン ID。 */
  @NotBlank @Size(max = 21) private String membershipPlanId;

  /** 契約開始日。 */
  @NotNull private LocalDate startDate;

  /** 月額。未指定の場合はプランの月額を適用する。 */
  private BigDecimal monthlyFee;

  @Size(max = 1000) private String note;
}
