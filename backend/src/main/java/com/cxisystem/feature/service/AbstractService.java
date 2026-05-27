package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.AbstractDao;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.TableRecord;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;

/**
 * 共通の検索・削除処理と RLS 適用境界をまとめたサービス基底クラス。 個別機能はこの土台の上に create/update/filter などを積む。
 */
@ApplicationScoped
public abstract class AbstractService<R extends TableRecord<R>, T, PK, D extends AbstractDao<R, PK>> {

  /** 個別サービスが利用する Dao を返します。 */
  protected abstract D getDao();

  /** jOOQ Record から変換する GraphQL / DTO 型を返します。 */
  protected abstract Class<T> getTypeClass();

  /** 利用する Dao への短縮アクセサを返します。 */
  protected D dao() {
    return getDao();
  }

  /** Dao が利用する DSLContext を返します。 */
  protected DSLContext dsl() {
    return dao().getDsl();
  }

  /** 対象テーブル定義を返します。 */
  protected Table<R> table() {
    return dao().getTable();
  }

  /** 対象テーブルの主キー列定義を返します。 */
  protected Field<PK> pkField() {
    return dao().getPkField();
  }

  /** 空の jOOQ Record を新規生成します。 */
  protected R newRecord() {
    return dsl().newRecord(table());
  }

  /** 入力オブジェクトを元に jOOQ Record を新規生成します。 */
  protected R newRecord(Object object) {
    return dsl().newRecord(table(), object);
  }

  /** 論理削除を除いた全件を型変換して返します。 */
  @Rls
  @Transactional
  @SuppressWarnings("null")
  public List<T> findAll() {
    return dao().findAll().stream().map(record -> record.into(getTypeClass()))
        .collect(Collectors.toList());
  }

  /** 指定した並び順で全件を型変換して返します。 */
  @Rls
  @Transactional
  @SuppressWarnings("null")
  public List<T> findAll(String sortFieldName, SortOrder sortOrder) {
    return dao().findAll(sortFieldName, sortOrder).stream()
        .map(record -> record.into(getTypeClass())).collect(Collectors.toList());
  }

  /** 主キーで 1 件取得し、存在しなければ NotFound を返します。 */
  @Rls
  @Transactional
  @SuppressWarnings("null")
  public T findById(PK id) {
    return dao().findOptionalById(id).map(record -> record.into(getTypeClass()))
        .orElseThrow(() -> new NotFoundException("not found id: " + id));
  }

  /** 指定 ID 群に一致するレコード一覧を型変換して返します。 */
  @Rls
  @Transactional
  @SuppressWarnings("null")
  public List<T> findByIds(Set<PK> ids) {
    return dao().findByIds(ids).stream().map(record -> record.into(getTypeClass()))
        .collect(Collectors.toList());
  }

  /** 論理削除フラグまたは削除日時を更新して対象レコードを削除扱いにします。 */
  @Rls
  @Transactional
  public int delete(PK id) {
    Field<Boolean> deletedField = table().field(DSL.name("is_deleted"), SQLDataType.BOOLEAN);
    Field<Timestamp> deletedAtField = table().field(DSL.name("deleted_at"), SQLDataType.TIMESTAMP);
    if (deletedField == null && deletedAtField == null) {
      throw new IllegalStateException("is_deleted または deleted_at フィールドが存在しません。");
    }

    Timestamp deletedAt = Timestamp.from(Instant.now());
    if (deletedField != null && deletedAtField != null) {
      return dsl().update(table()).set(deletedField, true).set(deletedAtField, deletedAt)
          .where(pkField().eq(id)).execute();
    }
    if (deletedField != null) {
      return dsl().update(table()).set(deletedField, true).where(pkField().eq(id)).execute();
    }
    return dsl().update(table()).set(deletedAtField, deletedAt).where(pkField().eq(id)).execute();
  }

  /** 物理削除で対象レコードを削除します。 */
  @Rls
  @Transactional
  public int physicalDelete(PK id) {
    return dsl().delete(table()).where(pkField().eq(id)).execute();
  }
}
