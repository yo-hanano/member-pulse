package com.cxisystem.feature.input;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * コース契約（membership_subscription）の修正で使う入力値です。月額とメモのみ変更できます。
 * プランや開始日を変えたい場合は修正ではなくプラン変更（changeMembershipPlan）を使います。
 */
@Name("MembershipSubscriptionUpdateInput")
@Input
@Data
@NoArgsConstructor
public class MembershipSubscriptionUpdateInput {

  /** 月額料金。割引等の個別調整を契約スナップショットとして保持する。 */
  @NotNull @DecimalMin("0") private BigDecimal monthlyFee;

  @Size(max = 1000) private String note;
}
