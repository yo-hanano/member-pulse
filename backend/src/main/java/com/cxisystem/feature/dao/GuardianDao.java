package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.Guardian.GUARDIAN;

import com.cxisystem.jooq.tables.records.GuardianRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 保護者の検索・取得に使う Dao です。 生徒の主保護者を読み書きするサービスから参照します。
 */
@ApplicationScoped
@NoArgsConstructor
public class GuardianDao extends AbstractDao<GuardianRecord, String> {

  /** 保護者テーブルを扱う Dao を初期化します。 */
  @Inject
  public GuardianDao(DSLContext dsl) {
    super(dsl, GUARDIAN, GUARDIAN.ID);
  }
}
