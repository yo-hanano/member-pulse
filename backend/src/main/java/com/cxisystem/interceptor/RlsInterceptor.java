package com.cxisystem.interceptor;

import com.cxisystem.annotation.Rls;
import io.quarkus.security.ForbiddenException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import jakarta.transaction.Status;
import jakarta.transaction.Synchronization;
import jakarta.transaction.TransactionSynchronizationRegistry;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;

/**
 * `@Rls` が付いた処理の実行前に current_company_id をトランザクションへ設定する。 同一トランザクション内では一度だけ
 * set_config を実行し、後続クエリにRLSを効かせる。
 */
@Slf4j
@Rls
@Interceptor
@Priority(Interceptor.Priority.LIBRARY_AFTER)
public class RlsInterceptor {

  private static final Set<Object> INITIALIZED =
      Collections.newSetFromMap(new ConcurrentHashMap<>());

  @Inject
  DSLContext dsl;

  @Inject
  TransactionSynchronizationRegistry transactionSynchronizationRegistry;

  @Inject
  SecurityIdentity identity;

  @AroundInvoke
  Object around(InvocationContext context) throws Exception {
    if (transactionSynchronizationRegistry.getTransactionStatus() != Status.STATUS_ACTIVE) {
      throw new IllegalStateException("@Rls は @Transactional(REQUIRED) と併用してください。");
    }

    Object transactionKey = transactionSynchronizationRegistry.getTransactionKey();
    if (transactionKey == null) {
      throw new IllegalStateException("Transaction key is null.");
    }

    if (INITIALIZED.add(transactionKey)) {
      try {
        if (!(identity.getRoles().contains("admin") || identity.getRoles().contains("user"))) {
          throw new ForbiddenException("RLS requires role: admin or user");
        }

        String companyId = identity.getAttribute("companyId");
        if (companyId == null || companyId.isBlank()) {
          throw new IllegalStateException("companyId is empty");
        }

        dsl.execute("select set_config('app.current_company_id', ?, true)", companyId);
        log.debug("RLS set current_company_id={}, txKey={}", companyId, transactionKey);

        transactionSynchronizationRegistry.registerInterposedSynchronization(new Synchronization() {
          /** トランザクション完了前の追加処理は行いません。 */
          @Override
          public void beforeCompletion() {}

          /** トランザクション終了時に初期化済みフラグを解放します。 */
          @Override
          public void afterCompletion(int status) {
            INITIALIZED.remove(transactionKey);
          }
        });
      } catch (RuntimeException exception) {
        INITIALIZED.remove(transactionKey);
        throw exception;
      }
    }

    return context.proceed();
  }
}
