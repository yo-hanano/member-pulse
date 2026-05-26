package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.SchoolGrade.SCHOOL_GRADE;

import com.cxisystem.jooq.tables.records.SchoolGradeRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Set;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 学年マスタの SQL をまとめる Dao です。 参照専用に絞り、選択肢表示で使う取得処理だけを持ちます。
 */
@ApplicationScoped
@NoArgsConstructor
public class SchoolGradeDao {

  private DSLContext dsl;

  /** 学年マスタ参照用の Dao を初期化します。 */
  @Inject
  public SchoolGradeDao(DSLContext dsl) {
    this.dsl = dsl;
  }

  /** 並び順どおりに学年一覧を返します。 */
  public List<SchoolGradeRecord> findAll() {
    return dsl.selectFrom(SCHOOL_GRADE)
        .orderBy(SCHOOL_GRADE.SORT_ORDER.asc(), SCHOOL_GRADE.CODE.asc()).fetch();
  }

  /** 指定された学年コードに一致する行を 1 件返します。 */
  public SchoolGradeRecord findByCode(String code) {
    if (code == null) {
      return null;
    }
    return dsl.selectFrom(SCHOOL_GRADE).where(SCHOOL_GRADE.CODE.eq(code))
        .fetchOneInto(SchoolGradeRecord.class);
  }

  /** 指定された学年コード群に一致する行をまとめて返します。 */
  public List<SchoolGradeRecord> findByCodes(Set<String> codes) {
    if (codes == null || codes.isEmpty()) {
      return List.of();
    }
    return dsl.selectFrom(SCHOOL_GRADE).where(SCHOOL_GRADE.CODE.in(codes))
        .orderBy(SCHOOL_GRADE.SORT_ORDER.asc(), SCHOOL_GRADE.CODE.asc()).fetch();
  }
}
