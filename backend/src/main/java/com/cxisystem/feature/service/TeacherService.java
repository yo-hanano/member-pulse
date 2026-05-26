package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.TeacherDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.TeacherFilterInput;
import com.cxisystem.feature.input.TeacherInput;
import com.cxisystem.feature.type.Teacher;
import com.cxisystem.jooq.tables.records.TeacherRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 講師管理の業務操作をまとめるサービスです。 current schema の CRUD と検索を扱います。
 */
@ApplicationScoped
public class TeacherService extends AbstractService<TeacherRecord, Teacher, String, TeacherDao> {

  @Inject
  TeacherDao teacherDao;

  @Inject
  SchoolService schoolService;

  /** 講師操作に使う Dao を返します。 */
  @Override
  protected TeacherDao getDao() {
    return teacherDao;
  }

  /** 講師変換先の型を返します。 */
  @Override
  protected Class<Teacher> getTypeClass() {
    return Teacher.class;
  }

  /** 条件付きの講師一覧をページ形式で返します。 */
  @Rls
  @Transactional
  public Page<Teacher> pagination(Pagination pagination, TeacherFilterInput filter) {
    List<Teacher> teachers = teacherDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Teacher.class)).collect(Collectors.toList());
    long total = teacherDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(teachers, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** 講師を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Teacher create(TeacherInput input) {
    TeacherRecord record = newRecord(input);
    record.setSchoolCode(input.getSchoolCode());
    // 学校名は検索や一覧表示で使うため、非正規化したまま保持します。
    record.setSchoolName(resolveSchoolName(input.getSchoolCode()));
    record.setIsDeleted(false);
    record.store();
    record.refresh();
    return record.into(Teacher.class);
  }

  /** 既存講師を更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Teacher update(String id, TeacherInput input) {
    TeacherRecord record = teacherDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("teacher not found: " + id));
    record.from(input);
    record.setSchoolCode(input.getSchoolCode());
    // 学校名は検索や一覧表示で使うため、非正規化したまま保持します。
    record.setSchoolName(resolveSchoolName(input.getSchoolCode()));
    record.store();
    record.refresh();
    return record.into(Teacher.class);
  }

  /** 講師を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteTeacher(String id) {
    delete(id);
    return true;
  }

  /** 学校コードから学校名を引き当てます。 */
  private String resolveSchoolName(String schoolCode) {
    return schoolService.findById(schoolCode).getName();
  }
}
