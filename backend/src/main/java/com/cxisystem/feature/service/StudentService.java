package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.Branch.BRANCH;
import static com.cxisystem.jooq.tables.Lead.LEAD;
import static com.cxisystem.jooq.tables.Student.STUDENT;
import static com.cxisystem.jooq.tables.StudentBranch.STUDENT_BRANCH;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.StudentDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.BillingContactInput;
import com.cxisystem.feature.input.GuardianInput;
import com.cxisystem.feature.input.LeadEnrollmentInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.StudentFilterInput;
import com.cxisystem.feature.input.StudentInput;
import com.cxisystem.feature.type.BillingContact;
import com.cxisystem.feature.type.BranchLabel;
import com.cxisystem.feature.type.Guardian;
import com.cxisystem.feature.type.School;
import com.cxisystem.feature.type.Student;
import com.cxisystem.feature.type.StudentBillingContactInfo;
import com.cxisystem.feature.type.StudentGuardianInfo;
import com.cxisystem.feature.util.TokenUtil;
import com.cxisystem.jooq.tables.records.LeadRecord;
import com.cxisystem.jooq.tables.records.StudentBranchRecord;
import com.cxisystem.jooq.tables.records.StudentRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Record3;

/**
 * 生徒管理の業務操作をまとめるサービスです。 current schema の CRUD と検索、論理削除を扱います。
 */
@ApplicationScoped
public class StudentService extends AbstractService<StudentRecord, Student, String, StudentDao> {

  @Inject
  StudentDao studentDao;

  @Inject
  SchoolService schoolService;

  @Inject
  GuardianService guardianService;

  @Inject
  BillingContactService billingContactService;

  /** 生徒操作に使う Dao を返します。 */
  @Override
  protected StudentDao getDao() {
    return studentDao;
  }

  /** 生徒変換先の型を返します。 */
  @Override
  protected Class<Student> getTypeClass() {
    return Student.class;
  }

