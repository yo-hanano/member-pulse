package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.School.SCHOOL;
import static com.cxisystem.jooq.tables.Student.STUDENT;
import static com.cxisystem.jooq.tables.StudentBranch.STUDENT_BRANCH;

import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.StudentFilterInput;
import com.cxisystem.jooq.tables.records.StudentRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 生徒一覧・詳細取得の SQL をまとめる Dao です。 current schema の生徒テーブルに対して検索条件とページングを扱います。
 */
@ApplicationScoped
@NoArgsConstructor
public class StudentDao extends AbstractDao<StudentRecord, String> {

  /** 生徒テーブルを扱う Dao を初期化します。 */
  @Inject
  public StudentDao(DSLContext dsl) {
    super(dsl, STUDENT, STUDENT.ID);
  }

  /** 絞り込み条件つきで生徒一覧をページ単位に取得します。 */
  public List<StudentRecord> pagination(Pagination pagination, StudentFilterInput filter) {
    Condition condition = buildFilterCondition(filter);
    if (pagination != null && StringUtils.isNotEmpty(pagination.getOrderBy())
        && StringUtils.isNotEmpty(pagination.getOrderDirection())) {
      return paginationByCondition(pagination, condition);
    }

    return dsl.selectFrom(STUDENT).where(deletedCondition().and(condition))
        .orderBy(STUDENT.CREATED_AT.desc().nullsLast(), STUDENT.CODE.asc())
        .limit(pagination.getLimit()).offset(pagination.getOffset()).fetchInto(StudentRecord.class);
  }

  /** 絞り込み条件に一致する生徒件数を返します。 */
  public Integer fetchCount(StudentFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(StudentFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getCode())) {
      condition = condition.and(STUDENT.CODE.like("%" + filter.getCode() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(STUDENT.NAME.like("%" + filter.getName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getKana())) {
      condition = condition.and(STUDENT.KANA.like("%" + filter.getKana() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getSchoolName())) {
      condition = condition.and(STUDENT.SCHOOL_NAME.like("%" + filter.getSchoolName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getBranchId())) {
      condition = condition.and(DSL.exists(
          DSL.selectOne().from(STUDENT_BRANCH).where(STUDENT_BRANCH.STUDENT_ID.eq(STUDENT.ID))
              .and(STUDENT_BRANCH.BRANCH_ID.eq(filter.getBranchId()))
              .and(STUDENT_BRANCH.IS_DELETED.isFalse())));
    }
    if (StringUtils.isNotBlank(filter.getSchoolTypeCode())) {
      condition = condition
          .and(DSL.exists(DSL.selectOne().from(SCHOOL).where(SCHOOL.CODE.eq(STUDENT.SCHOOL_CODE))
              .and(SCHOOL.SCHOOL_TYPE_CODE.eq(filter.getSchoolTypeCode()))
              .and(SCHOOL.IS_DELETED.isFalse())));
    }
    if (StringUtils.isNotBlank(filter.getSchoolGradeCode())) {
      condition = condition.and(STUDENT.SCHOOL_GRADE_CODE.eq(filter.getSchoolGradeCode()));
    }
    if (StringUtils.isNotBlank(filter.getStatus())) {
      condition = condition.and(STUDENT.STATUS.eq(filter.getStatus()));
    }

    return condition;
  }
}
