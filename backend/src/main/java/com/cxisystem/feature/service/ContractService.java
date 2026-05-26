package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.Contract.CONTRACT;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.ContractDao;
import com.cxisystem.feature.dao.StudentDao;
import com.cxisystem.feature.input.ContractInput;
import com.cxisystem.feature.type.Contract;
import com.cxisystem.feature.util.TokenUtil;
import com.cxisystem.jooq.tables.records.ContractRecord;
import com.cxisystem.jooq.tables.records.StudentRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;

/**
 * コース契約の業務操作をまとめるサービスです。 コース期間の重複防止と旧コース終了日の自動設定を扱います。
 */
@ApplicationScoped
public class ContractService
    extends AbstractService<ContractRecord, Contract, String, ContractDao> {

  private static final Set<String> COURSE_TYPES = Set.of("regular", "trial", "seasonal", "other");

  @Inject
  ContractDao contractDao;

  @Inject
  StudentDao studentDao;

  /** コース契約操作に使う Dao を返します。 */
  @Override
  protected ContractDao getDao() {
    return contractDao;
  }

  /** コース契約変換先の型を返します。 */
  @Override
  protected Class<Contract> getTypeClass() {
    return Contract.class;
  }

  /** 生徒に紐づくコース契約を返します。 */
  @Rls
  @Transactional
  public List<Contract> findByStudentId(String studentId) {
    return contractDao.findByStudentId(studentId).stream()
        .map(record -> record.into(Contract.class)).collect(Collectors.toList());
  }

  /**
   * 生徒にコース契約を追加します。 新コース開始日前日に、既存の重複コース終了日を自動設定します。
   */
  @Rls
  @Transactional
  public Contract createForStudent(String studentId, ContractInput input) {
    StudentRecord student = studentDao.findOptionalById(studentId)
        .orElseThrow(() -> new NotFoundException("student not found: " + studentId));
    validateInput(input);
    rejectFutureOrSameStartCourse(studentId, input.getContractStartDate());
    closePreviousContracts(studentId, input.getContractStartDate());

    ContractRecord record = newRecord();
    record.setId(TokenUtil.generateToken().substring(0, 21));
    record.setCompanyId(student.getCompanyId());
    record.setStudentId(studentId);
    record.setBillingCycle("monthly");
    record.setStatus("active");
    record.setCreatedAt(LocalDateTime.now());
    record.setIsDeleted(false);
    applyInput(record, input);
    record.store();
    record.refresh();
    return record.into(Contract.class);
  }

  /** 既存コース契約を更新します。 更新時は他コースとの期間重複を許可しません。 */
  @Rls
  @Transactional
  public Contract update(String contractId, ContractInput input) {
    ContractRecord record = contractDao.findOptionalById(contractId)
        .orElseThrow(() -> new NotFoundException("contract not found: " + contractId));
    validateInput(input);
    assertNoOverlap(record.getStudentId(), contractId, input.getContractStartDate(),
        input.getContractEndDate());
    applyInput(record, input);
    record.store();
    record.refresh();
    return record.into(Contract.class);
  }

  /** コース契約を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteContract(String contractId) {
    delete(contractId);
    return true;
  }

  /** 入力値を契約レコードへ反映します。 */
  private void applyInput(ContractRecord record, ContractInput input) {
    record.setCourseType(input.getCourseType());
    record.setCoursePlanName(StringUtils.defaultIfBlank(input.getCoursePlanName(), null));
    record.setContractStartDate(input.getContractStartDate());
    record.setContractEndDate(input.getContractEndDate());
    record.setSubjectId(input.getSubjectId());
    record.setWeeklyLessons(input.getWeeklyLessons());
    record.setPreferredWeekday(input.getPreferredWeekday());
    record.setPreferredStartTime(input.getPreferredStartTime());
    record.setPreferredEndTime(input.getPreferredEndTime());
    record.setMonthlyFee(input.getMonthlyFee());
    record.setDiscountAmount(input.getDiscountAmount());
    record.setSeatGenerationEligible(input.getSeatGenerationEligible());
    record.setNote(StringUtils.defaultIfBlank(input.getNote(), null));
    record.setUpdatedAt(LocalDateTime.now());
    record.setIsDeleted(false);
  }

  /** コース入力の基本整合性を検証します。 */
  private void validateInput(ContractInput input) {
    if (input == null) {
      throw new BadRequestException("contract input is required");
    }
    if (!COURSE_TYPES.contains(input.getCourseType())) {
      throw new BadRequestException("invalid course type: " + input.getCourseType());
    }
    if (input.getContractEndDate() != null
        && input.getContractEndDate().isBefore(input.getContractStartDate())) {
      throw new BadRequestException("contract end date must be after start date");
    }
  }

  /** 新コース開始日以降に始まる既存コースがあれば、プロトタイプでは登録を止めます。 */
  private void rejectFutureOrSameStartCourse(String studentId, LocalDate startDate) {
    boolean exists = dsl().fetchExists(
        dsl().selectOne().from(CONTRACT).where(activeStudentContractCondition(studentId))
            .and(CONTRACT.CONTRACT_START_DATE.ge(startDate)));
    if (exists) {
      throw new BadRequestException("future course already exists for student: " + studentId);
    }
  }

  /** 新コース開始日前日に、既存の重複コース終了日を設定します。 */
  private void closePreviousContracts(String studentId, LocalDate startDate) {
    dsl().update(CONTRACT).set(CONTRACT.CONTRACT_END_DATE, startDate.minusDays(1))
        .set(CONTRACT.UPDATED_AT, LocalDateTime.now())
        .where(activeStudentContractCondition(studentId))
        .and(CONTRACT.CONTRACT_START_DATE.lt(startDate))
        .and(CONTRACT.CONTRACT_END_DATE.isNull().or(CONTRACT.CONTRACT_END_DATE.ge(startDate)))
        .execute();
  }

  /** 更新後の期間が他のコース契約と重ならないことを確認します。 */
  private void assertNoOverlap(String studentId, String contractId, LocalDate startDate,
      LocalDate endDate) {
    Condition condition = activeStudentContractCondition(studentId).and(CONTRACT.ID.ne(contractId))
        .and(
            CONTRACT.CONTRACT_START_DATE.le(endDate == null ? LocalDate.of(9999, 12, 31) : endDate))
        .and(CONTRACT.CONTRACT_END_DATE.isNull().or(CONTRACT.CONTRACT_END_DATE.ge(startDate)));
    if (dsl().fetchExists(dsl().selectOne().from(CONTRACT).where(condition))) {
      throw new BadRequestException("course period overlaps with another course");
    }
  }

  /** 有効な生徒コース契約を対象にする共通条件を返します。 */
  private Condition activeStudentContractCondition(String studentId) {
    return CONTRACT.STUDENT_ID.eq(studentId).and(CONTRACT.STATUS.eq("active"))
        .and(CONTRACT.IS_DELETED.isFalse());
  }
}
