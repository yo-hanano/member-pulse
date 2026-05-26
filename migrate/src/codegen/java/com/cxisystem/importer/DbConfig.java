package com.cxisystem.importer;

import java.util.Locale;

// DB接続情報の読み取り専用コンテナ。
final class DbConfig {
  final String url;
  final String username;
  final String password;

  private DbConfig(String url, String username, String password) {
    this.url = url;
    this.username = username;
    this.password = password;
  }

  // Liquibase 系の環境変数か PG* を使って接続情報を構成する。
  static DbConfig fromEnv() {
    String url = getenv("LIQUIBASE_COMMAND_URL");
    String username = getenv("LIQUIBASE_COMMAND_USERNAME");
    String password = getenv("LIQUIBASE_COMMAND_PASSWORD");
    if (url != null && username != null && password != null) {
      return new DbConfig(url, username, password);
    }

    String host = getenvOrDefault("PGHOST", "localhost");
    String port = getenvOrDefault("PGPORT", "5432");
    String database = getenvOrDefault("PGDATABASE", "member_pulse_dev");
    String pgUser = getenv("PGUSER");
    String pgPassword = getenv("PGPASSWORD");
    if (pgUser == null || pgPassword == null) {
      return null;
    }
    String jdbcUrl = String.format(Locale.ROOT, "jdbc:postgresql://%s:%s/%s", host, port, database);
    return new DbConfig(jdbcUrl, pgUser, pgPassword);
  }

  // 空文字は未設定として扱う。
  private static String getenv(String key) {
    String value = System.getenv(key);
    return (value == null || value.isBlank()) ? null : value;
  }

  // 未設定ならデフォルト値を返す。
  private static String getenvOrDefault(String key, String defaultValue) {
    String value = System.getenv(key);
    return (value == null || value.isBlank()) ? defaultValue : value;
  }
}
