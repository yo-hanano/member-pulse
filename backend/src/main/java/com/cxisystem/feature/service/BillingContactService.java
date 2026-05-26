package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.BillingContact.BILLING_CONTACT;
import static com.cxisystem.jooq.tables.StudentBillingContact.STUDENT_BILLING_CONTACT;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.BillingContactDao;
import com.cxisystem.feature.input.BillingContactInput;
import com.cxisystem.feature.type.BillingContact;
import com.cxisystem.feature.type.StudentBillingContactInfo;
import com.cxisystem.feature.util.TokenUtil;
import com.cxisystem.jooq.tables.records.BillingContactRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;

/**
 * 請求先の業務操作をまとめるサービスです。 保護者とは別モデルとして、生徒との主請求先紐付けを扱います。
 */
@ApplicationScoped
public class BillingContactService
    extends AbstractService<BillingContactRecord, BillingContact, String, BillingContactDao> {

  @Inject
  BillingContactDao billingContactDao;

  /** 請求先操作に使う Dao を返します。 */
  @Override
  protected BillingContactDao getDao() {
    return billingContactDao;
  }

  /** 請求先変換先の型を返します。 */
  @Override
  protected Class<BillingContact> getTypeClass() {
    return BillingContact.class;
  }

  /** 請求先候補を検索して返します。 */
  @Rls
  @Transactional
  public List<BillingContact> findOptions(String searchText) {
    Condition condition = BILLING_CONTACT.IS_DELETED.isFalse();
    if (StringUtils.isNotBlank(searchText)) {
      String keyword = "%" + searchText.trim() + "%";
      condition = condition.and(BILLING_CONTACT.NAME.likeIgnoreCase(keyword)
          .or(BILLING_CONTACT.KANA.likeIgnoreCase(keyword))
          .or(BILLING_CONTACT.PHONE.likeIgnoreCase(keyword))
          .or(BILLING_CONTACT.EMAIL.likeIgnoreCase(keyword))
          .or(BILLING_CONTACT.ADDRESS.likeIgnoreCase(keyword)));
    }

    return dsl().selectFrom(BILLING_CONTACT).where(condition)
        .orderBy(BILLING_CONTACT.UPDATED_AT.desc().nullsLast(), BILLING_CONTACT.NAME.asc())
        .limit(20).fetch(record -> record.into(BillingContact.class));
  }

  /** 生徒に紐づく請求先をすべて返します。 */
  @Rls
  @Transactional
  public List<StudentBillingContactInfo> findByStudentId(String studentId) {
    return dsl()
        .select(BILLING_CONTACT.ID, BILLING_CONTACT.NAME, BILLING_CONTACT.KANA,
            BILLING_CONTACT.PREFECTURE_CODE, BILLING_CONTACT.PHONE, BILLING_CONTACT.EMAIL,
            BILLING_CONTACT.POSTAL_CODE, BILLING_CONTACT.ADDRESS, BILLING_CONTACT.NOTE,
            STUDENT_BILLING_CONTACT.IS_PRIMARY)
        .from(STUDENT_BILLING_CONTACT).join(BILLING_CONTACT)
        .on(STUDENT_BILLING_CONTACT.BILLING_CONTACT_ID.eq(BILLING_CONTACT.ID))
        .where(STUDENT_BILLING_CONTACT.STUDENT_ID.eq(studentId))
        .and(STUDENT_BILLING_CONTACT.IS_DELETED.isFalse()).and(BILLING_CONTACT.IS_DELETED.isFalse())
        .orderBy(STUDENT_BILLING_CONTACT.IS_PRIMARY.desc(), BILLING_CONTACT.NAME.asc())
        .fetch(record -> {
          StudentBillingContactInfo info = new StudentBillingContactInfo();
          info.setId(record.value1());
          info.setName(record.value2());
          info.setKana(record.value3());
          info.setPrefectureCode(record.value4());
          info.setPhone(record.value5());
          info.setEmail(record.value6());
          info.setPostalCode(record.value7());
          info.setAddress(record.value8());
          info.setNote(record.value9());
          info.setPrimary(Boolean.TRUE.equals(record.value10()));
          return info;
        });
  }

  /**
   * 生徒の主請求先を作成または更新します。 既存請求先があればそのレコードを更新し、なければ新規作成します。
   */
  @Rls
  @Transactional
  public BillingContact savePrimaryBillingContact(String studentId, String companyId,
      BillingContactInput input) {
    BillingContactRecord contactRecord = saveBillingContact(companyId, input);
    upsertStudentBillingContact(studentId, companyId, contactRecord.getId(), true);
    return contactRecord.into(BillingContact.class);
  }

  /** 既存の請求先を生徒の主請求先として紐付けます。 */
  @Rls
  @Transactional
  public StudentBillingContactInfo linkStudentBillingContact(String studentId, String companyId,
      String billingContactId) {
    BillingContactRecord contactRecord = billingContactDao.findOptionalById(billingContactId)
        .orElseThrow(() -> new NotFoundException("billing contact not found: " + billingContactId));
    if (!companyId.equals(contactRecord.getCompanyId())) {
      throw new NotFoundException("billing contact not found: " + billingContactId);
    }

    upsertStudentBillingContact(studentId, companyId, contactRecord.getId(), true);
    return findByStudentId(studentId).stream()
        .filter(contact -> contactRecord.getId().equals(contact.getId())).findFirst().orElse(null);
  }

  /** 生徒に紐づく請求先を作成または更新します。 */
  @Rls
  @Transactional
  public StudentBillingContactInfo saveStudentBillingContact(String studentId, String companyId,
      BillingContactInput input) {
    if (input == null || StringUtils.isBlank(input.getName())) {
      throw new BadRequestException("billing contact input is required");
    }

    BillingContactRecord contactRecord = saveBillingContact(companyId, input);
    boolean primary = !hasActiveStudentBillingContact(studentId)
        || isPrimaryStudentBillingContact(studentId, contactRecord.getId());
    upsertStudentBillingContact(studentId, companyId, contactRecord.getId(), primary);
    return findByStudentId(studentId).stream()
        .filter(contact -> contactRecord.getId().equals(contact.getId())).findFirst().orElse(null);
  }

  /** 請求先レコードを新規作成または更新します。 */
  private BillingContactRecord saveBillingContact(String companyId, BillingContactInput input) {
    BillingContactRecord contactRecord;
    if (StringUtils.isBlank(input.getId())) {
      contactRecord = newRecord();
      contactRecord.setId(TokenUtil.generateToken().substring(0, 21));
      contactRecord.setCompanyId(companyId);
      contactRecord.setCreatedAt(LocalDateTime.now());
      contactRecord.setIsDeleted(false);
    } else {
      contactRecord = billingContactDao.findOptionalById(input.getId())
          .orElseThrow(() -> new NotFoundException("billing contact not found: " + input.getId()));
    }

    contactRecord.setName(input.getName());
    contactRecord.setKana(input.getKana());
    contactRecord.setBillingMethod("credit_card");
    contactRecord.setPrefectureCode(input.getPrefectureCode());
    contactRecord.setPhone(input.getPhone());
    contactRecord.setEmail(input.getEmail());
    contactRecord.setPostalCode(input.getPostalCode());
    contactRecord.setAddress(input.getAddress());
    contactRecord.setNote(input.getNote());
    contactRecord.setUpdatedAt(LocalDateTime.now());
    contactRecord.setIsDeleted(false);
    contactRecord.store();
    contactRecord.refresh();
    return contactRecord;
  }

  /** 生徒の請求先紐付けを保存します。 */
  private void upsertStudentBillingContact(String studentId, String companyId,
      String billingContactId, boolean primary) {
    if (primary) {
      dsl().update(STUDENT_BILLING_CONTACT).set(STUDENT_BILLING_CONTACT.IS_PRIMARY, false)
          .set(STUDENT_BILLING_CONTACT.UPDATED_AT, LocalDateTime.now())
          .where(STUDENT_BILLING_CONTACT.STUDENT_ID.eq(studentId))
          .and(STUDENT_BILLING_CONTACT.IS_DELETED.isFalse()).execute();
    }

    dsl().insertInto(STUDENT_BILLING_CONTACT)
        .set(STUDENT_BILLING_CONTACT.ID, TokenUtil.generateToken().substring(0, 21))
        .set(STUDENT_BILLING_CONTACT.COMPANY_ID, companyId)
        .set(STUDENT_BILLING_CONTACT.STUDENT_ID, studentId)
        .set(STUDENT_BILLING_CONTACT.BILLING_CONTACT_ID, billingContactId)
        .set(STUDENT_BILLING_CONTACT.IS_PRIMARY, primary)
        .set(STUDENT_BILLING_CONTACT.CREATED_AT, LocalDateTime.now())
        .set(STUDENT_BILLING_CONTACT.UPDATED_AT, LocalDateTime.now())
        .set(STUDENT_BILLING_CONTACT.IS_DELETED, false).onDuplicateKeyUpdate()
        .set(STUDENT_BILLING_CONTACT.IS_PRIMARY, primary)
        .set(STUDENT_BILLING_CONTACT.UPDATED_AT, LocalDateTime.now())
        .set(STUDENT_BILLING_CONTACT.IS_DELETED, false).execute();
  }

  /** 生徒に有効な請求先紐付けが存在するか判定します。 */
  private boolean hasActiveStudentBillingContact(String studentId) {
    return dsl().fetchExists(dsl().selectOne().from(STUDENT_BILLING_CONTACT)
        .where(STUDENT_BILLING_CONTACT.STUDENT_ID.eq(studentId))
        .and(STUDENT_BILLING_CONTACT.IS_DELETED.isFalse()));
  }

  /** 指定した請求先が生徒の主請求先かどうかを返します。 */
  private boolean isPrimaryStudentBillingContact(String studentId, String billingContactId) {
    return Boolean.TRUE.equals(dsl().select(STUDENT_BILLING_CONTACT.IS_PRIMARY)
        .from(STUDENT_BILLING_CONTACT).where(STUDENT_BILLING_CONTACT.STUDENT_ID.eq(studentId))
        .and(STUDENT_BILLING_CONTACT.BILLING_CONTACT_ID.eq(billingContactId))
        .and(STUDENT_BILLING_CONTACT.IS_DELETED.isFalse())
        .fetchOne(STUDENT_BILLING_CONTACT.IS_PRIMARY));
  }
}
