package com.cxisystem.feature.service;

import com.cxisystem.feature.dao.ScheduleEventStatusDao;
import com.cxisystem.feature.type.ScheduleEventStatus;
import com.cxisystem.jooq.tables.records.ScheduleEventStatusRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * 予定ステータスマスタの読み取りをまとめるサービスです。 予定ステータス選択で使う取得処理を提供します。
 */
@ApplicationScoped
public class ScheduleEventStatusService extends
    AbstractService<ScheduleEventStatusRecord, ScheduleEventStatus, String, ScheduleEventStatusDao> {

  @Inject
  ScheduleEventStatusDao scheduleEventStatusDao;

  /** 予定ステータス操作に使う Dao を返します。 */
  @Override
  protected ScheduleEventStatusDao getDao() {
    return scheduleEventStatusDao;
  }

  /** 予定ステータスの変換先型を返します。 */
  @Override
  protected Class<ScheduleEventStatus> getTypeClass() {
    return ScheduleEventStatus.class;
  }
}
