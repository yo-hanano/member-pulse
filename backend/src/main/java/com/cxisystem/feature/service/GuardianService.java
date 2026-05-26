package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.Guardian.GUARDIAN;
import static com.cxisystem.jooq.tables.Relationship.RELATIONSHIP;
import static com.cxisystem.jooq.tables.StudentGuardian.STUDENT_GUARDIAN;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.GuardianDao;
import com.cxisystem.feature.input.GuardianInput;
import com.cxisystem.feature.type.Guardian;
import com.cxisystem.feature.type.StudentGuardianInfo;
import com.cxisystem.feature.util.TokenUtil;
import com.cxisystem.jooq.tables.records.GuardianRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.commons.lang3.StringUtils;

/**
 * 保護者管理の業務操作をまとめるサービスです。 生徒の主保護者の作成・更新・参照を担当します。
 */
@ApplicationScoped
public class GuardianService
    extends AbstractService<GuardianRecord, Guardian, String, GuardianDao> {

  @Inject
  GuardianDao guardianDao;

  /** 保護者操作に使う Dao を返します。 */
  @Override
  protected GuardianDao getDao() {
    return guardianDao;
  }

  /** 保護者変換先の型を返します。 */
  @Override
  protected Class<Guardian> getTypeClass() {
    return Guardian.class;
  }

  /**
   * 生徒に紐づく主保護者を返します。 主保護者が未登録なら null を返します。
   */
  @Rls
  @Transactional
  public Guardian findPrimaryByStudentId(String studentId) {
    return dsl().select(GUARDIAN.fields()).from(STUDENT_GUARDIAN).join(GUARDIAN)
        .on(STUDENT_GUARDIAN.GUARDIAN_ID.eq(GUARDIAN.ID))
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
        .and(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT.isTrue())
        .and(STUDENT_GUARDIAN.IS_DELETED.isFalse()).and(GUARDIAN.IS_DELETED.isFalse())
        .fetchOptional().map(record -> record.into(Guardian.class)).orElse(null);
  }

  /** 生徒に紐づく保護者をすべて返します。 */
  @Rls
  @Transactional
  public List<StudentGuardianInfo> findByStudentId(String studentId) {
    return dsl()
        .select(GUARDIAN.ID, GUARDIAN.NAME, GUARDIAN.KANA, STUDENT_GUARDIAN.RELATIONSHIP_CODE,
            RELATIONSHIP.NAME, GUARDIAN.PREFECTURE_CODE, GUARDIAN.PHONE, GUARDIAN.EMAIL,
            GUARDIAN.POSTAL_CODE, GUARDIAN.ADDRESS, GUARDIAN.NOTE,
            STUDENT_GUARDIAN.IS_PRIMARY_CONTACT)
        .from(STUDENT_GUARDIAN).join(GUARDIAN).on(STUDENT_GUARDIAN.GUARDIAN_ID.eq(GUARDIAN.ID))
        .join(RELATIONSHIP).on(STUDENT_GUARDIAN.RELATIONSHIP_CODE.eq(RELATIONSHIP.CODE))
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .and(GUARDIAN.IS_DELETED.isFalse())
        .orderBy(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT.desc(), GUARDIAN.NAME.asc()).fetch(record -> {
          StudentGuardianInfo info = new StudentGuardianInfo();
          info.setId(record.value1());
          info.setName(record.value2());
          info.setKana(record.value3());
          info.setRelationshipCode(record.value4());
          info.setRelationshipName(record.value5());
          info.setPrefectureCode(record.value6());
          info.setPhone(record.value7());
          info.setEmail(record.value8());
          info.setPostalCode(record.value9());
          info.setAddress(record.value10());
          info.setNote(record.value11());
          info.setPrimaryContact(Boolean.TRUE.equals(record.value12()));
          return info;
        });
  }

  /**
   * 生徒の主保護者を作成または更新します。 既存保護者があればそのレコードを更新し、なければ新規作成します。
   */
  @Rls
  @Transactional
  public Guardian savePrimaryGuardian(String studentId, String companyId, GuardianInput input) {
    if (input == null || isBlankGuardian(input)) {
      return null;
    }
    if (StringUtils.isBlank(input.getName())) {
      return null;
    }

    GuardianRecord guardianRecord = saveGuardian(companyId, input);
    upsertStudentGuardian(studentId, companyId, guardianRecord.getId(), input, true);
    return guardianRecord.into(Guardian.class);
  }

  /** 生徒に紐づく保護者を作成または更新します。 */
  @Rls
  @Transactional
  public StudentGuardianInfo saveStudentGuardian(String studentId, String companyId,
      GuardianInput input) {
    if (input == null || StringUtils.isBlank(input.getName())) {
      throw new BadRequestException("guardian input is required");
    }

    GuardianRecord guardianRecord = saveGuardian(companyId, input);
    upsertStudentGuardian(studentId, companyId, guardianRecord.getId(), input,
        !hasActiveStudentGuardian(studentId));
    return findByStudentId(studentId).stream()
        .filter(guardian -> guardianRecord.getId().equals(guardian.getId())).findFirst()
        .orElse(null);
  }

  /** 指定した保護者を生徒の主連絡先にします。 */
  @Rls
  @Transactional
  public StudentGuardianInfo setPrimaryGuardian(String studentId, String guardianId) {
    int exists = dsl().fetchCount(STUDENT_GUARDIAN,
        STUDENT_GUARDIAN.STUDENT_ID.eq(studentId).and(STUDENT_GUARDIAN.GUARDIAN_ID.eq(guardianId))
            .and(STUDENT_GUARDIAN.IS_DELETED.isFalse()));
    if (exists == 0) {
      throw new NotFoundException("student guardian not found: " + guardianId);
    }

    dsl().update(STUDENT_GUARDIAN).set(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT, false)
        .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .execute();
    dsl().update(STUDENT_GUARDIAN).set(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT, true)
        .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
        .and(STUDENT_GUARDIAN.GUARDIAN_ID.eq(guardianId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .execute();
    return findByStudentId(studentId).stream()
        .filter(guardian -> guardianId.equals(guardian.getId())).findFirst().orElse(null);
  }

  /** 生徒と保護者の紐付けを削除します。 */
  @Rls
  @Transactional
  public boolean deleteStudentGuardian(String studentId, String guardianId) {
    boolean wasPrimaryContact = Boolean.TRUE.equals(dsl()
        .select(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT).from(STUDENT_GUARDIAN)
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
        .and(STUDENT_GUARDIAN.GUARDIAN_ID.eq(guardianId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .fetchOne(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT));
    int updated = dsl().update(STUDENT_GUARDIAN).set(STUDENT_GUARDIAN.IS_DELETED, true)
        .set(STUDENT_GUARDIAN.DELETED_AT, LocalDateTime.now())
        .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
        .and(STUDENT_GUARDIAN.GUARDIAN_ID.eq(guardianId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .execute();
    if (wasPrimaryContact && updated > 0) {
      promoteFirstGuardianAsPrimary(studentId);
    }
    return updated > 0;
  }

  /** 保護者入力が空なら保存対象外とみなします。 */
  private boolean isBlankGuardian(GuardianInput input) {
    return StringUtils.isAllBlank(input.getId(), input.getName(), input.getKana(),
        input.getRelationshipCode(), input.getPrefectureCode(), input.getPhone(), input.getEmail(),
        input.getPostalCode(), input.getAddress(), input.getNote());
  }

  /** 保護者レコードを新規作成または更新します。 */
  private GuardianRecord saveGuardian(String companyId, GuardianInput input) {
    GuardianRecord guardianRecord;
    if (StringUtils.isBlank(input.getId())) {
      guardianRecord = newRecord();
      guardianRecord.setId(TokenUtil.generateToken().substring(0, 21));
      guardianRecord.setCompanyId(companyId);
      guardianRecord.setCreatedAt(LocalDateTime.now());
      guardianRecord.setIsDeleted(false);
    } else {
      guardianRecord = guardianDao.findOptionalById(input.getId())
          .orElseThrow(() -> new NotFoundException("guardian not found: " + input.getId()));
    }

    guardianRecord.setName(input.getName());
    guardianRecord.setKana(input.getKana());
    guardianRecord.setRelationshipCode(input.getRelationshipCode());
    guardianRecord.setPrefectureCode(input.getPrefectureCode());
    guardianRecord.setPhone(input.getPhone());
    guardianRecord.setEmail(input.getEmail());
    guardianRecord.setPostalCode(input.getPostalCode());
    guardianRecord.setAddress(input.getAddress());
    guardianRecord.setNote(input.getNote());
    guardianRecord.setUpdatedAt(LocalDateTime.now());
    guardianRecord.setIsDeleted(false);
    guardianRecord.store();
    guardianRecord.refresh();
    return guardianRecord;
  }

  /** 生徒の主保護者紐付けを保存します。 */
  private void upsertStudentGuardian(String studentId, String companyId, String guardianId,
      GuardianInput input, boolean primaryContact) {
    if (primaryContact) {
      dsl().update(STUDENT_GUARDIAN).set(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT, false)
          .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
          .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
          .and(STUDENT_GUARDIAN.IS_DELETED.isFalse()).execute();
    }

    boolean effectivePrimaryContact = primaryContact || Boolean.TRUE.equals(dsl()
        .select(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT).from(STUDENT_GUARDIAN)
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
        .and(STUDENT_GUARDIAN.GUARDIAN_ID.eq(guardianId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .fetchOne(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT));

    dsl().insertInto(STUDENT_GUARDIAN)
        .set(STUDENT_GUARDIAN.ID, TokenUtil.generateToken().substring(0, 21))
        .set(STUDENT_GUARDIAN.COMPANY_ID, companyId).set(STUDENT_GUARDIAN.STUDENT_ID, studentId)
        .set(STUDENT_GUARDIAN.GUARDIAN_ID, guardianId)
        .set(STUDENT_GUARDIAN.RELATIONSHIP_CODE, input.getRelationshipCode())
        .set(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT, effectivePrimaryContact)
        .set(STUDENT_GUARDIAN.CREATED_AT, LocalDateTime.now())
        .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
        .set(STUDENT_GUARDIAN.IS_DELETED, false).onDuplicateKeyUpdate()
        .set(STUDENT_GUARDIAN.RELATIONSHIP_CODE, input.getRelationshipCode())
        .set(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT, effectivePrimaryContact)
        .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
        .set(STUDENT_GUARDIAN.IS_DELETED, false).execute();
  }

  /** 生徒に有効な保護者紐付けが存在するか判定します。 */
  private boolean hasActiveStudentGuardian(String studentId) {
    return dsl().fetchExists(
        dsl().selectOne().from(STUDENT_GUARDIAN).where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
            .and(STUDENT_GUARDIAN.IS_DELETED.isFalse()));
  }

  /** 主連絡先が削除された場合に、残っている保護者を1件だけ主連絡先にします。 */
  private void promoteFirstGuardianAsPrimary(String studentId) {
    String nextGuardianId = dsl().select(STUDENT_GUARDIAN.GUARDIAN_ID).from(STUDENT_GUARDIAN)
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId)).and(STUDENT_GUARDIAN.IS_DELETED.isFalse())
        .orderBy(STUDENT_GUARDIAN.UPDATED_AT.desc().nullsLast(), STUDENT_GUARDIAN.CREATED_AT.asc())
        .limit(1).fetchOne(STUDENT_GUARDIAN.GUARDIAN_ID);
    if (StringUtils.isBlank(nextGuardianId)) {
      return;
    }
    dsl().update(STUDENT_GUARDIAN).set(STUDENT_GUARDIAN.IS_PRIMARY_CONTACT, true)
        .set(STUDENT_GUARDIAN.UPDATED_AT, LocalDateTime.now())
        .where(STUDENT_GUARDIAN.STUDENT_ID.eq(studentId))
        .and(STUDENT_GUARDIAN.GUARDIAN_ID.eq(nextGuardianId))
        .and(STUDENT_GUARDIAN.IS_DELETED.isFalse()).execute();
  }
}
