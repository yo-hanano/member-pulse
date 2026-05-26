package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.BranchLessonPeriodTime.BRANCH_LESSON_PERIOD_TIME;
import static com.cxisystem.jooq.tables.BranchOpeningSchedule.BRANCH_OPENING_SCHEDULE;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.BranchLessonPeriodTimeSetDao;
import com.cxisystem.feature.input.BranchLessonPeriodTimeInput;
import com.cxisystem.feature.input.BranchLessonPeriodTimeSetInput;
import com.cxisystem.feature.type.BranchLessonPeriodTime;
import com.cxisystem.feature.type.BranchLessonPeriodTimeSet;
import com.cxisystem.feature.type.BranchLessonPeriodTimeSetDetail;
import com.cxisystem.jooq.tables.records.BranchLessonPeriodTimeRecord;
import com.cxisystem.jooq.tables.records.BranchLessonPeriodTimeSetRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** 拠点時限時刻セットを親子まとめて管理するサービスです。 */
@ApplicationScoped
public class BranchLessonPeriodTimeSetService extends
    AbstractService<BranchLessonPeriodTimeSetRecord, BranchLessonPeriodTimeSet, String, BranchLessonPeriodTimeSetDao> {

  @Inject
  BranchLessonPeriodTimeSetDao timeSetDao;

  /** 拠点時限時刻セット操作に使う Dao を返します。 */
  @Override
  protected BranchLessonPeriodTimeSetDao getDao() {
    return timeSetDao;
  }

  /** 拠点時限時刻セット変換先の型を返します。 */
  @Override
  protected Class<BranchLessonPeriodTimeSet> getTypeClass() {
    return BranchLessonPeriodTimeSet.class;
  }

  /** 指定拠点の時限時刻セット一覧を返します。 */
  @Rls
  @Transactional
  public List<BranchLessonPeriodTimeSet> findByBranchId(String branchId) {
    return timeSetDao.findByBranchId(branchId).stream()
        .map(record -> record.into(BranchLessonPeriodTimeSet.class)).collect(Collectors.toList());
  }

  /** 時限別時刻を含む時刻セット詳細を返します。 */
  @Rls
  @Transactional
  public BranchLessonPeriodTimeSetDetail findDetail(String id) {
    BranchLessonPeriodTimeSetRecord timeSet = timeSetDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("branch lesson period time set not found: " + id));
    return toDetail(timeSet);
  }

  /** 時刻セットを親子まとめて作成します。 */
  @Rls
  @Transactional
  public BranchLessonPeriodTimeSetDetail create(BranchLessonPeriodTimeSetInput input) {
    validateTimes(input.getTimes());
    BranchLessonPeriodTimeSetRecord timeSet = newRecord();
    timeSet.setBranchId(input.getBranchId());
    timeSet.setName(input.getName());
    timeSet.setNote(input.getNote());
    timeSet.setIsDeleted(false);
    timeSet.store();
    saveTimes(timeSet.getId(), input.getTimes());
    timeSet.refresh();
    return toDetail(timeSet);
  }

  /** 時刻セットを親子まとめて更新します。 */
  @Rls
  @Transactional
  public BranchLessonPeriodTimeSetDetail update(String id, BranchLessonPeriodTimeSetInput input) {
    validateTimes(input.getTimes());
    BranchLessonPeriodTimeSetRecord timeSet = timeSetDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("branch lesson period time set not found: " + id));
    timeSet.setBranchId(input.getBranchId());
    timeSet.setName(input.getName());
    timeSet.setNote(input.getNote());
    timeSet.store();
    replaceTimes(id, input.getTimes());
    timeSet.refresh();
    return toDetail(timeSet);
  }

  /** 時刻セットを論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteTimeSet(String id) {
    validateUnused(id);
    delete(id);
    return true;
  }

  /** 利用中の時刻セットが論理削除されないよう確認します。 */
  private void validateUnused(String id) {
    boolean used = dsl().fetchExists(
        dsl().selectOne().from(BRANCH_OPENING_SCHEDULE).where(BRANCH_OPENING_SCHEDULE.TIME_SET_ID
            .eq(id).and(BRANCH_OPENING_SCHEDULE.IS_DELETED.isFalse())));
    if (used) {
      throw new ValidationException("time set is used by branch opening schedule: " + id);
    }
  }

  /** 時刻セット親子を画面向け詳細へ変換します。 */
  private BranchLessonPeriodTimeSetDetail toDetail(BranchLessonPeriodTimeSetRecord timeSet) {
    List<BranchLessonPeriodTime> times = dsl().selectFrom(BRANCH_LESSON_PERIOD_TIME)
        .where(BRANCH_LESSON_PERIOD_TIME.TIME_SET_ID.eq(timeSet.getId())
            .and(BRANCH_LESSON_PERIOD_TIME.IS_DELETED.isFalse()))
        .orderBy(BRANCH_LESSON_PERIOD_TIME.START_TIME.asc())
        .fetch(record -> new BranchLessonPeriodTime(record.getId(), record.getLessonPeriodId(),
            record.getStartTime(), record.getEndTime()));
    return new BranchLessonPeriodTimeSetDetail(timeSet.getId(), timeSet.getBranchId(),
        timeSet.getName(), timeSet.getNote(), times);
  }

  /** 時刻セット配下の時限別時刻を差し替えます。 */
  private void replaceTimes(String timeSetId, List<BranchLessonPeriodTimeInput> times) {
    dsl().deleteFrom(BRANCH_LESSON_PERIOD_TIME)
        .where(BRANCH_LESSON_PERIOD_TIME.TIME_SET_ID.eq(timeSetId)).execute();
    saveTimes(timeSetId, times);
  }

  /** 時刻セット配下の時限別時刻を保存します。 */
  private void saveTimes(String timeSetId, List<BranchLessonPeriodTimeInput> times) {
    if (times == null) {
      return;
    }
    for (BranchLessonPeriodTimeInput input : times) {
      BranchLessonPeriodTimeRecord time = dsl().newRecord(BRANCH_LESSON_PERIOD_TIME);
      time.setTimeSetId(timeSetId);
      time.setLessonPeriodId(input.getLessonPeriodId());
      time.setStartTime(input.getStartTime());
      time.setEndTime(input.getEndTime());
      time.setIsDeleted(false);
      time.store();
    }
  }

  /** 時限重複と時刻順を入力境界で確認します。 */
  private void validateTimes(List<BranchLessonPeriodTimeInput> times) {
    Set<String> lessonPeriodIds = new HashSet<>();
    if (times == null) {
      return;
    }
    for (BranchLessonPeriodTimeInput time : times) {
      if (!lessonPeriodIds.add(time.getLessonPeriodId())) {
        throw new ValidationException("lesson period is duplicated: " + time.getLessonPeriodId());
      }
      validateTime(time.getStartTime(), time.getEndTime());
    }
  }

  /** 開始時刻より終了時刻が後であることを確認します。 */
  private void validateTime(LocalTime startTime, LocalTime endTime) {
    if (!startTime.isBefore(endTime)) {
      throw new ValidationException("lesson period time start time must be before end time");
    }
  }
}
