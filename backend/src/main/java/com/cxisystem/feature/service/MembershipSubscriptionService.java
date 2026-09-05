package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.MemberDao;
import com.cxisystem.feature.dao.MembershipPlanDao;
import com.cxisystem.feature.dao.MembershipSubscriptionDao;
import com.cxisystem.feature.input.MembershipSubscriptionInput;
import com.cxisystem.feature.input.MembershipSubscriptionUpdateInput;
import com.cxisystem.feature.type.MembershipSubscription;
import com.cxisystem.jooq.tables.records.MembershipPlanRecord;
import com.cxisystem.jooq.tables.records.MembershipSubscriptionRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * コース契約の業務操作をまとめるサービスです。1会員1契約の方針のもと、
 * プラン変更・休会・再開・契約終了と履歴参照を扱います。会員ステータスとは連動しません。
 */
@ApplicationScoped
public class MembershipSubscriptionService extends
    AbstractService<MembershipSubscriptionRecord, MembershipSubscription, String, MembershipSubscriptionDao> {

  private static final String STATUS_ACTIVE = "active";
  private static final String STATUS_PAUSED = "paused";
  private static final String STATUS_ENDED = "ended";

  @Inject
  MembershipSubscriptionDao membershipSubscriptionDao;

  @Inject
  MembershipPlanDao membershipPlanDao;

  @Inject
  MemberDao memberDao;

  /** コース契約操作に使う Dao を返します。 */
  @Override
  protected MembershipSubscriptionDao getDao() {
    return membershipSubscriptionDao;
  }

  /** コース契約変換先の型を返します。 */
  @Override
  protected Class<MembershipSubscription> getTypeClass() {
    return MembershipSubscription.class;
  }

  /** 会員のコース契約履歴を新しい順で返します。 */
  @Rls
  @Transactional
  public List<MembershipSubscription> findByMemberId(String memberId) {
    return membershipSubscriptionDao.findByMemberIdOrdered(memberId).stream()
        .map(record -> record.into(MembershipSubscription.class)).collect(Collectors.toList());
  }

  /**
   * プラン変更を行います。コースの切れ目は月単位とし、新契約の開始日は月初に限定します。
   * アクティブ契約があれば新契約の開始月の前月末で終了し、新契約を同一トランザクションで開始します。
   * アクティブ契約がない会員（契約終了後の再契約）は新契約の開始のみ行います。
   */
  @Rls
  @Transactional
  public MembershipSubscription changeMembershipPlan(String memberId,
      MembershipSubscriptionInput input) {
    memberDao.findOptionalById(memberId)
        .orElseThrow(() -> new NotFoundException("member not found: " + memberId));

    // コースの切れ目は月単位。新契約の開始日は月初に限定する（旧契約は前月末で終了する）。
    if (input.getStartDate().getDayOfMonth() != 1) {
      throw new BadRequestException("start date must be the first day of a month: " + memberId);
    }

    membershipSubscriptionDao.findActiveByMemberId(memberId).ifPresent(current -> {
      // 切替月の前月末まで旧契約が有効。同日以前への切替は履歴が壊れるため拒否する。
      if (!input.getStartDate().isAfter(current.getStartDate())) {
        throw new BadRequestException(
            "switch date must be after current subscription start date: " + memberId);
      }
      current.setStatus(STATUS_ENDED);
      current.setEndDate(input.getStartDate().minusDays(1));
      current.store();
    });

    return createSubscription(memberId, input).into(MembershipSubscription.class);
  }

  /** 契約を休会にします。契約中の契約のみ休会できます。 */
  @Rls
  @Transactional
  public MembershipSubscription pause(String id) {
    MembershipSubscriptionRecord subscriptionRecord = findRecord(id);
    if (!STATUS_ACTIVE.equals(subscriptionRecord.getStatus())) {
      throw new BadRequestException("subscription is not active: " + id);
    }
    subscriptionRecord.setStatus(STATUS_PAUSED);
    subscriptionRecord.store();
    subscriptionRecord.refresh();
    return subscriptionRecord.into(MembershipSubscription.class);
  }

  /** 休会中の契約を再開します。 */
  @Rls
  @Transactional
  public MembershipSubscription resume(String id) {
    MembershipSubscriptionRecord subscriptionRecord = findRecord(id);
    if (!STATUS_PAUSED.equals(subscriptionRecord.getStatus())) {
      throw new BadRequestException("subscription is not paused: " + id);
    }
    subscriptionRecord.setStatus(STATUS_ACTIVE);
    subscriptionRecord.store();
    subscriptionRecord.refresh();
    return subscriptionRecord.into(MembershipSubscription.class);
  }

  /**
   * 契約を終了日付きで終了します。コースの切れ目は月単位とし、終了日は月末に限定します。
   * 会員ステータス（退会）は連動せず、別途会員側で操作します。
   */
  @Rls
  @Transactional
  public MembershipSubscription end(String id, LocalDate endDate) {
    MembershipSubscriptionRecord subscriptionRecord = findRecord(id);
    if (STATUS_ENDED.equals(subscriptionRecord.getStatus())) {
      throw new BadRequestException("subscription is already ended: " + id);
    }
    // 契約終了は月末締めに限定する（コースの切れ目は月単位）。
    if (endDate.getDayOfMonth() != endDate.lengthOfMonth()) {
      throw new BadRequestException("end date must be the last day of a month: " + id);
    }
    if (endDate.isBefore(subscriptionRecord.getStartDate())) {
      throw new BadRequestException("end date must be on or after start date: " + id);
    }
    subscriptionRecord.setStatus(STATUS_ENDED);
    subscriptionRecord.setEndDate(endDate);
    subscriptionRecord.store();
    subscriptionRecord.refresh();
    return subscriptionRecord.into(MembershipSubscription.class);
  }

  /** 契約の月額とメモを修正します。状態や期間はプラン変更・休会・終了の各操作で扱います。 */
  @Rls
  @Transactional
  public MembershipSubscription update(String id, MembershipSubscriptionUpdateInput input) {
    MembershipSubscriptionRecord subscriptionRecord = findRecord(id);
    subscriptionRecord.setMonthlyFee(input.getMonthlyFee());
    subscriptionRecord.setNote(StringUtils.trimToNull(input.getNote()));
    subscriptionRecord.store();
    subscriptionRecord.refresh();
    return subscriptionRecord.into(MembershipSubscription.class);
  }

  /** 契約レコードを取得し、存在しなければ NotFound を返します。 */
  private MembershipSubscriptionRecord findRecord(String id) {
    return membershipSubscriptionDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("membership subscription not found: " + id));
  }

  /** 新しいコース契約を作成します。月額未指定時はプランの月額を適用します。 */
  private MembershipSubscriptionRecord createSubscription(String memberId,
      MembershipSubscriptionInput input) {
    MembershipPlanRecord planRecord = membershipPlanDao
        .findOptionalById(input.getMembershipPlanId()).orElseThrow(() -> new NotFoundException(
            "membership plan not found: " + input.getMembershipPlanId()));
    if (!Boolean.TRUE.equals(planRecord.getActive())) {
      throw new BadRequestException("membership plan is not active: " + planRecord.getId());
    }

    MembershipSubscriptionRecord subscriptionRecord = newRecord();
    subscriptionRecord.setMemberId(memberId);
    subscriptionRecord.setMembershipPlanId(planRecord.getId());
    subscriptionRecord.setStartDate(input.getStartDate());
    subscriptionRecord.setStatus(STATUS_ACTIVE);
    subscriptionRecord.setMonthlyFee(
        input.getMonthlyFee() != null ? input.getMonthlyFee() : planRecord.getMonthlyFee());
    subscriptionRecord.setNote(StringUtils.trimToNull(input.getNote()));
    subscriptionRecord.store();
    subscriptionRecord.refresh();
    return subscriptionRecord;
  }
}
