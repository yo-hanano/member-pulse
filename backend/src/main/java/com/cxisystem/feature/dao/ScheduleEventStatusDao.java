package com.cxisystem.feature.dao;

import com.cxisystem.jooq.tables.ScheduleEventStatus;
import com.cxisystem.jooq.tables.records.ScheduleEventStatusRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jooq.DSLContext;

/**
 * 予定ステータスマスタを扱う Dao です。 読み取り専用の一覧取得を支えます。
 */
@ApplicationScoped
public class ScheduleEventStatusDao extends AbstractDao<ScheduleEventStatusRecord, String> {

  /**
   * 予定ステータスマスタを扱う Dao を初期化します。
   *
   * @param dsl jOOQ DSLContext
   */
  @Inject
  public ScheduleEventStatusDao(DSLContext dsl) {
    super(dsl, ScheduleEventStatus.SCHEDULE_EVENT_STATUS,
        ScheduleEventStatus.SCHEDULE_EVENT_STATUS.CODE);
  }
}
