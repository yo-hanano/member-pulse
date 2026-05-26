package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Lead.LEAD;

import com.cxisystem.feature.input.LeadFilterInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.jooq.tables.records.LeadRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * リード一覧・詳細取得の SQL をまとめる Dao です。 画面側の検索条件を jOOQ 条件へ変換する責務に寄せます。
 */
@ApplicationScoped
@NoArgsConstructor
public class LeadDao extends AbstractDao<LeadRecord, String> {

  /** リードテーブルを扱う Dao を初期化します。 */
  @Inject
  public LeadDao(DSLContext dsl) {
    super(dsl, LEAD, LEAD.ID);
  }

  /** 絞り込み条件つきでリード一覧をページ単位に取得します。 */
  public List<LeadRecord> pagination(Pagination pagination, LeadFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /** 絞り込み条件に一致するリード件数を返します。 */
  public Integer fetchCount(LeadFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(LeadFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (filter.getInquiryAtFrom() != null) {
      condition = condition.and(LEAD.INQUIRY_AT.ge(filter.getInquiryAtFrom()));
    }
    if (filter.getInquiryAtTo() != null) {
      condition = condition.and(LEAD.INQUIRY_AT.le(filter.getInquiryAtTo()));
    }
    if (StringUtils.isNotBlank(filter.getBranchId())) {
      condition = condition.and(LEAD.LOCATION_ID.eq(filter.getBranchId()));
    }
    if (StringUtils.isNotBlank(filter.getStudentName())) {
      condition = condition.and(LEAD.NAME.like("%" + filter.getStudentName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getChannel())) {
      condition = condition.and(LEAD.SOURCE.like("%" + filter.getChannel() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getStatus())) {
      condition = condition.and(LEAD.STATUS.eq(filter.getStatus()));
    }

    return condition;
  }
}
