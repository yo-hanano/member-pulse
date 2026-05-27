package com.cxisystem.seed;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import net.datafaker.Faker;
import org.jooq.DSLContext;
import org.jooq.Query;
import org.jooq.impl.DSL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** シードデータの DB 書き込みロジックを担当する。 */
final class SeedDataWriter {
  private static final Logger log = LoggerFactory.getLogger(SeedDataWriter.class);
  private static final String ADMIN_EMPLOYEE_ID = "hjZ8c5G9zQpXhFT_wv6EQ";
  private static final String BUSINESS_PROFILE_ID = "bp0000000000000000001";
  private static final String GOAL_PLAN_ID = "gp0000000000000000001";
  private static final String[] AREA_NAMES = {"都心", "城西", "城南", "横浜", "千葉", "埼玉"};
  private static final String[] PREFECTURE_CODES = {"tky", "kng", "chb", "stm", "osk", "aic"};
  private static final String[] LOCATION_SUFFIXES = {"スタジオ", "ピラティス", "ヨガ", "ジム"};
  private static final String[] PLAN_NAMES = {"ライト月4回", "スタンダード月8回", "プレミアム通い放題"};
  private static final BigDecimal[] PLAN_FEES = {
    BigDecimal.valueOf(8800), BigDecimal.valueOf(13800), BigDecimal.valueOf(19800)
  };
  private static final String[] LEAD_STATUSES = {
    "new", "contacted", "trial_scheduled", "trial_completed", "enrolled", "lost"
  };
  private static final String[] LEAD_SOURCES = {"Web", "紹介", "Instagram", "Google広告", "チラシ"};

  record LeadSeed(String id, String locationId, String status, Timestamp inquiryAt) {}

  record MemberSeed(String id, String locationId, String leadId, LocalDate joinedAt, BigDecimal monthlyFee) {}

  record CostItemSeed(String id, String name, String costType, String scope, String calculationMethod) {}

  record MonthlyReviewSeed(String id, LocalDate reviewMonth) {}

  private final Faker faker;
  private final Faker asciiFaker;

  SeedDataWriter() {
    this(new Faker(Locale.JAPAN), new Faker(Locale.ENGLISH));
  }

  SeedDataWriter(Faker faker, Faker asciiFaker) {
    this.faker = faker;
    this.asciiFaker = asciiFaker;
  }

  void truncateExistingData(Connection conn, String companyId) throws SQLException {
    log.info("Truncating existing seed data for companyId={}", companyId);
    delete(conn, "DELETE FROM public.monthly_review_location_snapshot WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.monthly_review_snapshot WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.ad_spend WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.monthly_review_cost WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.monthly_review_location WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.monthly_review WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.cost_item WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.membership_subscription WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.member WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.trial_session WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.lead WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.membership_plan WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.goal_plan_month WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.goal_plan WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.business_profile WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.location WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.area WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.employee_token WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.employee WHERE company_id = ?", companyId);
    delete(conn, "DELETE FROM public.company WHERE id = ?", companyId);
    log.info("Truncate completed");
  }

  void upsertCompany(Connection conn, SeedDataOptions options, Timestamp now) throws SQLException {
    dsl(conn)
        .query(
            "INSERT INTO public.company (id, code, name, status, created_at, updated_at, is_deleted, deleted_at) "
                + "VALUES (?, ?, ?, 'active', ?, ?, false, NULL) ON CONFLICT (id) DO NOTHING",
            options.getCompanyId(),
            options.getCompanyCode(),
            options.getCompanyName(),
            now,
            now)
        .execute();
    log.info("Company upsert completed");
  }

