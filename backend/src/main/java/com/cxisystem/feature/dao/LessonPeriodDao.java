package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.LessonPeriod.LESSON_PERIOD;

import com.cxisystem.jooq.tables.records.LessonPeriodRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.SortField;

/** 時限マスタの参照 SQL をまとめる Dao です。 */
@ApplicationScoped
@NoArgsConstructor
public class LessonPeriodDao extends AbstractDao<LessonPeriodRecord, String> {

  /** 時限マスタを扱う Dao を初期化します。 */
  @Inject
  public LessonPeriodDao(DSLContext dsl) {
    super(dsl, LESSON_PERIOD, LESSON_PERIOD.ID);
  }

  /** 表示順を既定の取得順にします。 */
  @Override
  protected SortField<?> defaultOrderBy() {
    return LESSON_PERIOD.DISP_ORDER.asc();
  }
}
