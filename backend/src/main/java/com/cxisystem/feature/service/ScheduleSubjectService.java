package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.ScheduleSubjectDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.ScheduleSubjectFilterInput;
import com.cxisystem.feature.input.ScheduleSubjectInput;
import com.cxisystem.feature.type.ScheduleSubject;
import com.cxisystem.jooq.tables.records.ScheduleSubjectRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 予定主体の業務操作をまとめるサービスです。 CRUD と検索、論理削除を扱います。
 */
@ApplicationScoped
public class ScheduleSubjectService
    extends AbstractService<ScheduleSubjectRecord, ScheduleSubject, String, ScheduleSubjectDao> {

  @Inject
  ScheduleSubjectDao scheduleSubjectDao;

  /** 予定主体操作に使う Dao を返します。 */
  @Override
  protected ScheduleSubjectDao getDao() {
    return scheduleSubjectDao;
  }

  /** 予定主体の変換先型を返します。 */
  @Override
  protected Class<ScheduleSubject> getTypeClass() {
    return ScheduleSubject.class;
  }

  /**
   * 条件付きの予定主体一覧をページ形式で返します。
   *
   * @param pagination ページング条件
   * @param filter 検索条件
   * @return 予定主体一覧
   */
  @Rls
  @Transactional
  public Page<ScheduleSubject> pagination(Pagination pagination,
      ScheduleSubjectFilterInput filter) {
    List<ScheduleSubject> scheduleSubjects = scheduleSubjectDao.pagination(pagination, filter)
        .stream().map(record -> record.into(ScheduleSubject.class)).collect(Collectors.toList());
    long total = scheduleSubjectDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(scheduleSubjects, pagination.getOffset(), pagination.getLimit(), total,
        totalPages);
  }

  /**
   * 予定主体を新規作成して、保存後の値を返します。
   *
   * @param input 作成入力
   * @return 作成した予定主体
   */
  @Rls
  @Transactional
  public ScheduleSubject create(ScheduleSubjectInput input) {
    validateSingleTarget(input);
    ScheduleSubjectRecord record = newRecord(input);
    record.setIsDeleted(false);
    record.store();
    record.refresh();
    return record.into(ScheduleSubject.class);
  }

  /**
   * 既存の予定主体を更新して、保存後の値を返します。
   *
   * @param id 予定主体ID
   * @param input 更新入力
   * @return 更新した予定主体
   */
  @Rls
  @Transactional
  public ScheduleSubject update(String id, ScheduleSubjectInput input) {
    validateSingleTarget(input);
    ScheduleSubjectRecord record = scheduleSubjectDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("schedule subject not found: " + id));
    record.setLeadId(input.getLeadId());
    record.setStudentId(input.getStudentId());
    record.setTeacherId(input.getTeacherId());
    record.setGuardianId(input.getGuardianId());
    record.setIsDeleted(false);
    record.store();
    record.refresh();
    return record.into(ScheduleSubject.class);
  }

  /**
   * 予定主体を論理削除します。
   *
   * @param id 予定主体ID
   * @return 削除成功なら true
   */
  @Rls
  @Transactional
  public boolean deleteScheduleSubject(String id) {
    delete(id);
    return true;
  }

  /**
   * 予定主体の入力が 1 対象だけを持つことを確認します。
   *
   * @param input 予定主体入力
   */
  private void validateSingleTarget(ScheduleSubjectInput input) {
    int targetCount = 0;
    if (input.getLeadId() != null && !input.getLeadId().isBlank()) {
      targetCount++;
    }
    if (input.getStudentId() != null && !input.getStudentId().isBlank()) {
      targetCount++;
    }
    if (input.getTeacherId() != null && !input.getTeacherId().isBlank()) {
      targetCount++;
    }
    if (input.getGuardianId() != null && !input.getGuardianId().isBlank()) {
      targetCount++;
    }
    if (targetCount != 1) {
      throw new IllegalArgumentException("schedule subject must have exactly one target");
    }
  }
}
