package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.Member.MEMBER;
import static com.cxisystem.jooq.tables.MembershipSubscription.MEMBERSHIP_SUBSCRIPTION;
import static com.cxisystem.jooq.tables.RevenueRecord.REVENUE_RECORD;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.RevenueRecordDao;
import com.cxisystem.feature.dto.RevenueSummary;
import com.cxisystem.feature.input.RevenueRecordInput;
import com.cxisystem.feature.type.RevenueRecord;
import com.cxisystem.jooq.tables.records.RevenueRecordRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Record3;
import org.jooq.impl.DSL;

/**
 * 売上台帳の業務操作をまとめるサービスです。手入力売上の CRUD、契約からの月謝自動生成、
 * 対象月サマリの集計を扱います。月次レビュー側の手入力値が正であり、ここは参考値の供給源です。
 */
@ApplicationScoped
public class RevenueRecordService
    extends AbstractService<RevenueRecordRecord, RevenueRecord, String, RevenueRecordDao> {

  private static final String REVENUE_TYPE_MEMBERSHIP_FEE = "membership_fee";
  private static final String SOURCE_TYPE_MANUAL = "manual";
  private static final String SOURCE_TYPE_AUTO = "auto";
  private static final String SUBSCRIPTION_STATUS_PAUSED = "paused";

  @Inject
  RevenueRecordDao revenueRecordDao;

  /** 売上台帳操作に使う Dao を返します。 */
  @Override
  protected RevenueRecordDao getDao() {
    return revenueRecordDao;
  }

  /** 売上明細変換先の型を返します。 */
  @Override
  protected Class<RevenueRecord> getTypeClass() {
    return RevenueRecord.class;
  }

  /** 対象月（任意で拠点も）の売上明細を売上日降順で返します。 */
  @Rls
  @Transactional
  public List<RevenueRecord> findByMonth(LocalDate targetMonth, String locationId) {
    LocalDate monthStart = targetMonth.withDayOfMonth(1);
    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
    return revenueRecordDao.findByMonth(monthStart, monthEnd, locationId).stream()
        .map(record -> record.into(RevenueRecord.class)).collect(Collectors.toList());
  }

  /** 対象月の売上サマリ（売上合計・MRR・平均月謝・月謝件数）を返します。 */
  @Rls
  @Transactional
  public RevenueSummary summary(LocalDate targetMonth, String locationId) {
    LocalDate monthStart = targetMonth.withDayOfMonth(1);
    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

    var condition = REVENUE_RECORD.DELETED_AT.isNull()
        .and(REVENUE_RECORD.REVENUE_DATE.between(monthStart, monthEnd));
    if (StringUtils.isNotBlank(locationId)) {
      condition = condition.and(REVENUE_RECORD.LOCATION_ID.eq(locationId));
    }

    // 月謝と月謝以外を1クエリで集計する。
    Record3<BigDecimal, BigDecimal, Integer> result = dsl().select(
        DSL.coalesce(DSL.sum(REVENUE_RECORD.AMOUNT), BigDecimal.ZERO),
        DSL.coalesce(DSL.sum(DSL.when(REVENUE_RECORD.REVENUE_TYPE.eq(REVENUE_TYPE_MEMBERSHIP_FEE),
            REVENUE_RECORD.AMOUNT)), BigDecimal.ZERO),
        DSL.count(DSL.when(REVENUE_RECORD.REVENUE_TYPE.eq(REVENUE_TYPE_MEMBERSHIP_FEE),
            REVENUE_RECORD.ID)))
        .from(REVENUE_RECORD).where(condition).fetchOne();

    BigDecimal totalAmount = result.value1();
    BigDecimal membershipFeeAmount = result.value2();
    int membershipFeeCount = result.value3();
    BigDecimal averageMonthlyFee =
        membershipFeeCount > 0
            ? membershipFeeAmount.divide(BigDecimal.valueOf(membershipFeeCount), 0,
                RoundingMode.HALF_UP)
            : null;

    return new RevenueSummary(totalAmount, membershipFeeAmount,
        totalAmount.subtract(membershipFeeAmount), averageMonthlyFee, membershipFeeCount);
  }

  /** 手入力の売上明細を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public RevenueRecord create(RevenueRecordInput input) {
    RevenueRecordRecord revenueRecord = newRecord(input);
    revenueRecord.setSourceType(SOURCE_TYPE_MANUAL);
    normalizeOptionalFields(revenueRecord);
    revenueRecord.store();
    revenueRecord.refresh();
    return revenueRecord.into(RevenueRecord.class);
  }

  /** 既存の売上明細を更新して、保存後の値を返します。自動生成された月謝も金額等を調整できます。 */
  @Rls
  @Transactional
  public RevenueRecord update(String id, RevenueRecordInput input) {
    RevenueRecordRecord revenueRecord = revenueRecordDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("revenue record not found: " + id));
    revenueRecord.from(input);
    normalizeOptionalFields(revenueRecord);
    revenueRecord.store();
    revenueRecord.refresh();
    return revenueRecord.into(RevenueRecord.class);
  }

  /** 売上明細を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteRevenueRecord(String id) {
    delete(id);
    return true;
  }

  /**
   * 対象月の月謝売上を契約から自動生成し、作成件数を返します。
   * 1会員1契約の方針に合わせて、月内にプラン変更があっても会員ごとに最新契約の1件だけを生成します
   * （休会中はスキップ、日割りなしの満額）。生成済みの会員は再実行しても重複しません。
   */
  @Rls
  @Transactional
  public int generateMembershipFees(LocalDate targetMonth) {
    LocalDate monthStart = targetMonth.withDayOfMonth(1);
    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

    // 契約期間が対象月と重なる契約を抽出する。
    // 休会中は月謝が発生しない前提でスキップする（生成時点のステータスで判定）。
    List<FeeSource> sources = dsl()
        .select(MEMBERSHIP_SUBSCRIPTION.ID, MEMBERSHIP_SUBSCRIPTION.MEMBER_ID,
            MEMBERSHIP_SUBSCRIPTION.MONTHLY_FEE, MEMBERSHIP_SUBSCRIPTION.START_DATE,
            MEMBERSHIP_SUBSCRIPTION.CREATED_AT, MEMBER.LOCATION_ID)
        .from(MEMBERSHIP_SUBSCRIPTION).join(MEMBER)
        .on(MEMBER.ID.eq(MEMBERSHIP_SUBSCRIPTION.MEMBER_ID))
        .where(MEMBERSHIP_SUBSCRIPTION.DELETED_AT.isNull()
            .and(MEMBERSHIP_SUBSCRIPTION.STATUS.ne(SUBSCRIPTION_STATUS_PAUSED))
            .and(MEMBERSHIP_SUBSCRIPTION.START_DATE.le(monthEnd))
            .and(MEMBERSHIP_SUBSCRIPTION.END_DATE.isNull()
                .or(MEMBERSHIP_SUBSCRIPTION.END_DATE.ge(monthStart))))
        .fetch(record -> new FeeSource(record.get(MEMBERSHIP_SUBSCRIPTION.ID),
            record.get(MEMBERSHIP_SUBSCRIPTION.MEMBER_ID),
            record.get(MEMBERSHIP_SUBSCRIPTION.MONTHLY_FEE),
            record.get(MEMBERSHIP_SUBSCRIPTION.START_DATE),
            record.get(MEMBERSHIP_SUBSCRIPTION.CREATED_AT), record.get(MEMBER.LOCATION_ID)));

    // プラン変更で同月に複数契約が重なる場合は、開始日（同日なら作成日時）が最も新しい契約を採用する。
    Map<String, FeeSource> latestByMember = new LinkedHashMap<>();
    for (FeeSource source : sources) {
      FeeSource current = latestByMember.get(source.memberId());
      if (current == null || source.isNewerThan(current)) {
        latestByMember.put(source.memberId(), source);
      }
    }

    // 既に対象月の自動生成月謝がある会員は、契約が変わっていても二重生成しない。
    Set<String> generatedMemberIds =
        dsl().selectDistinct(REVENUE_RECORD.MEMBER_ID).from(REVENUE_RECORD)
            .where(REVENUE_RECORD.REVENUE_DATE.eq(monthStart)
                .and(REVENUE_RECORD.SOURCE_TYPE.eq(SOURCE_TYPE_AUTO))
                .and(REVENUE_RECORD.DELETED_AT.isNull()).and(REVENUE_RECORD.MEMBER_ID.isNotNull()))
            .fetchSet(REVENUE_RECORD.MEMBER_ID);

    // 1件ずつ store して NanoId / company_id 等のリスナーを通す（月次の会員数規模なので十分軽い）。
    int created = 0;
    for (FeeSource source : latestByMember.values()) {
      if (generatedMemberIds.contains(source.memberId())) {
        continue;
      }
      RevenueRecordRecord revenueRecord = newRecord();
      revenueRecord.setMembershipSubscriptionId(source.subscriptionId());
      revenueRecord.setMemberId(source.memberId());
      revenueRecord.setLocationId(source.locationId());
      revenueRecord.setRevenueDate(monthStart);
      revenueRecord.setRevenueType(REVENUE_TYPE_MEMBERSHIP_FEE);
      revenueRecord.setAmount(source.monthlyFee());
      revenueRecord.setSourceType(SOURCE_TYPE_AUTO);
      revenueRecord.store();
      created++;
    }
    return created;
  }

  /** 月謝自動生成の元になる契約情報。生成判定に必要な列だけを持つ。 */
  private record FeeSource(String subscriptionId, String memberId, BigDecimal monthlyFee,
      LocalDate startDate, LocalDateTime createdAt, String locationId) {

    /** 開始日（同日の場合は作成日時）を比較し、自分の方が新しい契約なら true を返す。 */
    boolean isNewerThan(FeeSource other) {
      if (!startDate.isEqual(other.startDate())) {
        return startDate.isAfter(other.startDate());
      }
      return createdAt.isAfter(other.createdAt());
    }
  }

  private void normalizeOptionalFields(RevenueRecordRecord revenueRecord) {
    revenueRecord.setLocationId(StringUtils.trimToNull(revenueRecord.getLocationId()));
    revenueRecord.setMemberId(StringUtils.trimToNull(revenueRecord.getMemberId()));
    revenueRecord.setNote(StringUtils.trimToNull(revenueRecord.getNote()));
  }
}
