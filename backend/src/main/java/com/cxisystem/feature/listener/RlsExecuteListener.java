package com.cxisystem.feature.listener;

import com.cxisystem.feature.util.AuthContextUtil;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.extern.slf4j.Slf4j;
import org.jooq.ExecuteContext;
import org.jooq.ExecuteListener;

/**
 * jOOQ の executeStart に合わせて RLS セッション変数を設定する旧実装です。 current backend では
 * {@link com.cxisystem.interceptor.RlsInterceptor} を優先するため、deprecated 扱いで残します。
 */
@Slf4j
@Deprecated
@ApplicationScoped
public class RlsExecuteListener implements ExecuteListener {

  /**
   * クエリ実行直前に company_id を設定します。
   *
   * @param ctx ExecuteContext
   */
  @Override
  @SuppressWarnings("null")
  public void executeStart(ExecuteContext ctx) {
    String companyId = AuthContextUtil.getCurrentCompanyId();
    log.debug("Listener CurrentCompanyId: {}", companyId);
    try {
      var stmt = ctx.connection()
          .prepareStatement("select set_config('app.current_company_id', ?, false)");
      stmt.setString(1, companyId);
      stmt.execute();
    } catch (Exception exception) {
      log.error("set_config failed", exception);
    }
  }
}
