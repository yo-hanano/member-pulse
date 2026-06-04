package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Member.MEMBER;

import com.cxisystem.feature.input.MemberFilterInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.jooq.tables.records.MemberRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * 会員一覧・詳細取得の SQL をまとめる Dao です。画面側の検索条件を jOOQ 条件へ変換します。
 */
@ApplicationScoped
@NoArgsConstructor
public class MemberDao extends AbstractDao<MemberRecord, String> {

  /** 会員テーブルを扱う Dao を初期化します。 */
  @Inject
  public MemberDao(DSLContext dsl) {
    super(dsl, MEMBER, MEMBER.ID);
  }

  /** 絞り込み条件つきで会員一覧をページ単位に取得します。 */
  public List<MemberRecord> pagination(Pagination pagination, MemberFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /** 指定リードから変換済みの未削除会員が存在するか返します。 */
  public boolean existsByLeadId(String leadId) {
    return exists(deletedCondition().and(MEMBER.LEAD_ID.eq(leadId)));
  }

  /** 絞り込み条件に一致する会員件数を返します。 */
  public Integer fetchCount(MemberFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  /** 画面の検索条件を SQL 条件へ組み立てます。 */
  private Condition buildFilterCondition(MemberFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    if (filter.getJoinedAtFrom() != null) {
      condition = condition.and(MEMBER.JOINED_AT.ge(filter.getJoinedAtFrom()));
    }
    if (filter.getJoinedAtTo() != null) {
      condition = condition.and(MEMBER.JOINED_AT.le(filter.getJoinedAtTo()));
    }
    if (StringUtils.isNotBlank(filter.getLocationId())) {
      condition = condition.and(MEMBER.LOCATION_ID.eq(filter.getLocationId()));
    }
    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(MEMBER.NAME.like("%" + filter.getName() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getSource())) {
      condition = condition.and(MEMBER.SOURCE.like("%" + filter.getSource() + "%"));
    }
    if (StringUtils.isNotBlank(filter.getStatus())) {
      condition = condition.and(MEMBER.STATUS.eq(filter.getStatus()));
    }

    return condition;
  }
}
