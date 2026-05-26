package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Relationship.RELATIONSHIP;

import com.cxisystem.jooq.tables.records.RelationshipRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.jooq.DSLContext;

/**
 * 続柄マスタの SQL をまとめる Dao です。
 */
@ApplicationScoped
public class RelationshipDao {

  private final DSLContext dsl;

  /**
   * 続柄マスタ参照用の Dao を初期化します。
   */
  @Inject
  public RelationshipDao(DSLContext dsl) {
    this.dsl = dsl;
  }

  /**
   * 並び順どおりに続柄一覧を返します。
   */
  public List<RelationshipRecord> findAll() {
    return dsl.selectFrom(RELATIONSHIP)
        .orderBy(RELATIONSHIP.SORT_ORDER.asc(), RELATIONSHIP.CODE.asc()).fetch();
  }

  /**
   * 指定された続柄コードに一致する行を 1 件返します。
   */
  public RelationshipRecord findByCode(String code) {
    if (code == null) {
      return null;
    }
    return dsl.selectFrom(RELATIONSHIP).where(RELATIONSHIP.CODE.eq(code))
        .fetchOneInto(RelationshipRecord.class);
  }
}
