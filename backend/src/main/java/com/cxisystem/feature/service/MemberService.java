package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.MembershipSubscription.MEMBERSHIP_SUBSCRIPTION;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.LeadDao;
import com.cxisystem.feature.dao.MemberDao;
import com.cxisystem.feature.dao.MembershipPlanDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.MemberFilterInput;
import com.cxisystem.feature.input.MemberInput;
import com.cxisystem.feature.input.MembershipSubscriptionInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.type.Member;
import com.cxisystem.jooq.tables.records.LeadRecord;
import com.cxisystem.jooq.tables.records.MemberRecord;
import com.cxisystem.jooq.tables.records.MembershipPlanRecord;
import com.cxisystem.jooq.tables.records.MembershipSubscriptionRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * 会員管理の業務操作をまとめるサービスです。基本情報の CRUD と検索、論理削除を扱います。
 */
@ApplicationScoped
public class MemberService extends AbstractService<MemberRecord, Member, String, MemberDao> {

  private static final String LEAD_STATUS_CONTRACTED = "contracted";
  private static final String LEAD_STATUS_ENROLLED = "enrolled";
  private static final String SUBSCRIPTION_STATUS_ACTIVE = "active";

  @Inject
  MemberDao memberDao;

  @Inject
  LeadDao leadDao;

  @Inject
  MembershipPlanDao membershipPlanDao;

  /** 会員操作に使う Dao を返します。 */
  @Override
  protected MemberDao getDao() {
    return memberDao;
  }

  /** 会員変換先の型を返します。 */
  @Override
  protected Class<Member> getTypeClass() {
    return Member.class;
  }

  /** 条件付きの会員一覧をページ形式で返します。 */
  @Rls
  @Transactional
  public Page<Member> pagination(Pagination pagination, MemberFilterInput filter) {
    List<Member> members = memberDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Member.class)).collect(Collectors.toList());
    long total = memberDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(members, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** 会員を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Member create(MemberInput input) {
    MemberRecord memberRecord = newRecord(input);
    normalizeOptionalFields(memberRecord);
    memberRecord.store();
    memberRecord.refresh();
    return memberRecord.into(Member.class);
  }

  /** 成約済みリードを起点に会員とコース契約を作成し、リードを入会済みにします。 */
  @Rls
  @Transactional
  public Member enrollLead(String leadId, MemberInput input,
      MembershipSubscriptionInput subscription) {
    LeadRecord leadRecord = leadDao.findOptionalById(leadId)
        .orElseThrow(() -> new NotFoundException("lead not found: " + leadId));
    if (!LEAD_STATUS_CONTRACTED.equals(leadRecord.getStatus())) {
      throw new BadRequestException("lead is not contracted: " + leadId);
    }
    if (memberDao.existsByLeadId(leadId)) {
      throw new BadRequestException("lead is already enrolled: " + leadId);
    }

    MemberRecord memberRecord = newRecord(input);
    memberRecord.setLeadId(leadId);
    normalizeOptionalFields(memberRecord);
    memberRecord.store();
    memberRecord.refresh();

    // 入会と同時にコース契約を作成する。途中で失敗した場合はトランザクションごと巻き戻る。
    createSubscription(memberRecord.getId(), subscription);

    leadRecord.setStatus(LEAD_STATUS_ENROLLED);
    leadRecord.store();
    return memberRecord.into(Member.class);
  }

  /** 入会した会員のコース契約を作成します。月額未指定時はプランの月額を適用します。 */
  private void createSubscription(String memberId, MembershipSubscriptionInput subscription) {
    MembershipPlanRecord planRecord =
        membershipPlanDao.findOptionalById(subscription.getMembershipPlanId())
            .orElseThrow(() -> new NotFoundException(
                "membership plan not found: " + subscription.getMembershipPlanId()));
    if (!Boolean.TRUE.equals(planRecord.getActive())) {
      throw new BadRequestException("membership plan is not active: " + planRecord.getId());
    }

    MembershipSubscriptionRecord subscriptionRecord = dsl().newRecord(MEMBERSHIP_SUBSCRIPTION);
    subscriptionRecord.setMemberId(memberId);
    subscriptionRecord.setMembershipPlanId(planRecord.getId());
    subscriptionRecord.setStartDate(subscription.getStartDate());
    subscriptionRecord.setStatus(SUBSCRIPTION_STATUS_ACTIVE);
    subscriptionRecord
        .setMonthlyFee(subscription.getMonthlyFee() != null ? subscription.getMonthlyFee()
            : planRecord.getMonthlyFee());
    subscriptionRecord.setNote(StringUtils.trimToNull(subscription.getNote()));
    subscriptionRecord.store();
  }

  /** 既存会員を更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Member update(String id, MemberInput input) {
    MemberRecord memberRecord = memberDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("member not found: " + id));
    memberRecord.from(input);
    normalizeOptionalFields(memberRecord);
    memberRecord.store();
    memberRecord.refresh();
    return memberRecord.into(Member.class);
  }

  /** 会員を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteMember(String id) {
    delete(id);
    return true;
  }

  private void normalizeOptionalFields(MemberRecord memberRecord) {
    memberRecord.setLeadId(StringUtils.trimToNull(memberRecord.getLeadId()));
    memberRecord.setPhone(StringUtils.trimToNull(memberRecord.getPhone()));
    memberRecord.setEmail(StringUtils.trimToNull(memberRecord.getEmail()));
    memberRecord.setLineDisplayName(StringUtils.trimToNull(memberRecord.getLineDisplayName()));
    memberRecord.setZipCode(StringUtils.trimToNull(memberRecord.getZipCode()));
    memberRecord.setPrefectureCode(StringUtils.trimToNull(memberRecord.getPrefectureCode()));
    memberRecord.setAddress(StringUtils.trimToNull(memberRecord.getAddress()));
    memberRecord.setSource(StringUtils.trimToNull(memberRecord.getSource()));
    memberRecord
        .setResignationReasonCode(StringUtils.trimToNull(memberRecord.getResignationReasonCode()));
    memberRecord.setResignationNote(StringUtils.trimToNull(memberRecord.getResignationNote()));
    memberRecord.setNote(StringUtils.trimToNull(memberRecord.getNote()));
  }
}
