package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.BranchLessonPeriodTimeSet.BRANCH_LESSON_PERIOD_TIME_SET;
import static com.cxisystem.jooq.tables.BranchOpeningScheduleDay.BRANCH_OPENING_SCHEDULE_DAY;
import static com.cxisystem.jooq.tables.BranchOpeningSchedulePeriod.BRANCH_OPENING_SCHEDULE_PERIOD;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.BranchOpeningScheduleDao;
import com.cxisystem.feature.input.BranchOpeningScheduleInput;
import com.cxisystem.feature.input.OpeningScheduleDayInput;
import com.cxisystem.feature.input.OpeningSchedulePeriodInput;
import com.cxisystem.feature.type.BranchOpeningSchedule;
import com.cxisystem.feature.type.BranchOpeningScheduleDetail;
import com.cxisystem.feature.type.OpeningScheduleDay;
import com.cxisystem.feature.type.OpeningSchedulePeriod;
import com.cxisystem.jooq.tables.records.BranchOpeningScheduleDayRecord;
import com.cxisystem.jooq.tables.records.BranchOpeningSchedulePeriodRecord;
import com.cxisystem.jooq.tables.records.BranchOpeningScheduleRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** 拠点の期間付き通常開校スケジュールを親子まとめて管理するサービスです。 */
@ApplicationScoped
public class BranchOpeningScheduleService extends
    AbstractService<BranchOpeningScheduleRecord, BranchOpeningSchedule, String, BranchOpeningScheduleDao> {

  @Inject
  BranchOpeningScheduleDao scheduleDao;

  /** 拠点通常開校スケジュール操作に使う Dao を返します。 */
  @Override
  protected BranchOpeningScheduleDao getDao() {
    return scheduleDao;
  }

  /** 拠点通常開校スケジュール変換先の型を返します。 */
  @Override
  protected Class<BranchOpeningSchedule> getTypeClass() {
    return BranchOpeningSchedule.class;
  }

  /** 指定拠点の通常開校スケジュール一覧を返します。 */
  @Rls
  @Transactional
  public List<BranchOpeningSchedule> findByBranchId(String branchId) {
    return scheduleDao.findByBranchId(branchId).stream()
        .map(record -> record.into(BranchOpeningSchedule.class)).collect(Collectors.toList());
  }

  /** 曜日と時限を含む通常開校スケジュール詳細を返します。 */
  @Rls
  @Transactional
  public BranchOpeningScheduleDetail findDetail(String id) {
    BranchOpeningScheduleRecord schedule = scheduleDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("branch opening schedule not found: " + id));
    return toDetail(schedule);
  }

  /** 通常開校スケジュールを親子まとめて作成します。 */
  @Rls
  @Transactional
  public BranchOpeningScheduleDetail create(BranchOpeningScheduleInput input) {
    validateDays(input.getDays());
    validateTimeSet(input.getBranchId(), input.getTimeSetId());
    BranchOpeningScheduleRecord schedule = newRecord();
    schedule.setBranchId(input.getBranchId());
    schedule.setEffectiveFrom(input.getEffectiveFrom());
    schedule.setEffectiveTo(input.getEffectiveTo());
    schedule.setTimeSetId(input.getTimeSetId());
    schedule.setNote(input.getNote());
    schedule.setIsDeleted(false);
    schedule.store();
    saveDays(schedule.getId(), input.getDays());
    schedule.refresh();
    return toDetail(schedule);
  }

  /** 通常開校スケジュールを親子まとめて更新します。 */
  @Rls
  @Transactional
  public BranchOpeningScheduleDetail update(String id, BranchOpeningScheduleInput input) {
    validateDays(input.getDays());
    validateTimeSet(input.getBranchId(), input.getTimeSetId());
    BranchOpeningScheduleRecord schedule = scheduleDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("branch opening schedule not found: " + id));
    schedule.setBranchId(input.getBranchId());
    schedule.setEffectiveFrom(input.getEffectiveFrom());
    schedule.setEffectiveTo(input.getEffectiveTo());
    schedule.setTimeSetId(input.getTimeSetId());
    schedule.setNote(input.getNote());
    schedule.store();
    replaceDays(id, input.getDays());
    schedule.refresh();
    return toDetail(schedule);
  }

  /** 通常開校スケジュールを論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteSchedule(String id) {
    delete(id);
    return true;
  }

  /** スケジュール親子を画面向けの入れ子構造へ変換します。 */
  private BranchOpeningScheduleDetail toDetail(BranchOpeningScheduleRecord schedule) {
    List<OpeningScheduleDay> days = new ArrayList<>();
    List<BranchOpeningScheduleDayRecord> dayRecords = dsl().selectFrom(BRANCH_OPENING_SCHEDULE_DAY)
        .where(BRANCH_OPENING_SCHEDULE_DAY.BRANCH_OPENING_SCHEDULE_ID.eq(schedule.getId())
            .and(BRANCH_OPENING_SCHEDULE_DAY.IS_DELETED.isFalse()))
        .orderBy(BRANCH_OPENING_SCHEDULE_DAY.WEEKDAY.asc()).fetch();

    for (BranchOpeningScheduleDayRecord day : dayRecords) {
      List<OpeningSchedulePeriod> periods = dsl().selectFrom(BRANCH_OPENING_SCHEDULE_PERIOD)
          .where(BRANCH_OPENING_SCHEDULE_PERIOD.BRANCH_OPENING_SCHEDULE_DAY_ID.eq(day.getId())
              .and(BRANCH_OPENING_SCHEDULE_PERIOD.IS_DELETED.isFalse()))
          .orderBy(BRANCH_OPENING_SCHEDULE_PERIOD.LESSON_PERIOD_ID.asc())
          .fetch(record -> new OpeningSchedulePeriod(record.getLessonPeriodId()));
      days.add(new OpeningScheduleDay(day.getWeekday(), day.getIsOpen(), periods));
    }

    return new BranchOpeningScheduleDetail(schedule.getId(), schedule.getBranchId(),
        schedule.getEffectiveFrom(), schedule.getEffectiveTo(), schedule.getTimeSetId(),
        schedule.getNote(), days);
  }

  /** スケジュール配下の曜日と時限を差し替えます。 */
  private void replaceDays(String scheduleId, List<OpeningScheduleDayInput> days) {
    List<String> dayIds =
        dsl().select(BRANCH_OPENING_SCHEDULE_DAY.ID).from(BRANCH_OPENING_SCHEDULE_DAY)
            .where(BRANCH_OPENING_SCHEDULE_DAY.BRANCH_OPENING_SCHEDULE_ID.eq(scheduleId))
            .fetch(BRANCH_OPENING_SCHEDULE_DAY.ID);
    if (!dayIds.isEmpty()) {
      dsl().deleteFrom(BRANCH_OPENING_SCHEDULE_PERIOD)
          .where(BRANCH_OPENING_SCHEDULE_PERIOD.BRANCH_OPENING_SCHEDULE_DAY_ID.in(dayIds))
          .execute();
    }
    dsl().deleteFrom(BRANCH_OPENING_SCHEDULE_DAY)
        .where(BRANCH_OPENING_SCHEDULE_DAY.BRANCH_OPENING_SCHEDULE_ID.eq(scheduleId)).execute();
    saveDays(scheduleId, days);
  }

  /** スケジュール配下の曜日と ON 時限を保存します。 */
  private void saveDays(String scheduleId, List<OpeningScheduleDayInput> days) {
    if (days == null) {
      return;
    }
    for (OpeningScheduleDayInput input : days) {
      BranchOpeningScheduleDayRecord day = dsl().newRecord(BRANCH_OPENING_SCHEDULE_DAY);
      day.setBranchOpeningScheduleId(scheduleId);
      day.setWeekday(input.getWeekday());
      day.setIsOpen(input.getIsOpen());
      day.setIsDeleted(false);
      day.store();
      if (Boolean.TRUE.equals(input.getIsOpen())) {
        savePeriods(day.getId(), input.getPeriods());
      }
    }
  }

  /** 開校曜日に紐づく ON 時限を保存します。 */
  private void savePeriods(String dayId, List<OpeningSchedulePeriodInput> periods) {
    if (periods == null) {
      return;
    }
    for (OpeningSchedulePeriodInput input : periods) {
      BranchOpeningSchedulePeriodRecord period = dsl().newRecord(BRANCH_OPENING_SCHEDULE_PERIOD);
      period.setBranchOpeningScheduleDayId(dayId);
      period.setLessonPeriodId(input.getLessonPeriodId());
      period.setIsDeleted(false);
      period.store();
    }
  }

  /** 曜日と時限の重複を入力境界で弾きます。 */
  private void validateDays(List<OpeningScheduleDayInput> days) {
    Set<Short> weekdays = new HashSet<>();
    if (days == null) {
      return;
    }
    for (OpeningScheduleDayInput day : days) {
      if (!weekdays.add(day.getWeekday())) {
        throw new ValidationException("weekday is duplicated: " + day.getWeekday());
      }
      Set<String> lessonPeriodIds = new HashSet<>();
      if (day.getPeriods() == null) {
        continue;
      }
      for (OpeningSchedulePeriodInput period : day.getPeriods()) {
        if (!lessonPeriodIds.add(period.getLessonPeriodId())) {
          throw new ValidationException(
              "lesson period is duplicated in weekday: " + period.getLessonPeriodId());
        }
      }
    }
  }

  /** 指定された時刻セットが同じ拠点に属していることを確認します。 */
  private void validateTimeSet(String branchId, String timeSetId) {
    if (timeSetId == null || timeSetId.isBlank()) {
      return;
    }
    boolean exists = dsl().fetchExists(dsl().selectOne().from(BRANCH_LESSON_PERIOD_TIME_SET)
        .where(BRANCH_LESSON_PERIOD_TIME_SET.ID.eq(timeSetId)
            .and(BRANCH_LESSON_PERIOD_TIME_SET.BRANCH_ID.eq(branchId))
            .and(BRANCH_LESSON_PERIOD_TIME_SET.IS_DELETED.isFalse())));
    if (!exists) {
      throw new ValidationException("time set does not belong to branch: " + timeSetId);
    }
  }
}