  /** 条件付きの生徒一覧をページ形式で返します。 */
  @Rls
  @Transactional
  public Page<Student> pagination(Pagination pagination, StudentFilterInput filter) {
    List<Student> students = studentDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Student.class)).collect(Collectors.toList());
    long total = studentDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(students, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** 生徒を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Student create(StudentInput input) {
    StudentRecord record = newRecord(input);
    record.setSchoolCode(input.getSchoolCode());
    // 学校名は検索や一覧表示で使うため、非正規化したまま保持する。
    record.setSchoolName(resolveSchoolName(input.getSchoolCode()));
    record.setIsDeleted(false);
    record.store();
    record.refresh();
    replacePrimaryBranch(record.getId(), record.getCompanyId(), input.getBranchId());
    savePrimaryGuardian(record.getId(), record.getCompanyId(), input.getGuardian());
    return record.into(Student.class);
  }

  /** リードを起点に新規入会し、生徒・主保護者を作成してリードを入会済みにします。 */
  @Rls
  @Transactional
  public Student enrollLead(String leadId, LeadEnrollmentInput input) {
    LeadRecord leadRecord =
        dsl().selectFrom(LEAD).where(LEAD.ID.eq(leadId)).and(LEAD.IS_DELETED.isFalse())
            .fetchOptional().orElseThrow(() -> new NotFoundException("lead not found: " + leadId));
    if (!"contracted".equals(leadRecord.getStatus())) {
      throw new BadRequestException("lead is not contracted: " + leadId);
    }
    if (existsActiveStudentByLeadId(leadId)) {
      throw new BadRequestException("lead is already enrolled: " + leadId);
    }
    if (input.getGuardian() == null || StringUtils.isBlank(input.getGuardian().getName())) {
      throw new BadRequestException("guardian is required");
    }

    StudentRecord record = newRecord();
    record.setLeadId(leadId);
    record.setEnrollmentDate(input.getEnrollmentDate());
    record.setCode(input.getStudent().getCode());
    record.setName(input.getStudent().getName());
    record.setKana(input.getStudent().getKana());
    record.setBirthday(input.getStudent().getBirthday());
    record.setGenderCode(input.getStudent().getGenderCode());
    record.setSchoolCode(input.getStudent().getSchoolCode());
    // 学校名は検索や一覧表示で使うため、非正規化したまま保持する。
    record.setSchoolName(resolveSchoolName(input.getStudent().getSchoolCode()));
    record.setSchoolGradeCode(input.getStudent().getSchoolGradeCode());
    record.setStatus(input.getStudent().getStatus());
    record.setNote(input.getStudent().getNote());
    record.setIsDeleted(false);
    record.store();
    record.refresh();

    replacePrimaryBranch(record.getId(), record.getCompanyId(), input.getStudent().getBranchId());
    savePrimaryGuardian(record.getId(), record.getCompanyId(), input.getGuardian());
    billingContactService.savePrimaryBillingContact(record.getId(), record.getCompanyId(),
        input.getBillingContact());

    leadRecord.setStatus("enrolled");
    leadRecord.store();
    return record.into(Student.class);
  }

  /** 既存生徒を更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Student update(String id, StudentInput input) {
    StudentRecord record = studentDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("student not found: " + id));
    record.from(input);
    record.setSchoolCode(input.getSchoolCode());
    // 学校名は検索や一覧表示で使うため、非正規化したまま保持する。
    record.setSchoolName(resolveSchoolName(input.getSchoolCode()));
    record.store();
    record.refresh();
    replacePrimaryBranch(record.getId(), record.getCompanyId(), input.getBranchId());
    savePrimaryGuardian(record.getId(), record.getCompanyId(), input.getGuardian());
    return record.into(Student.class);
  }

  /** 生徒を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteStudent(String id) {
    delete(id);
    return true;
  }

  /** 学校コードから学校名を引き当てます。 */
  private String resolveSchoolName(String schoolCode) {
    School school = schoolService.findById(schoolCode);
    return school.getName();
  }

  /** 指定リードから既に有効な生徒が作成済みか判定します。 */
  private boolean existsActiveStudentByLeadId(String leadId) {
    return dsl().fetchExists(dsl().selectOne().from(STUDENT).where(STUDENT.LEAD_ID.eq(leadId))
        .and(STUDENT.IS_DELETED.isFalse()));
  }

  /** 生徒の主所属拠点を差し替えます。 */
  private void replacePrimaryBranch(String studentId, String companyId, String branchId) {
    dsl().deleteFrom(STUDENT_BRANCH).where(STUDENT_BRANCH.STUDENT_ID.eq(studentId)).execute();

    if (StringUtils.isBlank(branchId)) {
      return;
    }

    StudentBranchRecord branchRecord = dsl().newRecord(STUDENT_BRANCH);
    branchRecord.setId(TokenUtil.generateToken().substring(0, 21));
    branchRecord.setCompanyId(companyId);
    branchRecord.setStudentId(studentId);
    branchRecord.setBranchId(branchId);
    branchRecord.setIsPrimary(true);
    branchRecord.setIsDeleted(false);
    branchRecord.store();
  }

  /** 生徒の主所属拠点コードを返します。 */
  @Rls
  @Transactional
  public String findPrimaryBranchId(String studentId) {
    return dsl().select(STUDENT_BRANCH.BRANCH_ID).from(STUDENT_BRANCH)
        .where(STUDENT_BRANCH.STUDENT_ID.eq(studentId)).and(STUDENT_BRANCH.IS_PRIMARY.isTrue())
        .and(STUDENT_BRANCH.IS_DELETED.isFalse()).fetchOptional(STUDENT_BRANCH.BRANCH_ID)
        .orElse(null);
  }

  /** 生徒の主保護者を返します。 */
  @Rls
  @Transactional
  public Guardian findPrimaryGuardian(String studentId) {
    return guardianService.findPrimaryByStudentId(studentId);
  }

  /** 生徒に紐づく保護者をすべて返します。 */
  @Rls
  @Transactional
  public List<StudentGuardianInfo> findGuardians(String studentId) {
    return guardianService.findByStudentId(studentId);
  }

  /** 生徒に紐づく保護者を作成または更新します。 */
  @Rls
  @Transactional
  public StudentGuardianInfo saveStudentGuardian(String studentId, GuardianInput input) {
    StudentRecord record = studentDao.findOptionalById(studentId)
        .orElseThrow(() -> new NotFoundException("student not found: " + studentId));
    return guardianService.saveStudentGuardian(studentId, record.getCompanyId(), input);
  }

  /** 指定した保護者を生徒の主連絡先にします。 */
  @Rls
  @Transactional
  public StudentGuardianInfo setPrimaryGuardian(String studentId, String guardianId) {
    studentDao.findOptionalById(studentId)
        .orElseThrow(() -> new NotFoundException("student not found: " + studentId));
    return guardianService.setPrimaryGuardian(studentId, guardianId);
  }

  /** 生徒と保護者の紐付けを削除します。 */
  @Rls
  @Transactional
  public boolean deleteStudentGuardian(String studentId, String guardianId) {
    studentDao.findOptionalById(studentId)
        .orElseThrow(() -> new NotFoundException("student not found: " + studentId));
    return guardianService.deleteStudentGuardian(studentId, guardianId);
  }

  /** 請求先候補を検索して返します。 */
  @Rls
  @Transactional
  public List<BillingContact> findBillingContactOptions(String searchText) {
    return billingContactService.findOptions(searchText);
  }

  /** 生徒に紐づく請求先をすべて返します。 */
  @Rls
  @Transactional
  public List<StudentBillingContactInfo> findBillingContacts(String studentId) {
    return billingContactService.findByStudentId(studentId);
  }

  /** 生徒に紐づく請求先を作成または更新します。 */
  @Rls
  @Transactional
  public StudentBillingContactInfo saveStudentBillingContact(String studentId,
      BillingContactInput input) {
    StudentRecord record = studentDao.findOptionalById(studentId)
        .orElseThrow(() -> new NotFoundException("student not found: " + studentId));
    return billingContactService.saveStudentBillingContact(studentId, record.getCompanyId(), input);
  }

  /** 既存の請求先を生徒の主請求先として紐付けます。 */
  @Rls
  @Transactional
  public StudentBillingContactInfo linkStudentBillingContact(String studentId,
      String billingContactId) {
    StudentRecord record = studentDao.findOptionalById(studentId)
        .orElseThrow(() -> new NotFoundException("student not found: " + studentId));
    return billingContactService.linkStudentBillingContact(studentId, record.getCompanyId(),
        billingContactId);
  }

  /**
   * 生徒ごとの所属拠点ラベルをまとめて返します。 主所属には印を付け、一覧表示で複数拠点をひと目で見分けられるようにします。
   */
  @Rls
  @Transactional
  public Map<String, List<BranchLabel>> findBranchLabels(Set<String> studentIds) {
    if (studentIds == null || studentIds.isEmpty()) {
      return Collections.emptyMap();
    }

    List<Record3<String, String, Boolean>> rows = dsl()
        .select(STUDENT_BRANCH.STUDENT_ID, BRANCH.NAME, STUDENT_BRANCH.IS_PRIMARY)
        .from(STUDENT_BRANCH).join(BRANCH).on(STUDENT_BRANCH.BRANCH_ID.eq(BRANCH.ID))
        .where(STUDENT_BRANCH.STUDENT_ID.in(studentIds)).and(STUDENT_BRANCH.IS_DELETED.isFalse())
        .and(BRANCH.IS_DELETED.isFalse()).orderBy(STUDENT_BRANCH.STUDENT_ID.asc(),
            STUDENT_BRANCH.IS_PRIMARY.desc(), BRANCH.CODE.asc())
        .fetch();

    Map<String, List<BranchLabel>> labelsByStudentId = new LinkedHashMap<>();
    studentIds.forEach(studentId -> labelsByStudentId.put(studentId, new ArrayList<>()));
    rows.forEach(row -> {
      BranchLabel label = new BranchLabel();
      label.setName(row.value2() == null ? "-" : row.value2());
      label.setPrimary(Boolean.TRUE.equals(row.value3()));
      labelsByStudentId.computeIfAbsent(row.value1(), ignored -> new ArrayList<>()).add(label);
    });

    return labelsByStudentId;
  }

  /** 生徒の主保護者を保存します。 */
  private void savePrimaryGuardian(String studentId, String companyId, GuardianInput guardian) {
    guardianService.savePrimaryGuardian(studentId, companyId, guardian);
  }
}
