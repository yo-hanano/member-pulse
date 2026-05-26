package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Employee.EMPLOYEE;

import com.cxisystem.feature.input.EmployeeFilterInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.jooq.tables.records.EmployeeRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

/**
 * employee 向けの SELECT 専用 Dao。 管理画面の一覧条件をここで閉じ込め、Service はDTO変換と業務ルールに寄せる。
 */
@ApplicationScoped
@NoArgsConstructor
public class EmployeeDao extends AbstractDao<EmployeeRecord, String> {

  /** employee テーブルを扱う Dao を初期化します。 */
  @Inject
  public EmployeeDao(DSLContext dsl) {
    super(dsl, EMPLOYEE, EMPLOYEE.ID);
  }

  /** 絞り込み条件つきで employee 一覧をページ単位に取得します。 */
  public List<EmployeeRecord> pagination(Pagination pagination, EmployeeFilterInput filter) {
    return paginationByCondition(pagination, buildFilterCondition(filter));
  }

  /** 絞り込み条件に一致する employee 件数を返します。 */
  public Integer fetchCount(EmployeeFilterInput filter) {
    return fetchCount(deletedCondition().and(buildFilterCondition(filter)));
  }

  private Condition buildFilterCondition(EmployeeFilterInput filter) {
    Condition condition = DSL.noCondition();
    if (filter == null) {
      return condition;
    }

    // 名前・メールは部分一致で管理画面検索に寄せる。
    if (StringUtils.isNotBlank(filter.getName())) {
      condition = condition.and(EMPLOYEE.NAME.like("%" + filter.getName() + "%"));
    }

    if (StringUtils.isNotBlank(filter.getEmail())) {
      condition = condition.and(EMPLOYEE.EMAIL.like("%" + filter.getEmail() + "%"));
    }

    if (filter.getIsAdmin() != null) {
      condition = condition.and(EMPLOYEE.IS_ADMIN.eq(filter.getIsAdmin()));
    }

    if (StringUtils.isNotBlank(filter.getStatus())) {
      condition = condition.and(EMPLOYEE.STATUS.eq(filter.getStatus()));
    }

    return condition;
  }
}
