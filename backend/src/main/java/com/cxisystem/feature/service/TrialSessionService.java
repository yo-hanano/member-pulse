package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.LeadDao;
import com.cxisystem.feature.dao.TrialSessionDao;
import com.cxisystem.feature.input.TrialSessionInput;
import com.cxisystem.feature.type.TrialSession;
import com.cxisystem.jooq.tables.records.LeadRecord;
import com.cxisystem.jooq.tables.records.TrialSessionRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * リードに紐づく体験セッションの業務操作をまとめるサービスです。
 */
@ApplicationScoped
public class TrialSessionService
    extends AbstractService<TrialSessionRecord, TrialSession, String, TrialSessionDao> {

  private static final String STATUS_SCHEDULED = "scheduled";
  private static final String STATUS_COMPLETED = "completed";
  private static final String STATUS_CANCELED = "canceled";
  private static final String LEAD_STATUS_NEW = "new";
  private static final String LEAD_STATUS_TRIAL_SCHEDULED = "trial_scheduled";
  private static final String LEAD_STATUS_TRIAL_COMPLETED = "trial_completed";
  private static final String LEAD_STATUS_CANCELED = "canceled";
  private static final String LEAD_STATUS_CONTRACTED = "contracted";
  private static final String LEAD_STATUS_ENROLLED = "enrolled";
  private static final String LEAD_STATUS_LOST = "lost";

  @Inject
  TrialSessionDao trialSessionDao;

  @Inject
  LeadDao leadDao;

  /** 体験セッション操作に使う Dao を返します。 */
  @Override
  protected TrialSessionDao getDao() {
    return trialSessionDao;
  }

  /** 体験セッション変換先の型を返します。 */
  @Override
  protected Class<TrialSession> getTypeClass() {
    return TrialSession.class;
  }

  /** リードに紐づく体験セッション一覧を返します。 */
  @Rls
  @Transactional
  public List<TrialSession> findByLeadId(String leadId) {
    return trialSessionDao.findByLeadId(leadId).stream()
        .map(record -> record.into(TrialSession.class)).collect(Collectors.toList());
  }

  /** 体験セッションを新規作成し、必要に応じてリード状態を同期します。 */
  @Rls
  @Transactional
  public TrialSession create(TrialSessionInput input) {
    LeadRecord leadRecord = findLead(input.getLeadId());
    TrialSessionRecord trialSessionRecord = newRecord(input);
    applyDerivedFields(trialSessionRecord, input, leadRecord);
    trialSessionRecord.store();
    syncLeadStatusFromLatestTrialSession(leadRecord);
    trialSessionRecord.refresh();
    return trialSessionRecord.into(TrialSession.class);
  }

  /** 既存体験セッションを更新し、必要に応じてリード状態を同期します。 */
  @Rls
  @Transactional
  public TrialSession update(String id, TrialSessionInput input) {
    TrialSessionRecord trialSessionRecord = trialSessionDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("trial session not found: " + id));
    if (!trialSessionRecord.getLeadId().equals(input.getLeadId())) {
      throw new IllegalArgumentException("trial session lead cannot be changed");
    }
    LeadRecord leadRecord = findLead(input.getLeadId());
    trialSessionRecord.from(input);
    applyDerivedFields(trialSessionRecord, input, leadRecord);
    trialSessionRecord.store();
    syncLeadStatusFromLatestTrialSession(leadRecord);
    trialSessionRecord.refresh();
    return trialSessionRecord.into(TrialSession.class);
  }

  /** 体験セッションを論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteTrialSession(String id) {
    TrialSessionRecord trialSessionRecord = trialSessionDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("trial session not found: " + id));
    LeadRecord leadRecord = findLead(trialSessionRecord.getLeadId());
    delete(id);
    syncLeadStatusFromLatestTrialSession(leadRecord);
    return true;
  }

  private LeadRecord findLead(String leadId) {
    return leadDao.findOptionalById(leadId)
        .orElseThrow(() -> new NotFoundException("lead not found: " + leadId));
  }

  private void applyDerivedFields(TrialSessionRecord record, TrialSessionInput input,
      LeadRecord leadRecord) {
    String locationId =
        StringUtils.defaultIfBlank(input.getLocationId(), leadRecord.getLocationId());
    if (StringUtils.isBlank(locationId)) {
      throw new IllegalArgumentException("trial session locationId is required");
    }

    record.setLeadId(leadRecord.getId());
    record.setLocationId(locationId);
    record.setStatus(StringUtils.defaultIfBlank(input.getStatus(), STATUS_SCHEDULED));
    if (STATUS_COMPLETED.equals(record.getStatus())) {
      record.setCompletedAt(
          input.getCompletedAt() != null ? input.getCompletedAt() : LocalDateTime.now());
    } else {
      record.setCompletedAt(null);
    }
    record.setNote(StringUtils.trimToNull(input.getNote()));
  }

  private void syncLeadStatusFromLatestTrialSession(LeadRecord leadRecord) {
    if (isTerminalLeadStatus(leadRecord.getStatus())) {
      return;
    }

    String nextLeadStatus = trialSessionDao.findByLeadId(leadRecord.getId()).stream().findFirst()
        .map(latestTrialSession -> leadStatusForTrialSessionStatus(latestTrialSession.getStatus()))
        .orElseGet(() -> fallbackLeadStatusWithoutTrialSession(leadRecord.getStatus()));
    if (StringUtils.isBlank(nextLeadStatus) || nextLeadStatus.equals(leadRecord.getStatus())) {
      return;
    }

    leadRecord.setStatus(nextLeadStatus);
    leadRecord.store();
  }

  private String leadStatusForTrialSessionStatus(String trialSessionStatus) {
    if (STATUS_COMPLETED.equals(trialSessionStatus)) {
      return LEAD_STATUS_TRIAL_COMPLETED;
    }
    if (STATUS_SCHEDULED.equals(trialSessionStatus)) {
      return LEAD_STATUS_TRIAL_SCHEDULED;
    }
    if (STATUS_CANCELED.equals(trialSessionStatus)) {
      // 体験キャンセルは体験前の失敗として lead をキャンセル状態へ寄せる（再予約で復帰可能）。
      return LEAD_STATUS_CANCELED;
    }
    return null;
  }

  private String fallbackLeadStatusWithoutTrialSession(String currentStatus) {
    // 体験を全て削除した場合は問い合わせ直後の新規へ戻す。
    if (LEAD_STATUS_TRIAL_SCHEDULED.equals(currentStatus)
        || LEAD_STATUS_TRIAL_COMPLETED.equals(currentStatus)
        || LEAD_STATUS_CANCELED.equals(currentStatus)) {
      return LEAD_STATUS_NEW;
    }
    return null;
  }

  private boolean isTerminalLeadStatus(String status) {
    return LEAD_STATUS_CONTRACTED.equals(status) || LEAD_STATUS_ENROLLED.equals(status)
        || LEAD_STATUS_LOST.equals(status);
  }
}
