package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Gender.GENDER;

import com.cxisystem.jooq.tables.records.GenderRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.jooq.DSLContext;

/**
 * 性別マスタの SQL をまとめる Dao です。
 */
@ApplicationScoped
public class GenderDao {

  private final DSLContext dsl;

  /**
   * 性別マスタ参照用の Dao を初期化します。
   */
  @Inject
  public GenderDao(DSLContext dsl) {
    this.dsl = dsl;
  }

  /**
   * 並び順どおりに性別一覧を返します。
   */
  public List<GenderRecord> findAll() {
    return dsl.selectFrom(GENDER).orderBy(GENDER.SORT_ORDER.asc(), GENDER.CODE.asc()).fetch();
  }

  /**
   * 指定された性別コードに一致する行を 1 件返します。
   */
  public GenderRecord findByCode(String code) {
    if (code == null) {
      return null;
    }
    return dsl.selectFrom(GENDER).where(GENDER.CODE.eq(code)).fetchOneInto(GenderRecord.class);
  }
}
