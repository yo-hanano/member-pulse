package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.SchoolType.SCHOOL_TYPE;

import com.cxisystem.jooq.tables.records.SchoolTypeRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 学校種マスタの SQL をまとめる Dao です。 参照専用に絞り、選択肢表示で使う取得処理だけを持ちます。
 */
@ApplicationScoped
@NoArgsConstructor
public class SchoolTypeDao {

  private DSLContext dsl;

  /** 学校種マスタ参照用の Dao を初期化します。 */
  @Inject
  public SchoolTypeDao(DSLContext dsl) {
    this.dsl = dsl;
  }

  /** 並び順どおりに学校種一覧を返します。 */
  public List<SchoolTypeRecord> findAll() {
    return dsl.selectFrom(SCHOOL_TYPE).orderBy(SCHOOL_TYPE.SORT_ORDER.asc(), SCHOOL_TYPE.CODE.asc())
        .fetch();
  }
}
