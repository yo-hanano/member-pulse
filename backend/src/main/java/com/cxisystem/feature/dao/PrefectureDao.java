package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Prefecture.PREFECTURE;

import com.cxisystem.jooq.tables.records.PrefectureRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Set;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 都道府県マスタを読むための Dao です。 読み取り専用に絞り、選択肢表示や dataloader で使う取得だけを持ちます。
 */
@ApplicationScoped
@NoArgsConstructor
public class PrefectureDao {

  private DSLContext dsl;

  /** 都道府県マスタ参照用の Dao を初期化します。 */
  @Inject
  public PrefectureDao(DSLContext dsl) {
    this.dsl = dsl;
  }

  /** 並び順どおりに都道府県一覧を返します。 */
  public List<PrefectureRecord> findAll() {
    return dsl.selectFrom(PREFECTURE).orderBy(PREFECTURE.SORT_ORDER.asc()).fetch();
  }

  /** 指定された都道府県コードに一致する行だけを返します。 */
  public List<PrefectureRecord> findByCodes(Set<String> codes) {
    if (codes == null || codes.isEmpty()) {
      return List.of();
    }
    return dsl.selectFrom(PREFECTURE).where(PREFECTURE.CODE.in(codes))
        .orderBy(PREFECTURE.SORT_ORDER.asc()).fetch();
  }
}