  void upsertAdminEmployee(Connection conn, SeedDataOptions options, Timestamp now) throws SQLException {
    dsl(conn)
        .query(
            "INSERT INTO public.employee "
                + "(id, company_id, name, email, gender_code, password, is_admin, status, password_set_at, last_login_at, created_at, updated_at, is_deleted, deleted_at) "
                + "VALUES (?, ?, ?, ?, 'male', ?, true, 'active', ?, NULL, ?, ?, false, NULL) "
                + "ON CONFLICT (company_id, email) DO NOTHING",
            ADMIN_EMPLOYEE_ID,
            options.getCompanyId(),
            SeedDataOptions.DEFAULT_ADMIN_NAME,
            SeedDataOptions.DEFAULT_ADMIN_EMAIL,
            SeedDataOptions.DEFAULT_ADMIN_PASSWORD_HASH,
            now,
            now,
            now)
        .execute();
    log.info("Admin employee upsert completed");
  }

  String upsertBusinessProfile(Connection conn, SeedDataOptions options, Timestamp now) throws SQLException {
    dsl(conn)
        .query(
            "INSERT INTO public.business_profile "
                + "(id, company_id, business_name, industry_type, setup_status, setup_completed_at, fiscal_year_start_month, note, created_at, updated_at, deleted_at) "
                + "VALUES (?, ?, ?, 'studio', 'completed', ?, 1, ?, ?, ?, NULL) ON CONFLICT (id) DO NOTHING",
            BUSINESS_PROFILE_ID,
            options.getCompanyId(),
            options.getCompanyName(),
            now,
            "seed data",
            now,
            now)
        .execute();
    log.info("Business profile upsert completed");
    return BUSINESS_PROFILE_ID;
  }

  List<String> generateAreas(Connection conn, SeedDataOptions options, Timestamp now) throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.area (id, company_id, name, display_order, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<String> ids = new ArrayList<>();
    for (int i = 1; i <= options.getAreaCount(); i++) {
      String id = seedId("ar", i);
      ids.add(id);
      batch.add(dsl.query(sql, id, options.getCompanyId(), AREA_NAMES[(i - 1) % AREA_NAMES.length], i, now, now));
    }
    flushBatch(batch);
    log.info("Area generation completed (count={})", ids.size());
    return ids;
  }

