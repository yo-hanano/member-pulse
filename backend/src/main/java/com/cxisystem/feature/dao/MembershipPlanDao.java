package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.MembershipPlan.MEMBERSHIP_PLAN;

import com.cxisystem.jooq.tables.records.MembershipPlanRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Set;
import lombok.NoArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;

/**
 * 月額プランの取得 SQL をまとめる Dao です。 membership_plan は deleted_at による論理削除を使います。
 */
@ApplicationScoped
@NoArgsConstructor
public class MembershipPlanDao extends AbstractDao<MembershipPlanRecord, String> {

  /** 月額プランテーブルを扱う Dao を初期化します。 */
  @Inject
  public MembershipPlanDao(DSLContext dsl) {
    super(dsl, MEMBERSHIP_PLAN, MEMBERSHIP_PLAN.ID);
  }

  /** deleted_at が未設定のプランだけを有効データとして扱います。 */
  @Override
  protected Condition deletedCondition() {
    return MEMBERSHIP_PLAN.DELETED_AT.isNull();
  }

  /** 募集中のプランを表示順で返します。 */
  public List<MembershipPlanRecord> findActivePlans() {
    return dsl.selectFrom(MEMBERSHIP_PLAN)
        .where(deletedCondition().and(MEMBERSHIP_PLAN.ACTIVE.isTrue()))
        .orderBy(MEMBERSHIP_PLAN.DISPLAY_ORDER.asc().nullsLast(), MEMBERSHIP_PLAN.NAME.asc())
        .fetch();
  }

  /** 停止中も含む全プランを表示順で返します。マスタ管理画面で利用します。 */
  public List<MembershipPlanRecord> findAllOrdered() {
    return dsl.selectFrom(MEMBERSHIP_PLAN).where(deletedCondition())
        .orderBy(MEMBERSHIP_PLAN.DISPLAY_ORDER.asc().nullsLast(), MEMBERSHIP_PLAN.NAME.asc())
        .fetch();
  }

  /** 削除済みも含めて指定 ID のプランを返します。契約履歴のプラン名表示で利用します。 */
  public List<MembershipPlanRecord> findByIdsIncludingDeleted(Set<String> ids) {
    return dsl.selectFrom(MEMBERSHIP_PLAN).where(MEMBERSHIP_PLAN.ID.in(ids)).fetch();
  }
}
