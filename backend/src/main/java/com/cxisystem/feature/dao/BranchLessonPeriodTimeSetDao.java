package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.BranchLessonPeriodTimeSet.BRANCH_LESSON_PERIOD_TIME_SET;

import com.cxisystem.jooq.tables.records.BranchLessonPeriodTimeSetRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/** 拠点時限時刻セットの参照 SQL をまとめる Dao です。 */
@ApplicationScoped
@NoArgsConstructor
public class BranchLessonPeriodTimeSetDao
    extends AbstractDao<BranchLessonPeriodTimeSetRecord, String> {

  /** 拠点時限時刻セットを扱う Dao を初期化します。 */
  @Inject
  public BranchLessonPeriodTimeSetDao(DSLContext dsl) {
    super(dsl, BRANCH_LESSON_PERIOD_TIME_SET, BRANCH_LESSON_PERIOD_TIME_SET.ID);
  }

  /** 指定拠点の未削除時刻セットを名前順で返します。 */
  public List<BranchLessonPeriodTimeSetRecord> findByBranchId(String branchId) {
    return dsl.selectFrom(BRANCH_LESSON_PERIOD_TIME_SET)
        .where(deletedCondition().and(BRANCH_LESSON_PERIOD_TIME_SET.BRANCH_ID.eq(branchId)))
        .orderBy(BRANCH_LESSON_PERIOD_TIME_SET.NAME.asc()).fetch();
  }
}
