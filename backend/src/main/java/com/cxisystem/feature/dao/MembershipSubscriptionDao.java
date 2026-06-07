package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.MembershipSubscription.MEMBERSHIP_SUBSCRIPTION;

import com.cxisystem.jooq.tables.records.MembershipSubscriptionRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Optional;
import lombok.NoArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;

/**
 * コース契約（membership_subscription）の取得 SQL をまとめる Dao です。 deleted_at による論理削除を使います。
 */
@ApplicationScoped
@NoArgsConstructor
public class MembershipSubscriptionDao extends AbstractDao<MembershipSubscriptionRecord, String> {

  /** コース契約テーブルを扱う Dao を初期化します。 */
  @Inject
  public MembershipSubscriptionDao(DSLContext dsl) {
    super(dsl, MEMBERSHIP_SUBSCRIPTION, MEMBERSHIP_SUBSCRIPTION.ID);
  }

  /** deleted_at が未設定の契約だけを有効データとして扱います。 */
  @Override
  protected Condition deletedCondition() {
    return MEMBERSHIP_SUBSCRIPTION.DELETED_AT.isNull();
  }

  /** 会員のコース契約履歴を新しい順（開始日降順）で返します。 */
  public List<MembershipSubscriptionRecord> findByMemberIdOrdered(String memberId) {
    return dsl.selectFrom(MEMBERSHIP_SUBSCRIPTION)
        .where(deletedCondition().and(MEMBERSHIP_SUBSCRIPTION.MEMBER_ID.eq(memberId)))
        .orderBy(MEMBERSHIP_SUBSCRIPTION.START_DATE.desc(),
            MEMBERSHIP_SUBSCRIPTION.CREATED_AT.desc())
        .fetch();
  }

  /** 会員のアクティブ契約（終了済み以外）を返します。部分 unique index により最大1件です。 */
  public Optional<MembershipSubscriptionRecord> findActiveByMemberId(String memberId) {
    return dsl.selectFrom(MEMBERSHIP_SUBSCRIPTION)
        .where(deletedCondition().and(MEMBERSHIP_SUBSCRIPTION.MEMBER_ID.eq(memberId))
            .and(MEMBERSHIP_SUBSCRIPTION.STATUS.ne("ended")))
        .fetchOptional();
  }
}
