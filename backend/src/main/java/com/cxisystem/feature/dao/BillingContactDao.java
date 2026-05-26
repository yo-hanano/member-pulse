package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.BillingContact.BILLING_CONTACT;

import com.cxisystem.jooq.tables.records.BillingContactRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/**
 * 請求先の検索・取得に使う Dao です。 入会処理や請求処理から参照します。
 */
@ApplicationScoped
@NoArgsConstructor
public class BillingContactDao extends AbstractDao<BillingContactRecord, String> {

  /** 請求先テーブルを扱う Dao を初期化します。 */
  @Inject
  public BillingContactDao(DSLContext dsl) {
    super(dsl, BILLING_CONTACT, BILLING_CONTACT.ID);
  }
}
