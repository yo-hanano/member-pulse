package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Area.AREA;

import com.cxisystem.feature.input.AreaFilterInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.jooq.tables.records.AreaRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * エリア一覧・詳細取得の SQL をまとめる Dao です。 画面入力から jOOQ の条件式へ変換する責務をここに寄せます。
 */
@ApplicationScoped
@NoArgsConstructor
public class AreaDao extends AbstractDao<AreaRecord, String> {

  /** エリアテーブルを扱う Dao を初期化します。 */
  @Inject
  public AreaDao(DSLContext dsl) {
    super(dsl, AREA, AREA.ID);
  }

  /** 絞り込み条件つきでエリア一覧をページ単位に取得します。 */
  public List<AreaRecord> pagination(Pagination pagination, AreaFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /** 絞り込み条件に一致するエリア件数を返します。 */
  public Integer fetchCount(AreaFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(AreaFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(AREA.NAME.like("%" + filter.getName() + "%"));
    }

    return condition;
  }
}
