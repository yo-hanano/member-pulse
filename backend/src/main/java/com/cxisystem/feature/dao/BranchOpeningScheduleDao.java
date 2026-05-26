package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.BranchOpeningSchedule.BRANCH_OPENING_SCHEDULE;

import com.cxisystem.jooq.tables.records.BranchOpeningScheduleRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/** 拠点通常開校スケジュールの参照 SQL をまとめる Dao です。 */
@ApplicationScoped
@NoArgsConstructor
public class BranchOpeningScheduleDao extends AbstractDao<BranchOpeningScheduleRecord, String> {

  /** 拠点通常開校スケジュールを扱う Dao を初期化します。 */
  @Inject
  public BranchOpeningScheduleDao(DSLContext dsl) {
    super(dsl, BRANCH_OPENING_SCHEDULE, BRANCH_OPENING_SCHEDULE.ID);
  }

  /** 指定拠点の未削除スケジュールを新しい適用開始日から返します。 */
  public List<BranchOpeningScheduleRecord> findByBranchId(String branchId) {
    return dsl.selectFrom(BRANCH_OPENING_SCHEDULE)
        .where(deletedCondition().and(BRANCH_OPENING_SCHEDULE.BRANCH_ID.eq(branchId)))
        .orderBy(BRANCH_OPENING_SCHEDULE.EFFECTIVE_FROM.desc()).fetch();
  }
}
