package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.BranchOpeningScheduleTemplateDay.BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY;
import static com.cxisystem.jooq.tables.BranchOpeningScheduleTemplatePeriod.BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.BranchOpeningScheduleTemplateDao;
import com.cxisystem.feature.input.BranchOpeningScheduleTemplateInput;
import com.cxisystem.feature.input.OpeningScheduleDayInput;
import com.cxisystem.feature.input.OpeningSchedulePeriodInput;
import com.cxisystem.feature.type.BranchOpeningScheduleTemplate;
import com.cxisystem.feature.type.BranchOpeningScheduleTemplateDetail;
import com.cxisystem.feature.type.OpeningScheduleDay;
import com.cxisystem.feature.type.OpeningSchedulePeriod;
import com.cxisystem.jooq.tables.records.BranchOpeningScheduleTemplateDayRecord;
import com.cxisystem.jooq.tables.records.BranchOpeningScheduleTemplatePeriodRecord;
import com.cxisystem.jooq.tables.records.BranchOpeningScheduleTemplateRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** 会社別の開校スケジュールテンプレートを親子まとめて管理するサービスです。 */
@ApplicationScoped
public class BranchOpeningScheduleTemplateService extends
    AbstractService<BranchOpeningScheduleTemplateRecord, BranchOpeningScheduleTemplate, String, BranchOpeningScheduleTemplateDao> {

  @Inject
  BranchOpeningScheduleTemplateDao templateDao;

  /** テンプレート操作に使う Dao を返します。 */
  @Override
  protected BranchOpeningScheduleTemplateDao getDao() {
    return templateDao;
  }

  /** テンプレート変換先の型を返します。 */
  @Override
  protected Class<BranchOpeningScheduleTemplate> getTypeClass() {
    return BranchOpeningScheduleTemplate.class;
  }

  /** 曜日と時限を含むテンプレート詳細を返します。 */
  @Rls
  @Transactional
  public BranchOpeningScheduleTemplateDetail findDetail(String id) {
    BranchOpeningScheduleTemplateRecord template = templateDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("opening template not found: " + id));
    return toDetail(template);
  }

  /** テンプレートを親子まとめて作成します。 */
  @Rls
  @Transactional
  public BranchOpeningScheduleTemplateDetail create(BranchOpeningScheduleTemplateInput input) {
    validateDays(input.getDays());
    BranchOpeningScheduleTemplateRecord template = newRecord();
    template.setName(input.getName());
    template.setNote(input.getNote());
    template.setIsDeleted(false);
    template.store();
    saveDays(template.getId(), input.getDays());
    template.refresh();
    return toDetail(template);
  }

  /** テンプレートを親子まとめて更新します。 */
  @Rls
  @Transactional
  public BranchOpeningScheduleTemplateDetail update(String id,
      BranchOpeningScheduleTemplateInput input) {
    validateDays(input.getDays());
    BranchOpeningScheduleTemplateRecord template = templateDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("opening template not found: " + id));
    template.setName(input.getName());
    template.setNote(input.getNote());
    template.store();
    replaceDays(id, input.getDays());
    template.refresh();
    return toDetail(template);
  }

  /** テンプレートを論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteTemplate(String id) {
    delete(id);
    return true;
  }

  /** テンプレート親子を画面向けの入れ子構造へ変換します。 */
  private BranchOpeningScheduleTemplateDetail toDetail(
      BranchOpeningScheduleTemplateRecord template) {
    List<OpeningScheduleDay> days = new ArrayList<>();
    List<BranchOpeningScheduleTemplateDayRecord> dayRecords =
        dsl().selectFrom(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY)
            .where(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.TEMPLATE_ID.eq(template.getId())
                .and(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.IS_DELETED.isFalse()))
            .orderBy(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.WEEKDAY.asc()).fetch();

    for (BranchOpeningScheduleTemplateDayRecord day : dayRecords) {
      List<OpeningSchedulePeriod> periods =
          dsl().selectFrom(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD)
              .where(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD.TEMPLATE_DAY_ID.eq(day.getId())
                  .and(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD.IS_DELETED.isFalse()))
              .orderBy(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD.LESSON_PERIOD_ID.asc())
              .fetch(record -> new OpeningSchedulePeriod(record.getLessonPeriodId()));
      days.add(new OpeningScheduleDay(day.getWeekday(), day.getIsOpen(), periods));
    }

    return new BranchOpeningScheduleTemplateDetail(template.getId(), template.getName(),
        template.getNote(), days);
  }

  /** テンプレート配下の曜日と時限を差し替えます。 */
  private void replaceDays(String templateId, List<OpeningScheduleDayInput> days) {
    List<String> dayIds = dsl().select(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.ID)
        .from(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY)
        .where(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.TEMPLATE_ID.eq(templateId))
        .fetch(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.ID);
    if (!dayIds.isEmpty()) {
      dsl().deleteFrom(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD)
          .where(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD.TEMPLATE_DAY_ID.in(dayIds)).execute();
    }
    dsl().deleteFrom(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY)
        .where(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY.TEMPLATE_ID.eq(templateId)).execute();
    saveDays(templateId, days);
  }

  /** テンプレート配下の曜日と ON 時限を保存します。 */
  private void saveDays(String templateId, List<OpeningScheduleDayInput> days) {
    if (days == null) {
      return;
    }
    for (OpeningScheduleDayInput input : days) {
      BranchOpeningScheduleTemplateDayRecord day =
          dsl().newRecord(BRANCH_OPENING_SCHEDULE_TEMPLATE_DAY);
      day.setTemplateId(templateId);
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
      BranchOpeningScheduleTemplatePeriodRecord period =
          dsl().newRecord(BRANCH_OPENING_SCHEDULE_TEMPLATE_PERIOD);
      period.setTemplateDayId(dayId);
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
}
