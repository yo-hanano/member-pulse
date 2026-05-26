package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.ScheduleEvent.SCHEDULE_EVENT;
import static com.cxisystem.jooq.tables.ScheduleSubject.SCHEDULE_SUBJECT;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.LeadDao;
import com.cxisystem.feature.dao.ScheduleEventDao;
import com.cxisystem.feature.dao.ScheduleSubjectDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.ScheduleEventCompleteInput;
import com.cxisystem.feature.input.ScheduleEventFilterInput;
import com.cxisystem.feature.input.ScheduleEventInput;
import com.cxisystem.feature.input.ScheduleEventOutcomeInput;
import com.cxisystem.feature.input.ScheduleEventRescheduleInput;
import com.cxisystem.feature.input.ScheduleEventStatusChangeInput;
import com.cxisystem.feature.type.ScheduleEvent;
import com.cxisystem.jooq.tables.records.LeadRecord;
import com.cxisystem.jooq.tables.records.ScheduleEventRecord;
import com.cxisystem.jooq.tables.records.ScheduleSubjectRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * 予定の業務操作をまとめるサービスです。 CRUD と検索、論理削除を扱います。
 */
@ApplicationScoped
public class ScheduleEventService
    extends AbstractService<ScheduleEventRecord, ScheduleEvent, String, ScheduleEventDao> {

  @Inject
  ScheduleEventDao scheduleEventDao;

  @Inject
  LeadDao leadDao;

  @Inject
  ScheduleSubjectDao scheduleSubjectDao;

  /** 予定操作に使う Dao を返します。 */
  @Override
  protected ScheduleEventDao getDao() {
    return scheduleEventDao;
  }

  /** 予定の変換先型を返します。 */
  @Override
  protected Class<ScheduleEvent> getTypeClass() {
    return ScheduleEvent.class;
  }

  /**
   * 条件付きの予定一覧をページ形式で返します。
   *
   * @param pagination ページング条件
   * @param filter 検索条件
   * @return 予定一覧
   */
  @Rls
  @Transactional
  public Page<ScheduleEvent> pagination(Pagination pagination, ScheduleEventFilterInput filter) {
    List<ScheduleEvent> scheduleEvents = scheduleEventDao.pagination(pagination, filter).stream()
        .map(record -> record.into(ScheduleEvent.class)).collect(Collectors.toList());
    long total = scheduleEventDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(scheduleEvents, pagination.getOffset(), pagination.getLimit(), total,
        totalPages);
  }

  /**
   * 予定を新規作成して、保存後の値を返します。
   *
   * @param input 作成入力
   * @return 作成した予定
   */
  @Rls
  @Transactional
  public ScheduleEvent create(ScheduleEventInput input) {
    LeadRecord lead = findLead(input.getScheduleSubjectId());
    ScheduleSubjectRecord subject = findOrCreateLeadSubject(lead);
    String status = normalizeStatus(input.getStatus());
    validateReason(status, input.getReason());
    ScheduleEventRecord record = buildScheduleEvent(subject, lead, input.getScheduleType(),
        input.getScheduledAt(), status, input.getReason(), input.getNote());
    record.store();
    record.refresh();
    syncLeadStatus(lead, record.getStatus());
    return record.into(ScheduleEvent.class);
  }

  /**
   * 既存の予定を更新して、保存後の値を返します。
   *
   * @param id 予定ID
   * @param input 更新入力
   * @return 更新した予定
   */
  @Rls
  @Transactional
  public ScheduleEvent update(String id, ScheduleEventInput input) {
    ScheduleEventRecord record = scheduleEventDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("schedule event not found: " + id));
    assertLatest(record);
    LeadRecord lead = findLeadBySubjectId(record.getScheduleSubjectId());
    String status = normalizeStatus(input.getStatus());
    validateReason(status, input.getReason());
    record.setScheduleType(input.getScheduleType());
    record.setScheduledAt(input.getScheduledAt());
    record.setStatus(status);
    record.setReason(input.getReason());
    record.setNote(input.getNote());
    record.setIsDeleted(false);
    record.store();
    record.refresh();
    syncLeadStatus(lead, record.getStatus());
    return record.into(ScheduleEvent.class);
  }

  /**
   * 最新予定を日程変更済みにし、次の予定を未実施として追加します。
   *
   * @param id 最新予定ID
   * @param input 日程変更入力
   * @return 新しく追加した予定
   */
  @Rls
  @Transactional
  public ScheduleEvent reschedule(String id, ScheduleEventRescheduleInput input) {
    ScheduleEventRecord current = findLatestOperable(id);
    LeadRecord lead = findLeadBySubjectId(current.getScheduleSubjectId());

    current.setStatus("rescheduled");
    current.setReason(input.getReason());
    current.setNote(input.getNote());
    current.store();

    ScheduleSubjectRecord subject = scheduleSubjectDao
        .findOptionalById(current.getScheduleSubjectId()).orElseThrow(() -> new NotFoundException(
            "schedule subject not found: " + current.getScheduleSubjectId()));
    ScheduleEventRecord next = buildScheduleEvent(subject, lead, input.getScheduleType(),
        input.getScheduledAt(), "planned", null, input.getNote());
    next.store();
    next.refresh();
    syncLeadStatus(lead, "not_done");
    return next.into(ScheduleEvent.class);
  }

  /**
   * 最新予定をキャンセルにします。営業判断は別操作でリードへ反映します。
   *
   * @param id 最新予定ID
   * @param input キャンセル理由
   * @return 更新した予定
   */
  @Rls
  @Transactional
  public ScheduleEvent cancel(String id, ScheduleEventStatusChangeInput input) {
    ScheduleEventRecord record =
        updateLatestStatus(id, "canceled", input.getReason(), input.getNote());
    LeadRecord lead = findLeadBySubjectId(record.getScheduleSubjectId());
    syncLeadStatus(lead, "canceled");
    return record.into(ScheduleEvent.class);
  }

  /**
   * 最新予定を実施済みにします。営業結果は別操作でリードへ反映します。
   *
   * @param id 最新予定ID
   * @param input 実施結果メモ
   * @return 更新した予定
   */
  @Rls
  @Transactional
  public ScheduleEvent complete(String id, ScheduleEventCompleteInput input) {
    ScheduleEventRecord record = updateLatestStatus(id, "done", null, input.getNote());
    return record.into(ScheduleEvent.class);
  }

  /**
   * 実施済み予定に対する営業結果をリードへ反映します。
   *
   * @param id 予定ID
   * @param input 営業結果入力
   * @return 営業結果を反映した予定
   */
  @Rls
  @Transactional
  public ScheduleEvent recordOutcome(String id, ScheduleEventOutcomeInput input) {
    ScheduleEventRecord record = scheduleEventDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("schedule event not found: " + id));
    if (!"done".equals(record.getStatus())) {
      throw new IllegalArgumentException(
          "outcome can be recorded only after schedule event is done");
    }
    LeadRecord lead = findLeadBySubjectId(record.getScheduleSubjectId());
    syncLeadStatus(lead, input.getLeadStatus());
    if (StringUtils.isNotBlank(input.getNote())) {
      record.setNote(input.getNote());
      record.store();
      record.refresh();
    }
    return record.into(ScheduleEvent.class);
  }

  /**
   * 予定を論理削除します。
   *
   * @param id 予定ID
   * @return 削除成功なら true
   */
  @Rls
  @Transactional
  public boolean deleteScheduleEvent(String id) {
    delete(id);
    return true;
  }

  /** 予定レコードを生成し、共通の初期値をセットします。 */
  private ScheduleEventRecord buildScheduleEvent(ScheduleSubjectRecord subject, LeadRecord lead,
      String scheduleType, LocalDateTime scheduledAt, String status, String reason, String note) {
    ScheduleEventRecord record = newRecord();
    record.setCompanyId(lead.getCompanyId());
    record.setBranchId(lead.getBranchId());
    record.setScheduleSubjectId(subject.getId());
    record.setScheduleType(scheduleType);
    record.setScheduledAt(scheduledAt);
    record.setStatus(status);
    record.setReason(reason);
    record.setNote(note);
    record.setIsDeleted(false);
    return record;
  }

  /** リードに対応する予定主体を取得し、なければ作成します。 */
  private ScheduleSubjectRecord findOrCreateLeadSubject(LeadRecord lead) {
    return scheduleSubjectDao.findOptionalById(lead.getId()).orElseGet(() -> {
      ScheduleSubjectRecord subject = dsl().newRecord(SCHEDULE_SUBJECT);
      subject.setId(lead.getId());
      subject.setCompanyId(lead.getCompanyId());
      subject.setLeadId(lead.getId());
      subject.setIsDeleted(false);
      subject.store();
      subject.refresh();
      return subject;
    });
  }

  /** 入力のリードIDに対応するリードを取得します。 */
  private LeadRecord findLead(String leadId) {
    return leadDao.findOptionalById(leadId)
        .orElseThrow(() -> new NotFoundException("lead not found: " + leadId));
  }

  /** 予定主体IDからリードを取得します。 */
  private LeadRecord findLeadBySubjectId(String scheduleSubjectId) {
    ScheduleSubjectRecord subject =
        scheduleSubjectDao.findOptionalById(scheduleSubjectId).orElseThrow(
            () -> new NotFoundException("schedule subject not found: " + scheduleSubjectId));
    if (StringUtils.isBlank(subject.getLeadId())) {
      throw new IllegalArgumentException(
          "schedule subject is not a lead subject: " + scheduleSubjectId);
    }
    return findLead(subject.getLeadId());
  }

  /** 予定状態を未指定なら未実施に寄せます。 */
  private String normalizeStatus(String status) {
    return StringUtils.isBlank(status) ? "planned" : status;
  }

  /** DB の理由必須制約に合わせて、未実施・日程変更・キャンセル時の理由を確認します。 */
  private void validateReason(String status, String reason) {
    if (requiresReason(status) && StringUtils.isBlank(reason)) {
      throw new BadRequestException("schedule event reason is required for status: " + status);
    }
  }

  /** 理由入力が必須になる予定状態かどうかを返します。 */
  private boolean requiresReason(String status) {
    return "not_done".equals(status) || "rescheduled".equals(status) || "canceled".equals(status);
  }

  /** 最新予定だけが操作対象であることを確認して返します。 */
  private ScheduleEventRecord findLatestOperable(String id) {
    ScheduleEventRecord record = scheduleEventDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("schedule event not found: " + id));
    assertLatest(record);
    return record;
  }

  /** 対象予定が予定主体の最新行かどうか確認します。 */
  private void assertLatest(ScheduleEventRecord record) {
    ScheduleEventRecord latest =
        dsl().selectFrom(SCHEDULE_EVENT).where(SCHEDULE_EVENT.COMPANY_ID.eq(record.getCompanyId()))
            .and(SCHEDULE_EVENT.SCHEDULE_SUBJECT_ID.eq(record.getScheduleSubjectId()))
            .and(SCHEDULE_EVENT.IS_DELETED.isFalse()).orderBy(SCHEDULE_EVENT.SCHEDULED_AT.desc(),
                SCHEDULE_EVENT.CREATED_AT.desc(), SCHEDULE_EVENT.ID.desc())
            .limit(1).fetchOne();
    if (latest == null || !latest.getId().equals(record.getId())) {
      throw new IllegalArgumentException("only latest schedule event can be operated");
    }
  }

  /** 最新予定の状態を更新します。 */
  private ScheduleEventRecord updateLatestStatus(String id, String status, String reason,
      String note) {
    ScheduleEventRecord record = findLatestOperable(id);
    record.setStatus(status);
    record.setReason(reason);
    record.setNote(note);
    record.store();
    record.refresh();
    return record;
  }

  /** 予定操作に応じてリード状態を同期します。 */
  private void syncLeadStatus(LeadRecord lead,
      String scheduleStatusOrLeadStatus) {String nextLeadStatus=switch(scheduleStatusOrLeadStatus){case"planned","not_done","rescheduled","canceled"->"visit_scheduled";case"contracted","enrolled","lost"->scheduleStatusOrLeadStatus;default->lead.getStatus();};lead.setStatus(nextLeadStatus);lead.setFollowUpAt(null);lead.store();}
}
