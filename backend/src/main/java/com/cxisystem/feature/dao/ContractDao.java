package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Contract.CONTRACT;

import com.cxisystem.jooq.tables.records.ContractRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * コース契約の検索・取得に使う Dao です。 生徒別のコース一覧取得を担当します。
 */
@ApplicationScoped
@NoArgsConstructor
public class ContractDao extends AbstractDao<ContractRecord, String> {

  /** 契約テーブルを扱う Dao を初期化します。 */
  @Inject
  public ContractDao(DSLContext dsl) {
    super(dsl, CONTRACT, CONTRACT.ID);
  }

  /**
   * 生徒に紐づく契約を開始日降順で返します。
   *
   * @param studentId 生徒ID
   * @return 契約一覧
   */
  public List<ContractRecord> findByStudentId(String studentId) {
    return dsl.selectFrom(CONTRACT).where(deletedCondition().and(CONTRACT.STUDENT_ID.eq(studentId)))
        .orderBy(CONTRACT.CONTRACT_START_DATE.desc(), CONTRACT.CREATED_AT.desc()).fetch();
  }
}
