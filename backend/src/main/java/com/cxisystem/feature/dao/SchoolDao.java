package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.School.SCHOOL;

import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.SchoolFilterInput;
import com.cxisystem.jooq.tables.records.SchoolRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 学校一覧・詳細取得の SQL をまとめる Dao です。 CSV 同期前提の学校マスタに対して検索条件とページングを扱います。
 */
@ApplicationScoped
@NoArgsConstructor
public class SchoolDao extends AbstractDao<SchoolRecord, String> {

  /** 学校テーブルを扱う Dao を初期化します。 */
  @Inject
  public SchoolDao(DSLContext dsl) {
    super(dsl, SCHOOL, SCHOOL.CODE);
  }

  /** 絞り込み条件つきで学校一覧をページ単位に取得します。 */
  public List<SchoolRecord> pagination(Pagination pagination, SchoolFilterInput filter) {
    Condition condition = buildFilterCondition(filter);
    if (pagination != null && StringUtils.isNotEmpty(pagination.getOrderBy())
        && StringUtils.isNotEmpty(pagination.getOrderDirection())) {
      return paginationByCondition(pagination, condition);
    }

    return dsl.selectFrom(SCHOOL).where(deletedCondition().and(condition))
        .orderBy(SCHOOL.PREFECTURE_CODE.asc(), SCHOOL.SCHOOL_TYPE_CODE.asc(), SCHOOL.NAME.asc(),
            SCHOOL.CODE.asc())
        .limit(pagination.getLimit()).offset(pagination.getOffset()).fetchInto(SchoolRecord.class);
  }

  /** 絞り込み条件に一致する学校件数を返します。 */
  public Integer fetchCount(SchoolFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 学校コード群に一致する学校を返します。 */
  public List<SchoolRecord> findByCodes(Set<String> codes) {
    if (codes == null || codes.isEmpty()) {
      return Collections.emptyList();
    }
    return dsl.selectFrom(SCHOOL).where(deletedCondition().and(SCHOOL.CODE.in(codes)))
        .orderBy(SCHOOL.CODE.asc()).fetchInto(SchoolRecord.class);
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(SchoolFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (StringUtils.isNotBlank(filter.getCode())) {
      condition = condition.and(SCHOOL.CODE.like("%" + filter.getCode() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(SCHOOL.NAME.like("%" + filter.getName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getPrefectureCode())) {
      condition = condition.and(SCHOOL.PREFECTURE_CODE.eq(filter.getPrefectureCode()));
    }
    if (StringUtils.isNotBlank(filter.getSchoolTypeCode())) {
      condition = condition.and(SCHOOL.SCHOOL_TYPE_CODE.eq(filter.getSchoolTypeCode()));
    }
    if (filter.getEstablishmentKbn() != null) {
      condition = condition.and(SCHOOL.ESTABLISHMENT_KBN.eq(filter.getEstablishmentKbn()));
    }

    return condition;
  }
}
