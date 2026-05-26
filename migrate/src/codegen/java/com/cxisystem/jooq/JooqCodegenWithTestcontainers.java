package com.cxisystem.jooq;

import java.sql.Connection;
import java.sql.DriverManager;

import org.jooq.codegen.GenerationTool;
import org.jooq.meta.jaxb.Configuration;
import org.jooq.meta.jaxb.Generate;
import org.jooq.meta.jaxb.Generator;
import org.jooq.meta.jaxb.Jdbc;
import org.jooq.meta.jaxb.Strategy;
import org.jooq.meta.jaxb.Target;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import liquibase.command.CommandScope;
import lombok.extern.slf4j.Slf4j;

/**
 * Testcontainers＋Liquibase＋jOOQコード生成を、Javaコードで一貫して行うためのツール。
 *
 * gradleのjooqCodegenはDBより生成が前提。devやprodなどバージョンに合ったDBを意識して使うのが手間なので、
 * Testcontainersを使って、git管理されているLiquibaseのschemaを使って生成する。
 *
 * 当初はjooq-meta-extensions-liquibaseでの実行を試みたが内部でH2を使ってcodegenしておりposgresと型の齟齬が出たため、
 * testcontainersを使ってcodegenを行うことにした。
 *
 * 次にLiquibaseのマイグレーションやjOOQのコード生成はGradleタスク（liquibaseUpdateやjooqCodegen）だけでも実現可能だが、
 * TestcontainersのDBコンテナを使う場合、GradleやMavenの各タスクは「別プロセス」や「異なるJVM」で実行されることが多く、 JDBC
 * URLが同じでも同一のDBインスタンス（コンテナ）が共有されない。そのため、 - Liquibaseで適用したマイグレーションが、jOOQ codegen実行時に見えない -
 * テーブルが存在しない状態でjOOQ codegenが走り、生成物が空・不完全になる といった問題が頻発する。
 *
 * よって、このクラスでは、TestcontainersによるDBコンテナの起動、Liquibaseによるマイグレーション適用、jOOQのコード生成を
 * すべて「同一JVMプロセス」「同一DBインスタンス」で順次実行することで、 必ずマイグレーション済みの最新スキーマに対してjOOQのコード生成が行えるようにしている。
 *
 * 参考: https://blog.jooq.org/using-testcontainers-to-generate-jooq-code/
 */
@Slf4j
public class JooqCodegenWithTestcontainers {
  public static void main(String[] args) {
    // CI環境では既存のサービスDBを利用し、ローカルではTestcontainersを使う
    boolean isCi = "true".equalsIgnoreCase(System.getenv("CI"));

    try {
      if (isCi) {
        // CIでは services: postgres など、既存のDBを使用
        String host = System.getenv().getOrDefault("PGHOST", "localhost");
        String port = System.getenv().getOrDefault("PGPORT", "5432");
        String database = System.getenv().getOrDefault("PGDATABASE", "jooq_codegen");
        String username = System.getenv().getOrDefault("PGUSER", "postgres");
        String password = System.getenv().getOrDefault("PGPASSWORD", "postgres");
        String jdbcUrl =
            String.format("jdbc:postgresql://%s:%s/%s?loggerLevel=OFF", host, port, database);
        log.info("CI mode: reuse external PostgreSQL - {}", jdbcUrl);
        runCodegen(jdbcUrl, username, password);
      } else {
        // ローカルではTestcontainersでPostgreSQLコンテナを起動
        try (PostgreSQLContainer postgres = createLocalPostgres()) {
          postgres.start();
          String jdbcUrl = postgres.getJdbcUrl() + "&loggerLevel=OFF";
          String username = postgres.getUsername();
          String password = postgres.getPassword();

          log.info("PostgreSQL started: {}", jdbcUrl);
          runCodegen(jdbcUrl, username, password);
        }
      }
    } catch (Throwable t) {
      log.error("Uncaught exception in codegen", t);
      System.exit(1);
    }
  }

  /**
   * ローカル実行用のPostgreSQL Testcontainersコンテナを作成する
   *
   * @param networkName
   * @return
   */
  @SuppressWarnings("resource") // 呼び出し側のtry-with-resourcesで確実にcloseする
  private static PostgreSQLContainer createLocalPostgres() {
    return new PostgreSQLContainer(DockerImageName.parse("postgres:18"))
        .withDatabaseName("jooq_codegen").withUsername("jooq").withPassword("jooq").withReuse(false)
        // PostgreSQL設定の最適化（開発用高速化）
        .withEnv("POSTGRES_INITDB_ARGS", "--auth-host=trust")
        // リソース制限とパフォーマンス調整
        .withCreateContainerCmdModifier(cmd -> cmd.withHostConfig(cmd.getHostConfig()
            // メモリ制限（512MB、必要に応じて調整可能）
            .withMemory(512L * 1024L * 1024L)
            // CPU制限（1.0コア相当、必要に応じて調整可能）
            .withNanoCPUs(1_000_000_000L)
            // tmpfs for faster I/O
            .withTmpFs(java.util.Map.of("/tmp", "rw,noexec,nosuid,size=100m")))
            // PostgreSQL高速化設定
            .withCmd("postgres", "-c", "fsync=off", // ディスク同期無効（開発専用）
                "-c", "synchronous_commit=off", // 非同期コミット
                "-c", "wal_buffers=16MB", // WALバッファサイズ
                "-c", "shared_buffers=128MB", // 共有バッファ
                "-c", "effective_cache_size=256MB") // 効果的キャッシュサイズ
        );
  }

  private static void runCodegen(String jdbcUrl, String username, String password)
      throws Exception {
    // Liquibaseのログを抑制（Java Util Logging）
    java.util.logging.Logger.getLogger("liquibase").setLevel(java.util.logging.Level.WARNING);
    // 1. Liquibaseでchangelog適用
    try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password)) {
      CommandScope update = new CommandScope("update");
      // スキーマ関係のchangelogを使用
      update.addArgumentValue("changelogFile", "db/changelog/db.changelog-master.yaml");
      update.addArgumentValue("url", jdbcUrl);
      update.addArgumentValue("username", username);
      update.addArgumentValue("password", password);
      // Liquibaseのログレベル
      update.addArgumentValue("logLevel", "WARNING");
      update.execute();
      log.info("Liquibase migration completed successfully");
    }

    // 2. jOOQ codegen実行
    log.info("Starting jOOQ codegen");
    // 除外するテーブル名の正規表現
    String[] excludes = {"databasechangelog", "databasechangeloglock"};

    Configuration conf = new Configuration()
        .withJdbc(new Jdbc().withDriver("org.postgresql.Driver").withUrl(jdbcUrl).withUser(username)
            .withPassword(password))
        .withGenerator(new Generator().withName("org.jooq.codegen.JavaGenerator")
            .withDatabase(new org.jooq.meta.jaxb.Database()
                .withName("org.jooq.meta.postgres.PostgresDatabase").withInputSchema("public")
                .withExcludes(String.join("|", excludes)))
            .withStrategy(new Strategy().withName("com.cxisystem.jooq.JooqCustomGeneratorStrategy"))
            .withGenerate(new Generate().withPojos(true))
            .withTarget(new Target().withPackageName("com.cxisystem.jooq")
                .withDirectory("build/generated/sources/jooq-codegen")));

    try {
      GenerationTool.generate(conf);
      log.info("jOOQ codegen completed successfully");
    } catch (Throwable t) {
      log.error("jOOQ codegen failed", t);
      throw t;
    }
  }
}
