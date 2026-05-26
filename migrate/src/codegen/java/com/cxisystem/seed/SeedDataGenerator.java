package com.cxisystem.seed;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// シードデータを一括生成するためのユーティリティ。
public final class SeedDataGenerator {
  private static final Logger log = LoggerFactory.getLogger(SeedDataGenerator.class);

  // ユーティリティクラスのためインスタンス化禁止。
  private SeedDataGenerator() {}

  // コマンドライン引数と環境変数に基づいて生成処理を実行する。
  public static void main(String[] args) {
    if (SeedDataOptions.hasFlag(args, "help")) {
      printHelp();
      return;
    }

    String profile = System.getenv("PROFILE");
    boolean allowed =
        profile != null && ("local".equalsIgnoreCase(profile) || "stg".equalsIgnoreCase(profile));
    if (!allowed) {
      log.error("PROFILE must be local or stg to run seed generation. Current PROFILE={}", profile);
      System.exit(2);
    }

    DbConfig dbConfig = DbConfig.fromEnv();
    if (dbConfig != null) {
      log.info(
          "DB config: url={}, username={}, password={}",
          dbConfig.url,
          dbConfig.username,
          maskPassword(dbConfig.password));
    } else {
      log.warn("DB config is missing before prompts.");
    }

    SeedDataOptions options =
        SeedDataOptions.hasFlag(args, "non-interactive")
            ? SeedDataOptions.parse(args)
            : SeedDataOptions.prompt();
    if (dbConfig == null) {
      log.error("Database config is missing. Set LIQUIBASE_COMMAND_URL/USERNAME/PASSWORD or PG*.");
      System.exit(2);
    }

    log.info("Starting seed generation for JDBC URL: {}", dbConfig.url);
    log.info(
        "Options: companyId={}, areaCount={}, branchCount={}, studentCount={}, leadCount={}, teacherCount={}, truncate={}",
        options.getCompanyId(),
        options.getAreaCount(),
        options.getBranchCount(),
        options.getStudentCount(),
        options.getLeadCount(),
        options.getTeacherCount(),
        options.isTruncate());

    try (Connection conn = DriverManager.getConnection(dbConfig.url, dbConfig.username, dbConfig.password)) {
      conn.setAutoCommit(false);
      try {
        SeedDataWriter writer = new SeedDataWriter();
        if (options.isTruncate()) {
          writer.truncateExistingData(conn, options.getCompanyId());
        }

        Timestamp now = Timestamp.valueOf(LocalDateTime.now());
        writer.seedMasters(conn, now);
        writer.upsertCompany(conn, options, now);
        writer.upsertAdminEmployee(conn, options, now);
        var subjects = writer.ensureSubjects(conn, options, now);
        var areas = writer.generateAreas(conn, options, now);
        var branches = writer.generateBranches(conn, options, now, areas);
        var schools = writer.loadExistingSchools(conn);
        writer.generateTeachers(conn, options, now, schools);
        var leadSeeds = writer.generateLeads(conn, options, now, branches, schools);
        writer.generateLeadSchedules(conn, options, now, leadSeeds);
        var leadIds =
            leadSeeds.stream()
                .filter(leadSeed -> "enrolled".equals(leadSeed.status()))
                .map(SeedDataWriter.LeadSeed::leadId)
                .toList();
        var students = writer.generateStudents(conn, options, now, branches, schools, leadIds);
        var accounts = writer.generateStudentAccounts(conn, options, now, students);
        var contracts = writer.generateContracts(conn, options, now, accounts, subjects);
        writer.generateBillingsAndPayments(conn, options, now, contracts);
      } catch (SQLException e) {
        conn.rollback();
        throw e;
      }
    } catch (SQLException e) {
      log.error("Seed generation failed", e);
      System.exit(1);
    }
  }

  // コマンドラインヘルプを出力する。
  private static void printHelp() {
    String help =
        """
        Usage: SeedDataGenerator [options]

        Default: interactive prompts. Use --non-interactive to read CLI args.

        Options:
          --help                    Show this help message
          --non-interactive         Do not prompt; read values from CLI args
          --truncate                Delete existing data for the target company before insert
          --area-count N            Override area count
          --branch-count N          Override branch count
          --student-count N         Override student count
          --lead-count N            Override lead count (default: student-count * 2)
          --teacher-count N         Override teacher count (default: branch-count)
          --company-id ID           Company ID (default: m3JjAoupaZaQUXzGWKE4q)
          --company-code CODE       Company code (default: dev)
          --company-name NAME       Company name (default: テスト株式会社)

        DB env (required):
          LIQUIBASE_COMMAND_URL / LIQUIBASE_COMMAND_USERNAME / LIQUIBASE_COMMAND_PASSWORD
          or PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
        """;
    System.out.println(help);
  }

  // パスワードをログに出す際は伏字にする。
  private static String maskPassword(String password) {
    if (password == null || password.isBlank()) {
      return "(empty)";
    }
    return "*".repeat(Math.min(password.length(), 12));
  }
}
