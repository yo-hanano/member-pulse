package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.ScheduleSubjectFilterInput;
import com.cxisystem.feature.input.ScheduleSubjectInput;
import com.cxisystem.feature.service.GuardianService;
import com.cxisystem.feature.service.LeadService;
import com.cxisystem.feature.service.ScheduleSubjectService;
import com.cxisystem.feature.service.StudentService;
import com.cxisystem.feature.service.TeacherService;
import com.cxisystem.feature.type.Guardian;
import com.cxisystem.feature.type.Lead;
import com.cxisystem.feature.type.ScheduleSubject;
import com.cxisystem.feature.type.Student;
import com.cxisystem.feature.type.Teacher;
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
 * 予定主体管理画面向けの GraphQL エントリポイントです。 予定主体 CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class ScheduleSubjectResolver extends AbstractResolver {

  @Inject
  ScheduleSubjectService scheduleSubjectService;

  @Inject
  LeadService leadService;

  @Inject
  StudentService studentService;

  @Inject
  TeacherService teacherService;

  @Inject
  GuardianService guardianService;

  /** すべての予定主体を返します。 */
  @Query("allScheduleSubjects")
  @RolesAllowed("admin")
  public List<ScheduleSubject> getAllScheduleSubjects() {
    return scheduleSubjectService.findAll();
  }

  /** 条件付きの予定主体一覧をページ形式で返します。 */
  @Query("scheduleSubjectPagination")
  @RolesAllowed("admin")
  public Page<ScheduleSubject> getScheduleSubjectPagination(@Valid Pagination pagination,
      @Valid ScheduleSubjectFilterInput filter) {
    return scheduleSubjectService.pagination(pagination, filter);
  }

  /** ID で予定主体 1 件を取得します。 */
  @Query("scheduleSubjectById")
  @RolesAllowed("admin")
  public ScheduleSubject getScheduleSubjectById(@NotNull String scheduleSubjectId) {
    return scheduleSubjectService.findById(scheduleSubjectId);
  }

  /** 予定主体を新規作成します。 */
  @Mutation("createScheduleSubject")
  @RolesAllowed("admin")
  public ScheduleSubject createScheduleSubject(@Valid ScheduleSubjectInput input) {
    return scheduleSubjectService.create(input);
  }

  /** 予定主体を更新します。 */
  @Mutation("updateScheduleSubject")
  @RolesAllowed("admin")
  public ScheduleSubject updateScheduleSubject(@NotNull String scheduleSubjectId,
      @Valid ScheduleSubjectInput input) {
    return scheduleSubjectService.update(scheduleSubjectId, input);
  }

  /** 予定主体を論理削除します。 */
  @Mutation("deleteScheduleSubject")
  @RolesAllowed("admin")
  public boolean deleteScheduleSubject(@NotNull String scheduleSubjectId) {
    return scheduleSubjectService.deleteScheduleSubject(scheduleSubjectId);
  }

  /** 予定主体一覧に紐づくリードをまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Lead>> lead(@Source List<ScheduleSubject> scheduleSubjects) {
    return vtSupplyAsync(() -> resolveLead(scheduleSubjects));
  }

  /** 予定主体一覧に紐づく生徒をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Student>> student(@Source List<ScheduleSubject> scheduleSubjects) {
    return vtSupplyAsync(() -> resolveStudent(scheduleSubjects));
  }

  /** 予定主体一覧に紐づく講師をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Teacher>> teacher(@Source List<ScheduleSubject> scheduleSubjects) {
    return vtSupplyAsync(() -> resolveTeacher(scheduleSubjects));
  }

  /** 予定主体一覧に紐づく保護者をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Guardian>> guardian(
      @Source List<ScheduleSubject> scheduleSubjects) {
    return vtSupplyAsync(() -> resolveGuardian(scheduleSubjects));
  }

  /**
   * 予定主体一覧のリード参照を解決します。
   *
   * @param scheduleSubjects 予定主体一覧
   * @return 解決済みリード一覧
   */
  private List<Lead> resolveLead(List<ScheduleSubject> scheduleSubjects) {
    Set<String> leadIds = scheduleSubjects.stream().map(ScheduleSubject::getLeadId)
        .filter(Objects::nonNull).collect(Collectors.toSet());
    if (leadIds.isEmpty()) {
      return Collections.nCopies(scheduleSubjects.size(), null);
    }

    Map<String, Lead> leadMap = leadService.findByIds(leadIds).stream()
        .collect(Collectors.toMap(Lead::getId, lead -> lead));
    return scheduleSubjects.stream().map(subject -> leadMap.get(subject.getLeadId())).toList();
  }

  /**
   * 予定主体一覧の生徒参照を解決します。
   *
   * @param scheduleSubjects 予定主体一覧
   * @return 解決済み生徒一覧
   */
  private List<Student> resolveStudent(List<ScheduleSubject> scheduleSubjects) {
    Set<String> studentIds = scheduleSubjects.stream().map(ScheduleSubject::getStudentId)
        .filter(Objects::nonNull).collect(Collectors.toSet());
    if (studentIds.isEmpty()) {
      return Collections.nCopies(scheduleSubjects.size(), null);
    }

    Map<String, Student> studentMap = studentService.findByIds(studentIds).stream()
        .collect(Collectors.toMap(Student::getId, student -> student));
    return scheduleSubjects.stream().map(subject -> studentMap.get(subject.getStudentId()))
        .toList();
  }

  /**
   * 予定主体一覧の講師参照を解決します。
   *
   * @param scheduleSubjects 予定主体一覧
   * @return 解決済み講師一覧
   */
  private List<Teacher> resolveTeacher(List<ScheduleSubject> scheduleSubjects) {
    Set<String> teacherIds = scheduleSubjects.stream().map(ScheduleSubject::getTeacherId)
        .filter(Objects::nonNull).collect(Collectors.toSet());
    if (teacherIds.isEmpty()) {
      return Collections.nCopies(scheduleSubjects.size(), null);
    }

    Map<String, Teacher> teacherMap = teacherService.findByIds(teacherIds).stream()
        .collect(Collectors.toMap(Teacher::getId, teacher -> teacher));
    return scheduleSubjects.stream().map(subject -> teacherMap.get(subject.getTeacherId()))
        .toList();
  }

  /**
   * 予定主体一覧の保護者参照を解決します。
   *
   * @param scheduleSubjects 予定主体一覧
   * @return 解決済み保護者一覧
   */
  private List<Guardian> resolveGuardian(List<ScheduleSubject> scheduleSubjects) {
    Set<String> guardianIds = scheduleSubjects.stream().map(ScheduleSubject::getGuardianId)
        .filter(Objects::nonNull).collect(Collectors.toSet());
    if (guardianIds.isEmpty()) {
      return Collections.nCopies(scheduleSubjects.size(), null);
    }

    Map<String, Guardian> guardianMap = guardianService.findByIds(guardianIds).stream()
        .collect(Collectors.toMap(Guardian::getId, guardian -> guardian));
    return scheduleSubjects.stream().map(subject -> guardianMap.get(subject.getGuardianId()))
        .toList();
  }
}
