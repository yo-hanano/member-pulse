package com.cxisystem.config;

import io.quarkus.runtime.Startup;
import io.smallrye.config.SmallRyeConfig;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.ConfigProvider;

/**
 * 起動時に主要設定の反映状況をログに出します。 機密値は出さず、存在確認だけに留めます。
 */
@Slf4j
@Startup
@ApplicationScoped
public class ConfigLogger {

  /** 重要な設定値が反映されているかを起動時に確認します。 */
  @PostConstruct
  void logConfig() {
    SmallRyeConfig config = (SmallRyeConfig) ConfigProvider.getConfig();
    logKey(config, "mp.jwt.verify.publickey.location");
    logKey(config, "mp.jwt.verify.issuer");
    logKey(config, "quarkus.datasource.jdbc.url");
    logKey(config, "quarkus.datasource.username");
    logKey(config, "quarkus.redis.hosts");
  }

  /**
   * 設定値の存在をログ出力します。
   *
   * @param config SmallRyeConfig
   * @param key 設定キー
   */
  @SuppressWarnings("null")
  private void logKey(SmallRyeConfig config, String key) {
    String value = config.getOptionalValue(key, String.class).orElse("<unset>");
    log.debug("{} = {}", key, value);
  }
}
