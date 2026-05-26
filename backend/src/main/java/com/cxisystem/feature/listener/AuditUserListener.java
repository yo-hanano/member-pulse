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
 * INSERT/UPDATE 時に create_user_id / update_user_id を現在ユーザーで補完します。 audit
 * カラムを持たないテーブルでは何もしない共通リスナーです。
 */
@ApplicationScoped
public class AuditUserListener implements RecordListener {

  private static final String CREATED_FIELD = "create_user_id";
  private static final String UPDATED_FIELD = "update_user_id";

  @Override
  public void insertStart(RecordContext ctx) {
    if (!(ctx.record() instanceof TableRecord<?> tableRecord)) {
      return;
    }
    applyUser(tableRecord, CREATED_FIELD, true);
  }

  @Override
  public void updateStart(RecordContext ctx) {
    if (!(ctx.record() instanceof TableRecord<?> tableRecord)) {
      return;
    }
    applyUser(tableRecord, UPDATED_FIELD, false);
  }

  /**
   * 指定カラムを現在ユーザーで埋めます。
   *
   * @param tableRecord 対象レコード
   * @param fieldName 対象カラム名
   * @param skipIfPresent 既存値を尊重するかどうか
   */
  private void applyUser(TableRecord<?> tableRecord, String fieldName, boolean skipIfPresent) {
    Table<?> table = tableRecord.getTable();
    if (table == null) {
      return;
    }

    Field<Integer> targetField = table.field(DSL.name(fieldName), SQLDataType.INTEGER);
    if (targetField == null) {
      return;
    }

    if (skipIfPresent && tableRecord.get(targetField) != null) {
      return;
    }

    String userId = AuthContextUtil.getCurrentUserId();
    if (userId == null || userId.isBlank()) {
      return;
    }

    try {
      tableRecord.set(targetField, Integer.parseInt(userId));
    } catch (NumberFormatException ignored) {
      // userId が数値でない環境では、何もせず既存値を壊さない。
    }
  }
}
