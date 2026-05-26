package com.cxisystem.feature.listener;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import jakarta.enterprise.context.ApplicationScoped;
import org.jooq.RecordContext;
import org.jooq.RecordListener;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.TableRecord;
import org.jooq.UniqueKey;

/**
 * 文字列主キー `id` が空の場合に NanoID を採番する。 migrate 側の多くのテーブル定義をそのまま扱えるよう、backend
 * 側でも共通採番規約を揃える。
 */
@SuppressWarnings({"rawtypes", "unchecked"})
@ApplicationScoped
public class NanoIdRecordListener implements RecordListener {

  private static final char[] ALPHABET =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_".toCharArray();
  private static final int LENGTH = 21;

  /** INSERT 開始時に文字列主キー id が空なら NanoID を採番します。 */
  @Override
  public void insertStart(RecordContext context) {
    if (!(context.record() instanceof TableRecord<?> tableRecord)) {
      return;
    }

    Table<?> table = tableRecord.getTable();
    UniqueKey<?> primaryKey = table != null ? table.getPrimaryKey() : null;
    if (primaryKey == null || primaryKey.getFields().size() != 1) {
      return;
    }

    TableField idField = (TableField) primaryKey.getFields().get(0);
    if (idField.getType() != String.class || !"id".equalsIgnoreCase(idField.getName())) {
      return;
    }

    String currentValue = (String) tableRecord.get(idField);
    if (currentValue != null && !currentValue.isBlank()) {
      return;
    }

    String nanoId =
        NanoIdUtils.randomNanoId(NanoIdUtils.DEFAULT_NUMBER_GENERATOR, ALPHABET, LENGTH);
    tableRecord.set(idField, nanoId);
  }
}
