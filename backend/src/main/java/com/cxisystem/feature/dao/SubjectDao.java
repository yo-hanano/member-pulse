package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Subject.SUBJECT;

import com.cxisystem.jooq.tables.records.SubjectRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 科目マスタの検索・取得に使う Dao です。 コース登録の選択肢を提供します。
 */
@ApplicationScoped
@NoArgsConstructor
public class SubjectDao extends AbstractDao<SubjectRecord, String> {

  /** 科目テーブルを扱う Dao を初期化します。 */
  @Inject
  public SubjectDao(DSLContext dsl) {
    super(dsl, SUBJECT, SUBJECT.ID);
  }

  /**
   * 有効な科目を表示順で返します。
   *
   * @return 科目一覧
   */
  public List<SubjectRecord> findActiveOptions() {
    return dsl.selectFrom(SUBJECT).where(deletedCondition().and(SUBJECT.IS_ACTIVE.isTrue()))
        .orderBy(SUBJECT.NAME.asc(), SUBJECT.CODE.asc().nullsLast()).fetch();
  }
}
