package com.cxisystem.feature.listener;

import jakarta.enterprise.context.ApplicationScoped;
import java.sql.Timestamp;
import java.time.Instant;
import org.jooq.Field;
import org.jooq.RecordContext;
import org.jooq.RecordListener;
import org.jooq.Table;
import org.jooq.TableRecord;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;

/**
 * created_at / updated_at を自動で補完する共通リスナー。 migrate 側の共通カラム規約に backend
 * の書込処理を合わせるために使う。
 */
@ApplicationScoped
public class DateAtListener implements RecordListener {

  /** INSERT 時に created_at を補完します。 */
  @Override
  public void insertStart(RecordContext context) {
    if (context.record() instanceof TableRecord<?> tableRecord) {
      applyTimestamp(tableRecord, "created_at");
    }
  }

  /** UPDATE 時に updated_at を補完します。 */
  @Override
  public void updateStart(RecordContext context) {
    if (context.record() instanceof TableRecord<?> tableRecord) {
      applyTimestamp(tableRecord, "updated_at");
    }
  }

  /** 指定カラムへ現在時刻を補完します。 */
  private void applyTimestamp(TableRecord<?> tableRecord, String fieldName) {
    Table<?> table = tableRecord.getTable();
    if (table == null) {
      return;
    }

    Field<Timestamp> targetField = table.field(DSL.name(fieldName), SQLDataType.TIMESTAMP);
    if (targetField != null) {
      tableRecord.set(targetField, Timestamp.from(Instant.now()));
    }
  }
}
