package com.cxisystem.feature.dao;

import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.ScheduleSubjectFilterInput;
import com.cxisystem.jooq.tables.ScheduleSubject;
import com.cxisystem.jooq.tables.records.ScheduleSubjectRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 予定主体テーブルを扱う Dao です。 一覧取得と件数集計だけに責務を絞ります。
 */
@ApplicationScoped
public class ScheduleSubjectDao extends AbstractDao<ScheduleSubjectRecord, String> {

  /**
   * 予定主体テーブルを扱う Dao を初期化します。
   *
   * @param dsl jOOQ DSLContext
   */
  @Inject
  public ScheduleSubjectDao(DSLContext dsl) {
    super(dsl, ScheduleSubject.SCHEDULE_SUBJECT, ScheduleSubject.SCHEDULE_SUBJECT.ID);
  }

  /**
   * 絞り込み条件つきで予定主体一覧をページ単位に取得します。
   *
   * @param pagination ページング条件
   * @param filter 検索条件
   * @return 予定主体レコード一覧
   */
  public List<ScheduleSubjectRecord> pagination(Pagination pagination,
      ScheduleSubjectFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /**
   * 絞り込み条件に一致する予定主体件数を返します。
   *
   * @param filter 検索条件
   * @return 件数
   */
  public Integer fetchCount(ScheduleSubjectFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /**
   * 画面の検索条件を SQL 条件へ組み立てます。
   *
   * @param filter 検索条件
   * @return SQL 条件
   */
  private Condition buildFilterCondition(ScheduleSubjectFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getLeadId())) {
      condition = condition.and(ScheduleSubject.SCHEDULE_SUBJECT.LEAD_ID.eq(filter.getLeadId()));
    }
    if (StringUtils.isNotBlank(filter.getStudentId())) {
      condition =
          condition.and(ScheduleSubject.SCHEDULE_SUBJECT.STUDENT_ID.eq(filter.getStudentId()));
    }
    if (StringUtils.isNotBlank(filter.getTeacherId())) {
      condition =
          condition.and(ScheduleSubject.SCHEDULE_SUBJECT.TEACHER_ID.eq(filter.getTeacherId()));
    }
    if (StringUtils.isNotBlank(filter.getGuardianId())) {
      condition =
          condition.and(ScheduleSubject.SCHEDULE_SUBJECT.GUARDIAN_ID.eq(filter.getGuardianId()));
    }

    return condition;
  }
}
