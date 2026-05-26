package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Area.AREA;
import static com.cxisystem.jooq.tables.Branch.BRANCH;

import com.cxisystem.feature.input.BranchFilterInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.jooq.tables.records.BranchRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 拠点一覧・詳細取得の SQL をまとめる Dao です。 エリア順の既定並びや画面検索条件の解釈をここで扱います。
 */
@ApplicationScoped
@NoArgsConstructor
public class BranchDao extends AbstractDao<BranchRecord, String> {

  /** 拠点テーブルを扱う Dao を初期化します。 */
  @Inject
  public BranchDao(DSLContext dsl) {
    super(dsl, BRANCH, BRANCH.ID);
  }

  /** 絞り込み条件つきで拠点一覧をページ単位に取得します。 */
  public List<BranchRecord> pagination(Pagination pagination, BranchFilterInput filter) {
    Condition condition = buildFilterCondition(filter);
    if (pagination != null && StringUtils.isNotEmpty(pagination.getOrderBy())
        && StringUtils.isNotEmpty(pagination.getOrderDirection())) {
      return paginationByCondition(pagination, condition);
    }

    return dsl.select(BRANCH.fields()).from(BRANCH).leftJoin(AREA).on(BRANCH.AREA_ID.eq(AREA.ID))
        .where(deletedCondition().and(condition))
        .orderBy(AREA.DISP_ORDER.asc().nullsLast(), BRANCH.CODE.asc()).limit(pagination.getLimit())
        .offset(pagination.getOffset()).fetchInto(BranchRecord.class);
  }

  /** 絞り込み条件に一致する拠点件数を返します。 */
  public Integer fetchCount(BranchFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(BranchFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(BRANCH.NAME.like("%" + filter.getName() + "%"));
    }

    if (StringUtils.isNotBlank(filter.getCode())) {
      condition = condition.and(BRANCH.CODE.like("%" + filter.getCode() + "%"));
    }

    if (StringUtils.isNotBlank(filter.getAreaId())) {
      condition = condition.and(BRANCH.AREA_ID.eq(filter.getAreaId()));
    }

    return condition;
  }
}
