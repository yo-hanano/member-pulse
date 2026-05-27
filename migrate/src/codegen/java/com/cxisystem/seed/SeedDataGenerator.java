package com.cxisystem.seed;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** MemberPulse のローカル・検証用サンプルデータを生成するユーティリティ。 */
public final class SeedDataGenerator {
  private static final Logger log = LoggerFactory.getLogger(SeedDataGenerator.class);

  private SeedDataGenerator() {}

  /** コマンドライン引数と環境変数に基づいて生成処理を実行する。 */
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
    if (dbConfig == null) {
      log.error("Database config is missing. Set LIQUIBASE_COMMAND_URL/USERNAME/PASSWORD or PG*.");
      System.exit(2);
    }

    SeedDataOptions options =
        SeedDataOptions.hasFlag(args, "non-interactive")
            ? SeedDataOptions.parse(args)
            : SeedDataOptions.prompt();
    log.info(
        "Starting seed generation: url={}, companyId={}, areas={}, locations={}, leads={}, members={}, reviewMonths={}, truncate={}",
        dbConfig.url,
        options.getCompanyId(),
        options.getAreaCount(),
        options.getLocationCount(),
        options.getLeadCount(),
        options.getMemberCount(),
        options.getReviewMonths(),
        options.isTruncate());

    try (Connection conn =
        DriverManager.getConnection(dbConfig.url, dbConfig.username, dbConfig.password)) {
      conn.setAutoCommit(false);
      try {
        SeedDataWriter writer = new SeedDataWriter();
        if (options.isTruncate()) {
          writer.truncateExistingData(conn, options.getCompanyId());
        }

        Timestamp now = Timestamp.valueOf(LocalDateTime.now());
        writer.upsertCompany(conn, options, now);
        writer.upsertAdminEmployee(conn, options, now);
        String businessProfileId = writer.upsertBusinessProfile(conn, options, now);
        var areas = writer.generateAreas(conn, options, now);
        var locations = writer.generateLocations(conn, options, now, areas);
        writer.setDefaultLocation(conn, businessProfileId, locations.get(0), now);
        var plans = writer.generateMembershipPlans(conn, options, now, locations);
        var leads = writer.generateLeads(conn, options, now, locations);
        writer.generateTrialSessions(conn, options, now, leads);
        var members = writer.generateMembers(conn, options, now, locations, leads);
        writer.generateMembershipSubscriptions(conn, options, now, members, plans);
        var costItems = writer.generateCostItems(conn, options, now, locations);
        var reviews = writer.generateMonthlyReviews(conn, options, now);
        writer.generateMonthlyReviewLocations(conn, options, now, reviews, locations);
        writer.generateMonthlyReviewCosts(conn, now, reviews, costItems);
        writer.generateAdSpends(conn, now, reviews, locations);
        conn.commit();
      } catch (SQLException | RuntimeException e) {
        conn.rollback();
        throw e;
      }
    } catch (SQLException e) {
      log.error("Seed generation failed", e);
      System.exit(1);
    }
  }

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
          --location-count N        Override location count
          --lead-count N            Override lead count
          --member-count N          Override member count
          --review-months N         Override monthly review month count
          --base-month YYYY-MM      Latest review month (default: current month)
          --company-id ID           Company ID
          --company-code CODE       Company code
          --company-name NAME       Company name

        DB env (required):
          LIQUIBASE_COMMAND_URL / LIQUIBASE_COMMAND_USERNAME / LIQUIBASE_COMMAND_PASSWORD
          or PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
        """;
    System.out.println(help);
  }
}
