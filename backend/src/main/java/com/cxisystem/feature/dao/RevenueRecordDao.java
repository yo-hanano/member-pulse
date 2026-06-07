package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.RevenueRecord.REVENUE_RECORD;

import com.cxisystem.jooq.tables.records.RevenueRecordRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDate;
import java.util.List;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;

/**
 * 売上台帳（revenue_record）の取得 SQL をまとめる Dao です。 deleted_at による論理削除を使います。
 */
@ApplicationScoped
@NoArgsConstructor
public class RevenueRecordDao extends AbstractDao<RevenueRecordRecord, String> {

  /** 売上台帳テーブルを扱う Dao を初期化します。 */
  @Inject
  public RevenueRecordDao(DSLContext dsl) {
    super(dsl, REVENUE_RECORD, REVENUE_RECORD.ID);
  }

  /** deleted_at が未設定の売上だけを有効データとして扱います。 */
  @Override
  protected Condition deletedCondition() {
    return REVENUE_RECORD.DELETED_AT.isNull();
  }

  /** 対象月（任意で拠点も）の売上明細を売上日降順で返します。 */
  public List<RevenueRecordRecord> findByMonth(LocalDate monthStart, LocalDate monthEnd,
      String locationId) {
    Condition condition =
        deletedCondition().and(REVENUE_RECORD.REVENUE_DATE.between(monthStart, monthEnd));
    if (StringUtils.isNotBlank(locationId)) {
      condition = condition.and(REVENUE_RECORD.LOCATION_ID.eq(locationId));
    }
    return dsl.selectFrom(REVENUE_RECORD).where(condition)
        .orderBy(REVENUE_RECORD.REVENUE_DATE.desc(), REVENUE_RECORD.CREATED_AT.desc()).fetch();
  }
}
