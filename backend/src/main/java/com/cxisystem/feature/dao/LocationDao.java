package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Location.LOCATION;

import com.cxisystem.feature.input.LocationFilterInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.jooq.tables.records.LocationRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 拠点一覧・詳細取得の SQL をまとめる Dao です。 location は deleted_at による論理削除を使います。
 */
@ApplicationScoped
@NoArgsConstructor
public class LocationDao extends AbstractDao<LocationRecord, String> {

  /** 拠点テーブルを扱う Dao を初期化します。 */
  @Inject
  public LocationDao(DSLContext dsl) {
    super(dsl, LOCATION, LOCATION.ID);
  }

  /** deleted_at が未設定の拠点だけを有効データとして扱います。 */
  @Override
  protected Condition deletedCondition() {
    return LOCATION.DELETED_AT.isNull();
  }

  /** 絞り込み条件つきで拠点一覧をページ単位に取得します。 */
  public List<LocationRecord> pagination(Pagination pagination, LocationFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /** 絞り込み条件に一致する拠点件数を返します。 */
  public Integer fetchCount(LocationFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(LocationFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(LOCATION.NAME.like("%" + filter.getName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getAreaId())) {
      condition = condition.and(LOCATION.AREA_ID.eq(filter.getAreaId()));
    }
    if (StringUtils.isNotBlank(filter.getPrefectureCode())) {
      condition = condition.and(LOCATION.PREFECTURE_CODE.eq(filter.getPrefectureCode()));
    }

    return condition;
  }
}
