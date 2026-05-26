package com.cxisystem.feature.dao;

import com.cxisystem.jooq.tables.ScheduleEventType;
import com.cxisystem.jooq.tables.records.ScheduleEventTypeRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jooq.DSLContext;

/**
 * 予定種別マスタを扱う Dao です。 読み取り専用の一覧取得を支えます。
 */
@ApplicationScoped
public class ScheduleEventTypeDao extends AbstractDao<ScheduleEventTypeRecord, String> {

  /**
   * 予定種別マスタを扱う Dao を初期化します。
   *
   * @param dsl jOOQ DSLContext
   */
  @Inject
  public ScheduleEventTypeDao(DSLContext dsl) {
    super(dsl, ScheduleEventType.SCHEDULE_EVENT_TYPE, ScheduleEventType.SCHEDULE_EVENT_TYPE.CODE);
  }
}
