package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.TeacherFilterInput;
import com.cxisystem.feature.input.TeacherInput;
import com.cxisystem.feature.service.TeacherService;
import com.cxisystem.feature.type.Teacher;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;

/**
 * 講師管理画面向けの GraphQL エントリポイントです。 current schema の講師 CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class TeacherResolver extends AbstractResolver {

  @Inject
  TeacherService teacherService;

  /** すべての講師を返します。 */
  @Query("allTeachers")
  @RolesAllowed("admin")
  public List<Teacher> getAllTeachers() {
    return teacherService.findAll();
  }

  /** 条件付きの講師一覧をページ形式で返します。 */
  @Query("teacherPagination")
  @RolesAllowed("admin")
  public Page<Teacher> getTeacherPagination(@Valid Pagination pagination,
      @Valid TeacherFilterInput filter) {
    return teacherService.pagination(pagination, filter);
  }

  /** ID で講師 1 件を取得します。 */
  @Query("teacherById")
  @RolesAllowed("admin")
  public Teacher getTeacherById(@NotNull String teacherId) {
    return teacherService.findById(teacherId);
  }

  /** 講師を新規作成します。 */
  @Mutation("createTeacher")
  @RolesAllowed("admin")
  public Teacher createTeacher(@Valid TeacherInput input) {
    return teacherService.create(input);
  }

  /** 講師を更新します。 */
  @Mutation("updateTeacher")
  @RolesAllowed("admin")
  public Teacher updateTeacher(@NotNull String teacherId, @Valid TeacherInput input) {
    return teacherService.update(teacherId, input);
  }

  /** 講師を論理削除します。 */
  @Mutation("deleteTeacher")
  @RolesAllowed("admin")
  public boolean deleteTeacher(@NotNull String teacherId) {
    return teacherService.deleteTeacher(teacherId);
  }
}
