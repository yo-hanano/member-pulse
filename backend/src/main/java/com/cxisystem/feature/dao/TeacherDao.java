package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Teacher.TEACHER;

import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.TeacherFilterInput;
import com.cxisystem.jooq.tables.records.TeacherRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 講師一覧・詳細取得の SQL をまとめる Dao です。 current schema の講師テーブルに対して検索条件とページングを扱います。
 */
@ApplicationScoped
@NoArgsConstructor
public class TeacherDao extends AbstractDao<TeacherRecord, String> {

  /** 講師テーブルを扱う Dao を初期化します。 */
  @Inject
  public TeacherDao(DSLContext dsl) {
    super(dsl, TEACHER, TEACHER.ID);
  }

  /** 絞り込み条件つきで講師一覧をページ単位に取得します。 */
  public List<TeacherRecord> pagination(Pagination pagination, TeacherFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /** 絞り込み条件に一致する講師件数を返します。 */
  public Integer fetchCount(TeacherFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(TeacherFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getCode())) {
      condition = condition.and(TEACHER.CODE.like("%" + filter.getCode() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(TEACHER.NAME.like("%" + filter.getName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getKana())) {
      condition = condition.and(TEACHER.KANA.like("%" + filter.getKana() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getGenderCode())) {
      condition = condition.and(TEACHER.GENDER_CODE.eq(filter.getGenderCode()));
    }
    if (StringUtils.isNotBlank(filter.getSchoolName())) {
      condition = condition.and(TEACHER.SCHOOL_NAME.like("%" + filter.getSchoolName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getSchoolGradeCode())) {
      condition = condition.and(TEACHER.SCHOOL_GRADE_CODE.eq(filter.getSchoolGradeCode()));
    }
    if (StringUtils.isNotBlank(filter.getPhone())) {
      condition = condition.and(TEACHER.PHONE.like("%" + filter.getPhone() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getEmail())) {
      condition = condition.and(TEACHER.EMAIL.like("%" + filter.getEmail() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getStatus())) {
      condition = condition.and(TEACHER.STATUS.eq(filter.getStatus()));
    }

    return condition;
  }
}
