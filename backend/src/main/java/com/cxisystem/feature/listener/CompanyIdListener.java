package com.cxisystem.feature.listener;

import com.cxisystem.feature.util.AuthContextUtil;
import jakarta.enterprise.context.ApplicationScoped;
import org.jooq.Field;
import org.jooq.RecordContext;
import org.jooq.RecordListener;
import org.jooq.Table;
import org.jooq.TableRecord;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;

/**
 * INSERT 時に company_id が未設定なら現在の companyId を補完する。 RLS 前提の業務テーブルで company_id
 * のセット漏れを減らすための共通リスナー。
 */
@ApplicationScoped
public class CompanyIdListener implements RecordListener {

  /** INSERT 開始時に company_id の補完が必要か判定して設定します。 */
  @Override
  public void insertStart(RecordContext context) {
    if (!(context.record() instanceof TableRecord<?> tableRecord)) {
      return;
    }

    Table<?> table = tableRecord.getTable();
    if (table == null) {
      return;
    }

    Field<String> companyIdField = table.field(DSL.name("company_id"), SQLDataType.VARCHAR);
    if (companyIdField == null) {
      return;
    }

    if (tableRecord.get(companyIdField) != null) {
      return;
    }

    String companyId = AuthContextUtil.getCurrentCompanyId();
    if (companyId != null && !companyId.isBlank()) {
      tableRecord.set(companyIdField, companyId);
    }
  }
}