  List<String> generateLocations(Connection conn, SeedDataOptions options, Timestamp now, List<String> areaIds)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.location "
            + "(id, company_id, area_id, name, zip_code, prefecture_code, address, is_default, display_order, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<String> ids = new ArrayList<>();
    for (int i = 1; i <= options.getLocationCount(); i++) {
      String id = seedId("lc", i);
      String city = faker.address().cityName();
      String name = city + LOCATION_SUFFIXES[(i - 1) % LOCATION_SUFFIXES.length];
      ids.add(id);
      batch.add(
          dsl.query(
              sql,
              id,
              options.getCompanyId(),
              areaIds.get((i - 1) % areaIds.size()),
              name,
              buildZipCode(),
              PREFECTURE_CODES[(i - 1) % PREFECTURE_CODES.length],
              buildJapaneseAddress(),
              i == 1,
              i,
              now,
              now));
    }
    flushBatch(batch);
    log.info("Location generation completed (count={})", ids.size());
    return ids;
  }

  void setDefaultLocation(Connection conn, String businessProfileId, String locationId, Timestamp now)
      throws SQLException {
    dsl(conn)
        .query(
            "UPDATE public.business_profile SET default_location_id = ?, updated_at = ? WHERE id = ?",
            locationId,
            now,
            businessProfileId)
        .execute();
  }

  List<String> generateMembershipPlans(Connection conn, SeedDataOptions options, Timestamp now, List<String> locations)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.membership_plan "
            + "(id, company_id, location_id, name, monthly_fee, active, display_order, note, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, NULL, ?, ?, true, ?, NULL, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<String> ids = new ArrayList<>();
    for (int i = 1; i <= PLAN_NAMES.length; i++) {
      String id = seedId("mp", i);
      ids.add(id);
      batch.add(dsl.query(sql, id, options.getCompanyId(), PLAN_NAMES[i - 1], PLAN_FEES[i - 1], i, now, now));
    }
    flushBatch(batch);
    log.info("Membership plan generation completed (count={})", ids.size());
    return ids;
  }

  List<LeadSeed> generateLeads(Connection conn, SeedDataOptions options, Timestamp now, List<String> locations)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.lead "
            + "(id, company_id, location_id, name, phone, email, source, status, inquiry_at, lost_at, lost_reason, note, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<LeadSeed> seeds = new ArrayList<>();
    LocalDateTime base = options.getBaseMonth().plusMonths(1).atStartOfDay();
    for (int i = 1; i <= options.getLeadCount(); i++) {
      String id = seedId("ld", i);
      String status = LEAD_STATUSES[(i - 1) % LEAD_STATUSES.length];
      Timestamp inquiryAt = Timestamp.valueOf(base.minusDays(i % 150).plusHours(10 + (i % 8)));
      Timestamp lostAt = "lost".equals(status) ? Timestamp.valueOf(inquiryAt.toLocalDateTime().plusDays(14)) : null;
      seeds.add(new LeadSeed(id, locations.get((i - 1) % locations.size()), status, inquiryAt));
      batch.add(
          dsl.query(
              sql,
              id,
              options.getCompanyId(),
              locations.get((i - 1) % locations.size()),
              faker.name().fullName(),
              buildPhone(i),
              asciiFaker.internet().emailAddress(),
              LEAD_SOURCES[(i - 1) % LEAD_SOURCES.length],
              status,
              inquiryAt,
              lostAt,
              "lost".equals(status) ? "価格が合わない" : null,
              now,
              now));
      flushBatchIfNeeded(batch);
    }
    flushBatch(batch);
    log.info("Lead generation completed (count={})", seeds.size());
    return seeds;
  }

  void generateTrialSessions(Connection conn, SeedDataOptions options, Timestamp now, List<LeadSeed> leads)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.trial_session "
            + "(id, company_id, lead_id, location_id, scheduled_at, completed_at, status, note, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    int count = 0;
    for (LeadSeed lead : leads) {
      if ("new".equals(lead.status()) || "contacted".equals(lead.status()) || "lost".equals(lead.status())) {
        continue;
      }
      count++;
      Timestamp scheduledAt = Timestamp.valueOf(lead.inquiryAt().toLocalDateTime().plusDays(7));
      boolean completed = "trial_completed".equals(lead.status()) || "enrolled".equals(lead.status());
      batch.add(
          dsl.query(
              sql,
              seedId("ts", count),
              options.getCompanyId(),
              lead.id(),
              lead.locationId(),
              scheduledAt,
              completed ? Timestamp.valueOf(scheduledAt.toLocalDateTime().plusHours(1)) : null,
              completed ? "completed" : "scheduled",
              now,
              now));
    }
    flushBatch(batch);
    log.info("Trial session generation completed (count={})", count);
  }

  List<MemberSeed> generateMembers(Connection conn, SeedDataOptions options, Timestamp now, List<String> locations, List<LeadSeed> leads)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.member "
            + "(id, company_id, location_id, lead_id, name, status, joined_at, resigned_at, resignation_reason_code, resignation_note, phone, email, line_display_name, address, birth_date, source, note, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, NULL, ?, ?, ?, NULL, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<MemberSeed> seeds = new ArrayList<>();
    List<LeadSeed> enrolledLeads = leads.stream().filter(lead -> "enrolled".equals(lead.status())).toList();
    LocalDate base = options.getBaseMonth().plusMonths(1);
    for (int i = 1; i <= options.getMemberCount(); i++) {
      String id = seedId("mb", i);
      LeadSeed lead = i <= enrolledLeads.size() ? enrolledLeads.get(i - 1) : null;
      String locationId = lead != null ? lead.locationId() : locations.get((i - 1) % locations.size());
      String status = i % 11 == 0 ? "resigned" : i % 17 == 0 ? "paused" : "active";
      LocalDate joinedAt = base.minusDays(30L + i * 3L);
      LocalDate resignedAt = "resigned".equals(status) ? joinedAt.plusMonths(3 + (i % 10)) : null;
      BigDecimal monthlyFee = PLAN_FEES[(i - 1) % PLAN_FEES.length];
      seeds.add(new MemberSeed(id, locationId, lead == null ? null : lead.id(), joinedAt, monthlyFee));
      batch.add(
          dsl.query(
              sql,
              id,
              options.getCompanyId(),
              locationId,
              lead == null ? null : lead.id(),
              faker.name().fullName(),
              status,
              Date.valueOf(joinedAt),
              resignedAt == null ? null : Date.valueOf(resignedAt),
              resignedAt == null ? null : "schedule_mismatch",
              buildPhone(1000 + i),
              asciiFaker.internet().emailAddress(),
              buildJapaneseAddress(),
              Date.valueOf(LocalDate.now().minusYears(24 + (i % 30)).minusDays(i % 365)),
              LEAD_SOURCES[(i - 1) % LEAD_SOURCES.length],
              now,
              now));
      flushBatchIfNeeded(batch);
    }
    flushBatch(batch);
    log.info("Member generation completed (count={})", seeds.size());
    return seeds;
  }

  void generateMembershipSubscriptions(Connection conn, SeedDataOptions options, Timestamp now, List<MemberSeed> members, List<String> plans)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.membership_subscription "
            + "(id, company_id, member_id, membership_plan_id, start_date, end_date, status, monthly_fee, note, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, NULL, 'active', ?, NULL, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    for (int i = 1; i <= members.size(); i++) {
      MemberSeed member = members.get(i - 1);
      batch.add(
          dsl.query(
              sql,
              seedId("ms", i),
              options.getCompanyId(),
              member.id(),
              plans.get((i - 1) % plans.size()),
              Date.valueOf(member.joinedAt()),
              member.monthlyFee(),
              now,
              now));
      flushBatchIfNeeded(batch);
    }
    flushBatch(batch);
    log.info("Membership subscription generation completed (count={})", members.size());
  }

  List<CostItemSeed> generateCostItems(Connection conn, SeedDataOptions options, Timestamp now, List<String> locations)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.cost_item "
            + "(id, company_id, location_id, template_code, name, cost_type, scope, calculation_method, amount, rate, target_revenue_type, active, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<CostItemSeed> seeds = new ArrayList<>();
    int index = 1;
    for (String locationId : locations) {
      index =
          addCostItem(batch, seeds, sql, dsl, options, now, index, locationId, "rent", "家賃", "fixed", "location_direct", "fixed_amount", BigDecimal.valueOf(180000), null, null);
      index =
          addCostItem(batch, seeds, sql, dsl, options, now, index, locationId, "instructor_fee", "インストラクター報酬", "variable", "location_direct", "revenue_rate", null, BigDecimal.valueOf(0.32), "membership_revenue");
      index =
          addCostItem(batch, seeds, sql, dsl, options, now, index, locationId, "payment_fee", "決済手数料", "variable", "location_direct", "revenue_rate", null, BigDecimal.valueOf(0.036), "total_revenue");
    }
    addCostItem(batch, seeds, sql, dsl, options, now, index, null, "shared_system", "共通システム費", "fixed", "head_office", "fixed_amount", BigDecimal.valueOf(50000), null, null);
    flushBatch(batch);
    log.info("Cost item generation completed (count={})", seeds.size());
    return seeds;
  }

  List<MonthlyReviewSeed> generateMonthlyReviews(Connection conn, SeedDataOptions options, Timestamp now)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    upsertGoalPlan(conn, options, now);
    String sql =
        "INSERT INTO public.monthly_review "
            + "(id, company_id, goal_plan_id, review_month, status, head_office_cost_amount, unassigned_ad_spend_amount, acceptable_ad_investment_rate, note, generated_at, confirmed_at, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, 'generated', ?, 0, 0.3000, NULL, ?, NULL, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    List<MonthlyReviewSeed> seeds = new ArrayList<>();
    for (int i = options.getReviewMonths(); i >= 1; i--) {
      int index = options.getReviewMonths() - i + 1;
      LocalDate month = options.getBaseMonth().minusMonths(i - 1L);
      String id = seedId("mr", index);
      seeds.add(new MonthlyReviewSeed(id, month));
      batch.add(
          dsl.query(
              sql,
              id,
              options.getCompanyId(),
              GOAL_PLAN_ID,
              Date.valueOf(month),
              BigDecimal.valueOf(50000),
              now,
              now,
              now));
    }
    flushBatch(batch);
    log.info("Monthly review generation completed (count={})", seeds.size());
    return seeds;
  }

  void generateMonthlyReviewLocations(Connection conn, SeedDataOptions options, Timestamp now, List<MonthlyReviewSeed> reviews, List<String> locations)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.monthly_review_location "
            + "(id, company_id, monthly_review_id, location_id, beginning_member_count, ending_member_count, new_member_count, resigned_member_count, new_inquiry_count, trial_booking_count, trial_completed_count, total_revenue, membership_revenue, other_revenue, average_monthly_fee, location_ad_spend_amount, variable_cost_amount, fixed_cost_amount, crm_beginning_member_count, crm_ending_member_count, crm_new_member_count, crm_resigned_member_count, crm_new_inquiry_count, crm_trial_booking_count, crm_trial_completed_count, crm_average_monthly_fee, warnings_json, created_at, updated_at, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]'::jsonb, ?, ?, NULL) ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>();
    int index = 1;
    for (MonthlyReviewSeed review : reviews) {
      for (int i = 0; i < locations.size(); i++) {
        int beginning = 18 + i * 8 + index;
        int newMembers = 2 + (index + i) % 5;
        int resigned = (index + i) % 3;
        int ending = beginning + newMembers - resigned;
        BigDecimal monthlyFee = BigDecimal.valueOf(12800 + i * 400L);
        BigDecimal membershipRevenue = monthlyFee.multiply(BigDecimal.valueOf(ending));
        BigDecimal otherRevenue = BigDecimal.valueOf((long) (40_000 + i * 7_000));
        BigDecimal totalRevenue = membershipRevenue.add(otherRevenue);
        BigDecimal adSpend = BigDecimal.valueOf((long) (50_000 + i * 12_000));
        BigDecimal variableCost = membershipRevenue.multiply(BigDecimal.valueOf(0.34));
        BigDecimal fixedCost = BigDecimal.valueOf((long) (210_000 + i * 20_000));
        batch.add(
            dsl.query(
                sql,
                seedId("ml", index),
                options.getCompanyId(),
                review.id(),
                locations.get(i),
                beginning,
                ending,
                newMembers,
                resigned,
                8 + i * 2,
                5 + i,
                4 + i,
                totalRevenue,
                membershipRevenue,
                otherRevenue,
                monthlyFee,
                adSpend,
                variableCost,
                fixedCost,
                beginning,
                ending,
                newMembers,
                resigned,
                8 + i * 2,
                5 + i,
                4 + i,
                monthlyFee,
                now,
                now));
        index++;
        flushBatchIfNeeded(batch);
      }
    }
    flushBatch(batch);
    log.info("Monthly review location generation completed");
  }

  void generateMonthlyReviewCosts(Connection conn, Timestamp now, List<MonthlyReviewSeed> reviews, List<CostItemSeed> costItems)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.monthly_review_cost "
            + "(id, company_id, monthly_review_id, monthly_review_location_id, cost_item_id, name, cost_type, scope, calculation_method, expected_amount, actual_amount, is_overridden, created_at, updated_at, deleted_at) "
            + "SELECT ?, ci.company_id, ?, NULL, ci.id, ci.name, ci.cost_type, ci.scope, ci.calculation_method, COALESCE(ci.amount, 0), COALESCE(ci.amount, 0), false, ?, ?, NULL "
            + "FROM public.cost_item ci WHERE ci.id = ?";
    List<Query> batch = new ArrayList<>();
    int index = 1;
    for (MonthlyReviewSeed review : reviews) {
      for (CostItemSeed item : costItems) {
        batch.add(dsl.query(sql, seedId("mc", index), review.id(), now, now, item.id()));
        index++;
        flushBatchIfNeeded(batch);
      }
    }
    flushBatch(batch);
    log.info("Monthly review cost generation completed");
  }

  void generateAdSpends(Connection conn, Timestamp now, List<MonthlyReviewSeed> reviews, List<String> locations)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.ad_spend "
            + "(id, company_id, monthly_review_id, location_id, name, amount, source_type, note, created_at, updated_at, deleted_at) "
            + "SELECT ?, mr.company_id, ?, ?, ?, ?, 'manual', NULL, ?, ?, NULL FROM public.monthly_review mr WHERE mr.id = ?";
    List<Query> batch = new ArrayList<>();
    int index = 1;
    for (MonthlyReviewSeed review : reviews) {
      for (int i = 0; i < locations.size(); i++) {
        batch.add(
            dsl.query(
                sql,
                seedId("ad", index),
                review.id(),
                locations.get(i),
                "Google広告",
                BigDecimal.valueOf((long) (35_000 + i * 10_000)),
                now,
                now,
                review.id()));
        index++;
      }
    }
    flushBatch(batch);
    log.info("Ad spend generation completed");
  }

  private void upsertGoalPlan(Connection conn, SeedDataOptions options, Timestamp now) throws SQLException {
    dsl(conn)
        .query(
            "INSERT INTO public.goal_plan "
                + "(id, company_id, fiscal_year, annual_revenue_goal, annual_operating_profit_goal, year_end_member_count_goal, current_member_count, average_monthly_fee, acceptable_churn_rate, trial_booking_rate, trial_attendance_rate, enrollment_rate, annual_ad_spend_limit, acceptable_ad_investment_rate, active, created_at, updated_at, deleted_at) "
                + "VALUES (?, ?, ?, 36000000, 7200000, 180, ?, 13800, 0.0300, 0.7000, 0.8000, 0.5000, 3600000, 0.3000, true, ?, ?, NULL) ON CONFLICT (id) DO NOTHING",
            GOAL_PLAN_ID,
            options.getCompanyId(),
            options.getBaseMonth().getYear(),
            options.getMemberCount(),
            now,
            now)
        .execute();
  }

  private int addCostItem(
      List<Query> batch,
      List<CostItemSeed> seeds,
      String sql,
      DSLContext dsl,
      SeedDataOptions options,
      Timestamp now,
      int index,
      String locationId,
      String templateCode,
      String name,
      String costType,
      String scope,
      String calculationMethod,
      BigDecimal amount,
      BigDecimal rate,
      String targetRevenueType) {
    String id = seedId("ci", index);
    seeds.add(new CostItemSeed(id, name, costType, scope, calculationMethod));
    batch.add(
        dsl.query(
            sql,
            id,
            options.getCompanyId(),
            locationId,
            templateCode,
            name,
            costType,
            scope,
            calculationMethod,
            amount,
            rate,
            targetRevenueType,
            now,
            now));
    return index + 1;
  }

  private int delete(Connection conn, String sql, String companyId) {
    return dsl(conn).query(sql, companyId).execute();
  }

  private void flushBatchIfNeeded(List<Query> batch) throws SQLException {
    if (batch.size() >= SeedDataOptions.DEFAULT_BATCH_SIZE) {
      flushBatch(batch);
    }
  }

  private void flushBatch(List<Query> batch) throws SQLException {
    if (batch.isEmpty()) {
      return;
    }
    batch.get(0).configuration().dsl().batch(batch).execute();
    batch.clear();
  }

  private DSLContext dsl(Connection conn) {
    return DSL.using(conn);
  }

  private String seedId(String prefix, int index) {
    return String.format(Locale.ROOT, "%s%019d", prefix, index);
  }

  private String buildZipCode() {
    return String.format(Locale.ROOT, "%03d-%04d", randomInt(100, 999), randomInt(1, 9999));
  }

  private String buildPhone(int seed) {
    return String.format(Locale.ROOT, "090-%04d-%04d", seed % 10_000, randomInt(0, 9999));
  }

  private String buildJapaneseAddress() {
    return faker.address().state() + faker.address().cityName() + randomInt(1, 9) + "-" + randomInt(1, 20);
  }

  private int randomInt(int min, int max) {
    return ThreadLocalRandom.current().nextInt(min, max + 1);
  }
}
