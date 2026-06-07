package com.cxisystem.feature.dto;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 売上台帳の対象月サマリ DTO。売上画面のサマリカードで利用する。
 */
@NoArgsConstructor
@Getter
public class RevenueSummary {

  /** 売上合計（全種別）。 */
  private BigDecimal totalAmount;

  /** 月謝売上合計（MRR）。 */
  private BigDecimal membershipFeeAmount;

  /** 月謝以外の売上合計。 */
  private BigDecimal otherAmount;

  /** 平均月謝（月謝売上 ÷ 月謝件数）。月謝が無い月は null。 */
  private BigDecimal averageMonthlyFee;

  /** 月謝件数（課金契約数とみなす）。 */
  private int membershipFeeCount;

  /** 対象月サマリをまとめて生成します。 */
  public RevenueSummary(BigDecimal totalAmount, BigDecimal membershipFeeAmount,
      BigDecimal otherAmount, BigDecimal averageMonthlyFee, int membershipFeeCount) {
    this.totalAmount = totalAmount;
    this.membershipFeeAmount = membershipFeeAmount;
    this.otherAmount = otherAmount;
    this.averageMonthlyFee = averageMonthlyFee;
    this.membershipFeeCount = membershipFeeCount;
  }
}
