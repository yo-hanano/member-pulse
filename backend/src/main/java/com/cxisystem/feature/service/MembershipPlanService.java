package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.MembershipPlanDao;
import com.cxisystem.feature.input.MembershipPlanInput;
import com.cxisystem.feature.type.MembershipPlan;
import com.cxisystem.jooq.tables.records.MembershipPlanRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * 月額プランの業務操作をまとめるサービスです。マスタ管理の CRUD と入会処理のコース選択で利用します。
 */
@ApplicationScoped
public class MembershipPlanService
    extends AbstractService<MembershipPlanRecord, MembershipPlan, String, MembershipPlanDao> {

  @Inject
  MembershipPlanDao membershipPlanDao;

  /** 月額プラン操作に使う Dao を返します。 */
  @Override
  protected MembershipPlanDao getDao() {
    return membershipPlanDao;
  }

  /** 月額プラン変換先の型を返します。 */
  @Override
  protected Class<MembershipPlan> getTypeClass() {
    return MembershipPlan.class;
  }

  /** 募集中の月額プラン一覧を表示順で返します。 */
  @Rls
  @Transactional
  public List<MembershipPlan> findActivePlans() {
    return membershipPlanDao.findActivePlans().stream()
        .map(record -> record.into(MembershipPlan.class)).collect(Collectors.toList());
  }

  /** 停止中も含む全プラン一覧を表示順で返します。 */
  @Rls
  @Transactional
  public List<MembershipPlan> findAllPlans() {
    return membershipPlanDao.findAllOrdered().stream()
        .map(record -> record.into(MembershipPlan.class)).collect(Collectors.toList());
  }

  /** 削除済みも含めて指定 ID のプラン一覧を返します。契約履歴のプラン名表示で利用します。 */
  @Rls
  @Transactional
  public List<MembershipPlan> findByIdsIncludingDeleted(Set<String> ids) {
    return membershipPlanDao.findByIdsIncludingDeleted(ids).stream()
        .map(record -> record.into(MembershipPlan.class)).collect(Collectors.toList());
  }

  /** 月額プランを新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public MembershipPlan create(MembershipPlanInput input) {
    MembershipPlanRecord planRecord = newRecord(input);
    normalizeOptionalFields(planRecord);
    planRecord.store();
    planRecord.refresh();
    return planRecord.into(MembershipPlan.class);
  }

  /** 既存の月額プランを更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public MembershipPlan update(String id, MembershipPlanInput input) {
    MembershipPlanRecord planRecord = membershipPlanDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("membership plan not found: " + id));
    planRecord.from(input);
    normalizeOptionalFields(planRecord);
    planRecord.store();
    planRecord.refresh();
    return planRecord.into(MembershipPlan.class);
  }

  /** 月額プランを論理削除します。既存契約は契約側の monthly_fee を持つため影響しません。 */
  @Rls
  @Transactional
  public boolean deleteMembershipPlan(String id) {
    delete(id);
    return true;
  }

  private void normalizeOptionalFields(MembershipPlanRecord planRecord) {
    planRecord.setLocationId(StringUtils.trimToNull(planRecord.getLocationId()));
    planRecord.setNote(StringUtils.trimToNull(planRecord.getNote()));
    // 募集中フラグ未指定は募集中として扱う。
    if (planRecord.getActive() == null) {
      planRecord.setActive(true);
    }
  }
}
