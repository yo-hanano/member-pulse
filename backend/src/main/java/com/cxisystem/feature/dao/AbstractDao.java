package com.cxisystem.feature.dao;

import com.cxisystem.feature.input.Pagination;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.SortField;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.TableRecord;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;

/**
 * jOOQ を使った共通Daoの抽象クラス。 backend 初期段階では SELECT 系の共通処理だけをここに集約する。
 */
@NoArgsConstructor
public abstract class AbstractDao<R extends TableRecord<R>, PK> {

  protected DSLContext dsl;
  protected Table<R> table;
  protected Field<PK> pkField;

  /** Dao が扱うテーブル情報と DSLContext を初期化します。 */
  protected AbstractDao(DSLContext dsl, Table<R> table, Field<PK> pkField) {
    this.dsl = dsl;
    this.table = table;
    this.pkField = pkField;
  }

  /** 利用中の DSLContext を返します。 */
  public DSLContext getDsl() {
    return dsl;
  }

  /** Dao が担当するテーブル定義を返します。 */
  public Table<R> getTable() {
    return table;
  }

  /** 主キー列の定義を返します。 */
  public Field<PK> getPkField() {
    return pkField;
  }

  /** 論理削除カラムがある場合に未削除条件を組み立てます。 */
  protected Condition deletedCondition() {
    Condition initialCondition = DSL.trueCondition();
    Field<Boolean> deletedField = table.field(DSL.name("is_deleted"), SQLDataType.BOOLEAN);
    if (deletedField != null) {
      initialCondition = initialCondition.and(deletedField.isFalse());
    }
    Field<Timestamp> deletedAtField = table.field(DSL.name("deleted_at"), SQLDataType.TIMESTAMP);
    if (deletedAtField != null) {
      initialCondition = initialCondition.and(deletedAtField.isNull());
    }
    return initialCondition;
  }

  /** 主キーで 1 件取得します。 */
  public R findById(PK id) {
    return dsl.selectFrom(table).where(pkField.eq(id)).fetchOne();
  }

  /** 論理削除を考慮して主キーで 1 件取得します。 */
  public Optional<R> findOptionalById(PK id) {
    return dsl.selectFrom(table).where(deletedCondition().and(pkField.eq(id))).fetchOptional();
  }

  /** 指定 ID 一覧に一致するレコードを取得します。 */
  public List<R> findByIds(List<PK> ids) {
    return dsl.selectFrom(table).where(deletedCondition().and(pkField.in(ids)))
        .orderBy(defaultOrderBy()).fetch();
  }

  /** 指定 ID 集合に一致するレコードを取得します。 */
  public List<R> findByIds(Set<PK> ids) {
    return dsl.selectFrom(table).where(deletedCondition().and(pkField.in(ids)))
        .orderBy(defaultOrderBy()).fetch();
  }

  /** 論理削除を除いた全件を既定順で返します。 */
  public List<R> findAll() {
    return dsl.selectFrom(table).where(deletedCondition()).orderBy(defaultOrderBy()).fetch();
  }

  /** 指定した並び順で全件を取得します。 */
  public List<R> findAll(String sortFieldName, SortOrder sortOrder) {
    if (StringUtils.isBlank(sortFieldName)) {
      return findAll();
    }
    Field<?> field = table.field(DSL.name(sortFieldName));
    if (field == null) {
      return findAll();
    }
    SortOrder order = sortOrder == null ? SortOrder.ASC : sortOrder;
    return dsl.selectFrom(table).where(deletedCondition()).orderBy(field.sort(order)).fetch();
  }

  /** 論理削除を除いた総件数を返します。 */
  public Integer fetchCount() {
    return dsl.fetchCount(dsl.select().from(table).where(deletedCondition()));
  }

  /** 指定条件に一致する総件数を返します。 */
  public Integer fetchCount(Condition condition) {
    return dsl.fetchCount(dsl.select().from(table).where(condition));
  }

  /** 指定条件に一致する行が存在するか返します。 */
  public boolean exists(Condition condition) {
    return dsl.fetchExists(dsl.select().from(table).where(condition));
  }

  /** 単純なページネーション条件で一覧を返します。 */
  public List<R> pagination(Pagination pagination) {
    return dsl.selectFrom(table).where(deletedCondition())
        .orderBy(createOrderBy(pagination, table) != null ? createOrderBy(pagination, table)
            : defaultOrderBy())
        .limit(pagination.getLimit()).offset(pagination.getOffset()).fetch();
  }

  /** 任意条件を加えたページネーション結果を返します。 */
  public List<R> paginationByCondition(Pagination pagination, Condition condition) {
    return dsl.selectFrom(table).where(deletedCondition().and(condition))
        .orderBy(createOrderBy(pagination, table) != null ? createOrderBy(pagination, table)
            : defaultOrderBy())
        .limit(pagination.getLimit()).offset(pagination.getOffset()).fetch();
  }

  /** 既定の並び順を返します。 */
  protected SortField<?> defaultOrderBy() {
    Field<?> createdAtField = table.field(DSL.name("created_at"), SQLDataType.TIMESTAMP);
    if (createdAtField != null) {
      return createdAtField.desc();
    }
    return pkField.desc();
  }

  private static SortField<?> createOrderBy(Pagination pagination, Table<?> table) {
    SortField<?> sortField = null;
    if (StringUtils.isNotEmpty(pagination.getOrderBy())
        && StringUtils.isNotEmpty(pagination.getOrderDirection())) {
      String orderField = pagination.getOrderBy();
      String direction = pagination.getOrderDirection().toUpperCase();
      Field<?> field = table.field(DSL.name(orderField));
      if (field != null) {
        sortField = field.sort(SortOrder.valueOf(direction));
      } else {
        return null;
      }
    }
    return sortField;
  }
}
