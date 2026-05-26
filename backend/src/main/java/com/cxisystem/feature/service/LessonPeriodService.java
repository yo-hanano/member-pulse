package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.LessonPeriodDao;
import com.cxisystem.feature.input.LessonPeriodInput;
import com.cxisystem.feature.type.LessonPeriod;
import com.cxisystem.jooq.tables.records.LessonPeriodRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/** 会社別時限マスタの登録、更新、削除をまとめるサービスです。 */
@ApplicationScoped
public class LessonPeriodService
    extends AbstractService<LessonPeriodRecord, LessonPeriod, String, LessonPeriodDao> {

  @Inject
  LessonPeriodDao lessonPeriodDao;

  /** 時限操作に使う Dao を返します。 */
  @Override
  protected LessonPeriodDao getDao() {
    return lessonPeriodDao;
  }

  /** 時限変換先の型を返します。 */
  @Override
  protected Class<LessonPeriod> getTypeClass() {
    return LessonPeriod.class;
  }

  /** 時限を新規作成して保存後の値を返します。 */
  @Rls
  @Transactional
  public LessonPeriod create(LessonPeriodInput input) {
    LessonPeriodRecord record = newRecord(input);
    record.setIsDeleted(false);
    record.store();
    record.refresh();
    return record.into(LessonPeriod.class);
  }

  /** 既存時限を更新して保存後の値を返します。 */
  @Rls
  @Transactional
  public LessonPeriod update(String id, LessonPeriodInput input) {
    LessonPeriodRecord record = lessonPeriodDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("lesson period not found: " + id));
    record.from(input);
    record.store();
    record.refresh();
    return record.into(LessonPeriod.class);
  }

  /** 時限を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteLessonPeriod(String id) {
    delete(id);
    return true;
  }
}
