package com.cxisystem.config;

import com.cxisystem.feature.listener.AuditUserListener;
import com.cxisystem.feature.listener.CompanyIdListener;
import com.cxisystem.feature.listener.DateAtListener;
import com.cxisystem.feature.listener.NanoIdRecordListener;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import javax.sql.DataSource;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.conf.Settings;
import org.jooq.impl.DataSourceConnectionProvider;
import org.jooq.impl.DefaultConfiguration;
import org.jooq.impl.DefaultDSLContext;
import org.jooq.impl.DefaultRecordListenerProvider;

/**
 * jOOQ の共通設定を CDI Bean として提供する。 後続の Dao/Service 実装はこの DSLContext を前提に組み立てる。
 */
@ApplicationScoped
public class AppJooqConfiguration {

  @Inject
  DataSource dataSource;

  @Inject
  CompanyIdListener companyIdListener;

  @Inject
  AuditUserListener auditUserListener;

  @Inject
  NanoIdRecordListener nanoIdRecordListener;

  @Inject
  DateAtListener dateAtListener;

  /** jOOQ の共通 Configuration を組み立てて CDI へ公開します。 */
  @Produces
  @ApplicationScoped
  public Configuration jooqConfiguration() {
    Settings settings = new Settings();
    settings.setMapRecordComponentParameterNames(true);

    DefaultConfiguration configuration = new DefaultConfiguration();
    configuration.set(SQLDialect.POSTGRES);
    configuration.set(new DataSourceConnectionProvider(dataSource));
    configuration.set(settings);
    configuration.set(DefaultRecordListenerProvider.providers(companyIdListener, auditUserListener,
        nanoIdRecordListener, dateAtListener));

    return configuration;
  }

  /** 共通 Configuration を使う DSLContext を生成します。 */
  @Produces
  @ApplicationScoped
  public DSLContext dslContext(Configuration configuration) {
    return new DefaultDSLContext(configuration);
  }
}
