package com.cxisystem.feature.service;

import com.cxisystem.feature.dao.ScheduleEventTypeDao;
import com.cxisystem.feature.type.ScheduleEventType;
import com.cxisystem.jooq.tables.records.ScheduleEventTypeRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * 予定種別マスタの読み取りをまとめるサービスです。 予定種別選択で使う取得処理を提供します。
 */
@ApplicationScoped
public class ScheduleEventTypeService extends
    AbstractService<ScheduleEventTypeRecord, ScheduleEventType, String, ScheduleEventTypeDao> {

  @Inject
  ScheduleEventTypeDao scheduleEventTypeDao;

  /** 予定種別操作に使う Dao を返します。 */
  @Override
  protected ScheduleEventTypeDao getDao() {
    return scheduleEventTypeDao;
  }

  /** 予定種別の変換先型を返します。 */
  @Override
  protected Class<ScheduleEventType> getTypeClass() {
    return ScheduleEventType.class;
  }
}
