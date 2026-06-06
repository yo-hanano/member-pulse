package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.feature.dao.MembershipPlanDao;
import com.cxisystem.feature.type.MembershipPlan;
import com.cxisystem.jooq.tables.records.MembershipPlanRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 月額プランの参照操作をまとめるサービスです。入会処理のコース選択などで利用します。
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
}
