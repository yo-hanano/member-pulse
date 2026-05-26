package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.BillingContactInput;
import com.cxisystem.feature.input.GuardianInput;
import com.cxisystem.feature.input.LeadEnrollmentInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.StudentFilterInput;
import com.cxisystem.feature.input.StudentInput;
import com.cxisystem.feature.service.SchoolGradeService;
import com.cxisystem.feature.service.SchoolService;
import com.cxisystem.feature.service.SchoolTypeService;
import com.cxisystem.feature.service.StudentService;
import com.cxisystem.feature.type.BillingContact;
import com.cxisystem.feature.type.BranchLabel;
import com.cxisystem.feature.type.Guardian;
import com.cxisystem.feature.type.School;
import com.cxisystem.feature.type.SchoolGrade;
import com.cxisystem.feature.type.SchoolType;
import com.cxisystem.feature.type.Student;
import com.cxisystem.feature.type.StudentBillingContactInfo;
import com.cxisystem.feature.type.StudentGuardianInfo;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;

/**
 * 生徒管理画面向けの GraphQL エントリポイントです。 current schema の生徒 CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class StudentResolver extends AbstractResolver {

  @Inject
  StudentService studentService;

  @Inject
  SchoolGradeService schoolGradeService;

  @Inject
  SchoolService schoolService;

  @Inject
  SchoolTypeService schoolTypeService;

  /** すべての生徒を返します。 */
  @Query("allStudents")
  @RolesAllowed("admin")
  public List<Student> getAllStudents() {
    return studentService.findAll();
  }

  /** 条件付きの生徒一覧をページ形式で返します。 */
  @Query("studentPagination")
  @RolesAllowed("admin")
  public Page<Student> getStudentPagination(@Valid Pagination pagination,
      @Valid StudentFilterInput filter) {
    return studentService.pagination(pagination, filter);
  }

  /** ID で生徒 1 件を取得します。 */
  @Query("studentById")
  @RolesAllowed("admin")
  public Student getStudentById(@NotNull String studentId) {
    return studentService.findById(studentId);
  }

  /** 請求先候補を検索して返します。 */
  @Query("billingContactOptions")
  @RolesAllowed("admin")
  public List<BillingContact> getBillingContactOptions(String searchText) {
    return studentService.findBillingContactOptions(searchText);
  }

  /** 生徒を新規作成します。 */
  @Mutation("createStudent")
  @RolesAllowed("admin")
  public Student createStudent(@Valid StudentInput input) {
    return studentService.create(input);
  }

  /** リードを起点に生徒を新規入会登録します。 */
  @Mutation("enrollLead")
  @RolesAllowed("admin")
  public Student enrollLead(@NotNull String leadId, @Valid LeadEnrollmentInput input) {
    return studentService.enrollLead(leadId, input);
  }

  /** 生徒を更新します。 */
  @Mutation("updateStudent")
  @RolesAllowed("admin")
  public Student updateStudent(@NotNull String studentId, @Valid StudentInput input) {
    return studentService.update(studentId, input);
  }

  /** 生徒を論理削除します。 */
  @Mutation("deleteStudent")
  @RolesAllowed("admin")
  public boolean deleteStudent(@NotNull String studentId) {
    return studentService.deleteStudent(studentId);
  }

  /** 生徒に紐づく保護者を作成または更新します。 */
  @Mutation("saveStudentGuardian")
  @RolesAllowed("admin")
  public StudentGuardianInfo saveStudentGuardian(@NotNull String studentId,
      @Valid GuardianInput input) {
    return studentService.saveStudentGuardian(studentId, input);
  }

  /** 指定した保護者を生徒の主連絡先にします。 */
  @Mutation("setPrimaryStudentGuardian")
  @RolesAllowed("admin")
  public StudentGuardianInfo setPrimaryStudentGuardian(@NotNull String studentId,
      @NotNull String guardianId) {
    return studentService.setPrimaryGuardian(studentId, guardianId);
  }

  /** 生徒と保護者の紐付けを削除します。 */
  @Mutation("deleteStudentGuardian")
  @RolesAllowed("admin")
  public boolean deleteStudentGuardian(@NotNull String studentId, @NotNull String guardianId) {
    return studentService.deleteStudentGuardian(studentId, guardianId);
  }

  /** 生徒に紐づく請求先を作成または更新します。 */
  @Mutation("saveStudentBillingContact")
  @RolesAllowed("admin")
  public StudentBillingContactInfo saveStudentBillingContact(@NotNull String studentId,
      @Valid BillingContactInput input) {
    return studentService.saveStudentBillingContact(studentId, input);
  }

  /** 既存の請求先を生徒の主請求先として紐付けます。 */
  @Mutation("linkStudentBillingContact")
  @RolesAllowed("admin")
  public StudentBillingContactInfo linkStudentBillingContact(@NotNull String studentId,
      @NotNull String billingContactId) {
    return studentService.linkStudentBillingContact(studentId, billingContactId);
  }

  /** 生徒の主所属拠点 ID を解決します。 */
  @ActivateRequestContext
  public CompletableFuture<String> branchId(@Source Student student) {
    return vtSupplyAsync(() -> studentService.findPrimaryBranchId(student.getId()));
  }

  /** 生徒の主保護者を解決します。 */
  @ActivateRequestContext
  public CompletableFuture<Guardian> primaryGuardian(@Source Student student) {
    return vtSupplyAsync(() -> studentService.findPrimaryGuardian(student.getId()));
  }

  /** 生徒に紐づく保護者一覧を解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<StudentGuardianInfo>> guardians(@Source Student student) {
    return vtSupplyAsync(() -> studentService.findGuardians(student.getId()));
  }

  /** 生徒に紐づく請求先一覧を解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<StudentBillingContactInfo>> billingContacts(
      @Source Student student) {
    return vtSupplyAsync(() -> studentService.findBillingContacts(student.getId()));
  }

  /**
   * 生徒一覧の所属拠点ラベルをまとめて解決します。 主所属には印を付けて、複数拠点でも一覧で追いやすくします。
   */
  @ActivateRequestContext
  public CompletableFuture<List<List<BranchLabel>>> branchLabels(@Source List<Student> students) {
    return vtSupplyAsync(() -> {
      Set<String> studentIds = students.stream().map(Student::getId).filter(Objects::nonNull)
          .collect(Collectors.toSet());
      if (studentIds.isEmpty()) {
        return students.stream().map(ignored -> List.<BranchLabel>of()).toList();
      }

      Map<String, List<BranchLabel>> labelsByStudentId =
          studentService.findBranchLabels(studentIds);
      return students.stream()
          .map(student -> labelsByStudentId.getOrDefault(student.getId(), List.of())).toList();
    });
  }

  /**
   * 生徒一覧の学年名をまとめて解決します。 マスタ参照を 1 回にまとめ、一覧表示時の無駄な往復を避けます。
   */
  @ActivateRequestContext
  public CompletableFuture<List<String>> schoolGradeName(@Source List<Student> students) {
    return vtSupplyAsync(() -> {
      Set<String> schoolGradeCodes = students.stream().map(Student::getSchoolGradeCode)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      if (schoolGradeCodes.isEmpty()) {
        return Collections.nCopies(students.size(), null);
      }

      Map<String, String> schoolGradeNameMap = schoolGradeService.findByCodes(schoolGradeCodes)
          .stream().collect(Collectors.toMap(SchoolGrade::getCode, SchoolGrade::getName));
      return students.stream().map(student -> schoolGradeNameMap.get(student.getSchoolGradeCode()))
          .toList();
    });
  }

  /**
   * 生徒一覧の学校種名をまとめて解決します。 学校コードから学校種コードを引き、さらに学校種名へ変換します。
   */
  @ActivateRequestContext
  public CompletableFuture<List<String>> schoolTypeName(@Source List<Student> students) {
    return vtSupplyAsync(() -> {
      Set<String> schoolCodes = students.stream().map(Student::getSchoolCode)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      if (schoolCodes.isEmpty()) {
        return Collections.nCopies(students.size(), null);
      }

      Map<String, String> schoolTypeCodeBySchoolCode = schoolService.findByCodes(schoolCodes)
          .stream().collect(Collectors.toMap(School::getCode, School::getSchoolTypeCode));
      Set<String> schoolTypeCodes = schoolTypeCodeBySchoolCode.values().stream()
          .filter(Objects::nonNull).collect(Collectors.toSet());
      if (schoolTypeCodes.isEmpty()) {
        return Collections.nCopies(students.size(), null);
      }

      Map<String, String> schoolTypeNameByCode = schoolTypeService.findAll().stream()
          .filter(schoolType -> schoolTypeCodes.contains(schoolType.getCode()))
          .collect(Collectors.toMap(SchoolType::getCode, SchoolType::getName));
      return students.stream().map(student -> {
        String schoolTypeCode = schoolTypeCodeBySchoolCode.get(student.getSchoolCode());
        return schoolTypeNameByCode.get(schoolTypeCode);
      }).toList();
    });
  }
}
