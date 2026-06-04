package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.TrialSession.TRIAL_SESSION;

import com.cxisystem.jooq.tables.records.TrialSessionRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 体験セッション取得の SQL をまとめる Dao です。リード詳細配下の関連情報として扱います。
 */
@ApplicationScoped
@NoArgsConstructor
public class TrialSessionDao extends AbstractDao<TrialSessionRecord, String> {

  /** 体験セッションテーブルを扱う Dao を初期化します。 */
  @Inject
  public TrialSessionDao(DSLContext dsl) {
    super(dsl, TRIAL_SESSION, TRIAL_SESSION.ID);
  }

  /** リードに紐づく未削除の体験セッションを予定日時の新しい順で返します。 */
  public List<TrialSessionRecord> findByLeadId(String leadId) {
    return dsl.selectFrom(TRIAL_SESSION)
        .where(deletedCondition().and(TRIAL_SESSION.LEAD_ID.eq(leadId)))
        .orderBy(TRIAL_SESSION.SCHEDULED_AT.desc(), TRIAL_SESSION.CREATED_AT.desc()).fetch();
  }
}
