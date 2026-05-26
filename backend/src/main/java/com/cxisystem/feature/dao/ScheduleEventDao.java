package com.cxisystem.feature.dao;

import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.ScheduleEventFilterInput;
import com.cxisystem.jooq.tables.ScheduleEvent;
import com.cxisystem.jooq.tables.records.ScheduleEventRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 予定テーブルを扱う Dao です。 一覧取得と件数集計だけに責務を絞ります。
 */
@ApplicationScoped
public class ScheduleEventDao extends AbstractDao<ScheduleEventRecord, String> {

  /**
   * 予定テーブルを扱う Dao を初期化します。
   *
   * @param dsl jOOQ DSLContext
   */
  @Inject
  public ScheduleEventDao(DSLContext dsl) {
    super(dsl, ScheduleEvent.SCHEDULE_EVENT, ScheduleEvent.SCHEDULE_EVENT.ID);
  }

  /**
   * 絞り込み条件つきで予定一覧をページ単位に取得します。
   *
   * @param pagination ページング条件
   * @param filter 検索条件
   * @return 予定レコード一覧
   */
  public List<ScheduleEventRecord> pagination(Pagination pagination,
      ScheduleEventFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /**
   * 絞り込み条件に一致する予定件数を返します。
   *
   * @param filter 検索条件
   * @return 件数
   */
  public Integer fetchCount(ScheduleEventFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /**
   * 画面の検索条件を SQL 条件へ組み立てます。
   *
   * @param filter 検索条件
   * @return SQL 条件
   */
  private Condition buildFilterCondition(ScheduleEventFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getScheduleSubjectId())) {
      condition = condition
          .and(ScheduleEvent.SCHEDULE_EVENT.SCHEDULE_SUBJECT_ID.eq(filter.getScheduleSubjectId()));
    }
    if (StringUtils.isNotBlank(filter.getScheduleType())) {
      condition =
          condition.and(ScheduleEvent.SCHEDULE_EVENT.SCHEDULE_TYPE.eq(filter.getScheduleType()));
    }
    if (StringUtils.isNotBlank(filter.getStatus())) {
      condition = condition.and(ScheduleEvent.SCHEDULE_EVENT.STATUS.eq(filter.getStatus()));
    }
    if (StringUtils.isNotBlank(filter.getReason())) {
      condition =
          condition.and(ScheduleEvent.SCHEDULE_EVENT.REASON.like("%" + filter.getReason() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getNote())) {
      condition =
          condition.and(ScheduleEvent.SCHEDULE_EVENT.NOTE.like("%" + filter.getNote() + "%"));
    }

    return condition;
  }
}
