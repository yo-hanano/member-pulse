package com.cxisystem.seed;

import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import net.datafaker.Faker;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Query;
import org.jooq.Record2;
import org.jooq.impl.DSL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// シードデータのDB書き込みロジックを担当する。
final class SeedDataWriter {
  private static final Logger log = LoggerFactory.getLogger(SeedDataWriter.class);
  private static final String[] AREA_NAMES = {
    "首都圏エリア",
    "北関東エリア",
    "東海エリア",
    "関西エリア",
    "中国四国エリア",
    "九州エリア",
    "東北エリア"
  };
  private static final String[] KANA_SYLLABLES = {
    "ア", "イ", "ウ", "エ", "オ",
    "カ", "キ", "ク", "ケ", "コ",
    "サ", "シ", "ス", "セ", "ソ",
    "タ", "チ", "ツ", "テ", "ト",
    "ナ", "ニ", "ヌ", "ネ", "ノ",
    "ハ", "ヒ", "フ", "ヘ", "ホ",
    "マ", "ミ", "ム", "メ", "モ",
    "ヤ", "ユ", "ヨ",
    "ラ", "リ", "ル", "レ", "ロ",
    "ワ", "ン"
  };

  private static final List<MasterRow> GENDERS =
      List.of(
          new MasterRow("not_specified", "未設定", 1),
          new MasterRow("male", "男性", 2),
          new MasterRow("female", "女性", 3));

  private static final List<MasterRow> SCHOOL_GRADES =
      List.of(
          new MasterRow("none", "指定なし", 1),
          new MasterRow("grade_1", "1年", 2),
          new MasterRow("grade_2", "2年", 3),
          new MasterRow("grade_3", "3年", 4),
          new MasterRow("grade_4", "4年", 5),
          new MasterRow("grade_5", "5年", 6),
          new MasterRow("grade_6", "6年", 7));

  private static final List<MasterRow> PREFECTURES =
      List.of(
          new MasterRow("hkd", "北海道", 1),
          new MasterRow("aom", "青森県", 2),
          new MasterRow("iwt", "岩手県", 3),
          new MasterRow("myg", "宮城県", 4),
          new MasterRow("akt", "秋田県", 5),
          new MasterRow("ygt", "山形県", 6),
          new MasterRow("fks", "福島県", 7),
          new MasterRow("ibr", "茨城県", 8),
          new MasterRow("tcg", "栃木県", 9),
          new MasterRow("gnm", "群馬県", 10),
          new MasterRow("stm", "埼玉県", 11),
          new MasterRow("chb", "千葉県", 12),
          new MasterRow("tky", "東京都", 13),
          new MasterRow("kng", "神奈川県", 14),
          new MasterRow("nig", "新潟県", 15),
          new MasterRow("tym", "富山県", 16),
          new MasterRow("isk", "石川県", 17),
          new MasterRow("fki", "福井県", 18),
          new MasterRow("ymn", "山梨県", 19),
          new MasterRow("ngn", "長野県", 20),
          new MasterRow("gif", "岐阜県", 21),
          new MasterRow("szo", "静岡県", 22),
          new MasterRow("aic", "愛知県", 23),
          new MasterRow("mie", "三重県", 24),
          new MasterRow("sig", "滋賀県", 25),
          new MasterRow("kyt", "京都府", 26),
          new MasterRow("osk", "大阪府", 27),
          new MasterRow("hyg", "兵庫県", 28),
          new MasterRow("nar", "奈良県", 29),
          new MasterRow("wky", "和歌山県", 30),
          new MasterRow("ttr", "鳥取県", 31),
          new MasterRow("smn", "島根県", 32),
          new MasterRow("oky", "岡山県", 33),
          new MasterRow("hrs", "広島県", 34),
          new MasterRow("ygc", "山口県", 35),
          new MasterRow("tks", "徳島県", 36),
          new MasterRow("kgw", "香川県", 37),
          new MasterRow("ehm", "愛媛県", 38),
          new MasterRow("kch", "高知県", 39),
          new MasterRow("fuk", "福岡県", 40),
          new MasterRow("sag", "佐賀県", 41),
          new MasterRow("ngs", "長崎県", 42),
          new MasterRow("kmm", "熊本県", 43),
          new MasterRow("oit", "大分県", 44),
          new MasterRow("myz", "宮崎県", 45),
          new MasterRow("kgs", "鹿児島県", 46),
          new MasterRow("okn", "沖縄県", 47));

  private static final List<MasterRow> RELATIONSHIPS =
      List.of(
          new MasterRow("father", "父", 1),
          new MasterRow("mother", "母", 2),
          new MasterRow("grandfather", "祖父", 3),
          new MasterRow("grandmother", "祖母", 4),
          new MasterRow("uncle", "叔父", 5),
          new MasterRow("aunt", "叔母", 6),
          new MasterRow("other", "その他", 7));

  private static final List<MasterRow> SCHOOL_TYPES =
      List.of(
          new MasterRow("A1", "幼稚園", 1),
          new MasterRow("A2", "こども", 2),
          new MasterRow("B1", "小学校", 3),
          new MasterRow("C1", "中学校", 4),
          new MasterRow("C2", "義務教育学校", 5),
          new MasterRow("D1", "高校", 6),
          new MasterRow("D2", "中等教育学校", 7),
          new MasterRow("E1", "特別支援学校", 8),
          new MasterRow("F1", "大学", 9),
          new MasterRow("F2", "短大", 10),
          new MasterRow("G1", "高専", 11),
          new MasterRow("H1", "専修学校", 12),
          new MasterRow("H2", "各種学校", 13));

  private static final List<SubjectSeed> DEFAULT_SUBJECTS =
      List.of(
          new SubjectSeed(null, "kokugo", "国語"),
          new SubjectSeed(null, "sugaku", "数学"),
          new SubjectSeed(null, "eigo", "英語"),
          new SubjectSeed(null, "rika", "理科"),
          new SubjectSeed(null, "shakai", "社会"));

  private static final String[] LEAD_STATUSES = {"new", "visit_scheduled", "considering", "lost"};

  private static final String[] LEAD_CHANNELS = {"Web", "紹介", "チラシ", "電話", "イベント"};

  private static final String[] SCHEDULE_EVENT_TYPES = {"trial_lesson", "interview"};
  private static final String[] SCHEDULE_EVENT_STATUSES = {"not_done", "rescheduled", "done", "canceled"};

  private static final String[] TEACHER_STATUSES = {"active", "inactive"};

  // 問い合わせ・予定生成で使う lead、branch、status の組み合わせ。
  record LeadSeed(String leadId, String branchId, String status) {}

  // 生徒起点の後続データ生成で使う最小情報。
  record StudentSeed(String studentId, String branchId, String leadId) {}

  // 顧客連絡先と契約・請求生成で使う最小情報。
  record StudentAccountSeed(String studentId, String guardianId, String billingContactId) {}

  // 請求生成で使う契約情報。
  record ContractSeed(String contractId, String studentId, String billingContactId, long monthlyFee) {}

  private final Faker faker;
  private final Faker asciiFaker;

  SeedDataWriter() {
    this(new Faker(Locale.JAPAN), new Faker(Locale.ENGLISH));
  }

  SeedDataWriter(Faker faker, Faker asciiFaker) {
    this.faker = faker;
    this.asciiFaker = asciiFaker;
  }

  // 指定会社の既存データを先に削除する。
  void truncateExistingData(Connection conn, String companyId) throws SQLException {
    log.info("Truncating existing seed data for companyId={}", companyId);
    int paymentDeleted = delete(conn, "DELETE FROM public.payment WHERE company_id = ?", companyId);
    int billingLineDeleted = delete(conn, "DELETE FROM public.billing_line WHERE company_id = ?", companyId);
    int billingDeleted = delete(conn, "DELETE FROM public.billing WHERE company_id = ?", companyId);
    int contractDeleted = delete(conn, "DELETE FROM public.contract WHERE company_id = ?", companyId);
    int studentBillingContactDeleted =
        delete(conn, "DELETE FROM public.student_billing_contact WHERE company_id = ?", companyId);
    int studentBranchDeleted = delete(conn, "DELETE FROM public.student_branch WHERE company_id = ?", companyId);
    int studentGuardianDeleted = delete(conn, "DELETE FROM public.student_guardian WHERE company_id = ?", companyId);
    int scheduleEventDeleted = delete(conn, "DELETE FROM public.schedule_event WHERE company_id = ?", companyId);
    int scheduleSubjectDeleted = delete(conn, "DELETE FROM public.schedule_subject WHERE company_id = ?", companyId);
    int teacherSubjectDeleted = delete(conn, "DELETE FROM public.teacher_subject WHERE company_id = ?", companyId);
    int teacherBranchDeleted = delete(conn, "DELETE FROM public.teacher_branch WHERE company_id = ?", companyId);
    int studentDeleted = delete(conn, "DELETE FROM public.student WHERE company_id = ?", companyId);
    int guardianDeleted = delete(conn, "DELETE FROM public.guardian WHERE company_id = ?", companyId);
    int billingContactDeleted = delete(conn, "DELETE FROM public.billing_contact WHERE company_id = ?", companyId);
    int leadDeleted = delete(conn, "DELETE FROM public.lead WHERE company_id = ?", companyId);
    int employeeTokenDeleted = delete(conn, "DELETE FROM public.employee_token WHERE company_id = ?", companyId);
    int teacherDeleted = delete(conn, "DELETE FROM public.teacher WHERE company_id = ?", companyId);
    int subjectDeleted = delete(conn, "DELETE FROM public.subject WHERE company_id = ?", companyId);
    int branchDeleted = delete(conn, "DELETE FROM public.branch WHERE company_id = ?", companyId);
    int areaDeleted = delete(conn, "DELETE FROM public.area WHERE company_id = ?", companyId);
    int employeeDeleted = delete(conn, "DELETE FROM public.employee WHERE company_id = ?", companyId);
    int companyDeleted = delete(conn, "DELETE FROM public.company WHERE id = ?", companyId);
    conn.commit();
    log.info(
        "Truncate completed. Deleted: payment={}, billing_line={}, billing={}, contract={}, student_billing_contact={}, student_branch={}, student_guardian={}, schedule_event={}, schedule_subject={}, teacher_subject={}, teacher_branch={}, student={}, guardian={}, billing_contact={}, lead={}, employee_token={}, teacher={}, subject={}, branch={}, area={}, employee={}, company={}",
        paymentDeleted,
        billingLineDeleted,
        billingDeleted,
        contractDeleted,
        studentBillingContactDeleted,
        studentBranchDeleted,
        studentGuardianDeleted,
        scheduleEventDeleted,
        scheduleSubjectDeleted,
        teacherSubjectDeleted,
        teacherBranchDeleted,
        studentDeleted,
        guardianDeleted,
        billingContactDeleted,
        leadDeleted,
        employeeTokenDeleted,
        teacherDeleted,
        subjectDeleted,
        branchDeleted,
        areaDeleted,
        employeeDeleted,
        companyDeleted);
  }

  // マスタデータをまとめて投入する。
  void seedMasters(Connection conn, Timestamp now) throws SQLException {
    upsertCodeNameRows(conn, "gender", GENDERS);
    upsertCodeNameRows(conn, "school_grade", SCHOOL_GRADES);
    upsertCodeNameRows(conn, "prefecture", PREFECTURES);
    upsertCodeNameRows(conn, "relationship", RELATIONSHIPS);
    upsertCodeNameRows(conn, "school_type", SCHOOL_TYPES);
    conn.commit();
    log.info("Master seed completed");
  }

  // 会社を作成（既存ならそのまま）。
  void upsertCompany(Connection conn, SeedDataOptions options, Timestamp now) throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.company "
            + "(id, code, name, status, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, 'active', ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    int inserted = dsl.query(sql, options.getCompanyId(), options.getCompanyCode(),
        options.getCompanyName(), now, now).execute();
    conn.commit();
    log.info("Company upsert completed (inserted={})", inserted);
  }

  // 初期管理者を作成（既存ならそのまま）。
  void upsertAdminEmployee(Connection conn, SeedDataOptions options, Timestamp now)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.employee "
            + "(id, company_id, name, email, gender_code, password, is_admin, status, "
            + "password_set_at, last_login_at, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, true, 'active', ?, NULL, ?, ?, false, NULL) "
            + "ON CONFLICT (company_id, email) DO NOTHING";
    int inserted = dsl.query(sql,
        "em0000000000000000001",
        options.getCompanyId(),
        SeedDataOptions.DEFAULT_ADMIN_NAME,
        SeedDataOptions.DEFAULT_ADMIN_EMAIL,
        "male",
        SeedDataOptions.DEFAULT_ADMIN_PASSWORD_HASH,
        now,
        now,
        now).execute();
    conn.commit();
    log.info("Admin employee upsert completed (inserted={})", inserted);
  }

  // 対象会社の科目を取得し、存在しない場合は seed 用の既定科目を作成する。
  List<SubjectSeed> ensureSubjects(Connection conn, SeedDataOptions options, Timestamp now)
      throws SQLException {
    List<SubjectSeed> existing = loadSubjects(conn, options.getCompanyId());
    if (!existing.isEmpty()) {
      log.info("Loaded existing subjects for seed linkage (count={})", existing.size());
      return existing;
    }

    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.subject "
            + "(id, company_id, code, name, school_category, is_active, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, 'junior_high', true, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>(DEFAULT_SUBJECTS.size());
    for (int i = 1; i <= DEFAULT_SUBJECTS.size(); i++) {
      SubjectSeed subject = DEFAULT_SUBJECTS.get(i - 1);
      batch.add(dsl.query(sql, buildSubjectId(options.getCompanyId(), i), options.getCompanyId(), subject.code(),
          subject.name(), now, now));
    }
    flushBatch(conn, sql, batch);
    log.info("Default subject generation completed (count={})", DEFAULT_SUBJECTS.size());
    return loadSubjects(conn, options.getCompanyId());
  }

  // エリアをバッチ生成してID一覧を返す。
  List<String> generateAreas(Connection conn, SeedDataOptions options, Timestamp now)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.area "
            + "(id, company_id, name, disp_order, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<String> areaIds = new ArrayList<>();
    List<Query> batch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    for (int i = 1; i <= options.getAreaCount(); i++) {
      String areaId = String.format("ar%019d", i);
      String areaName = AREA_NAMES[(i - 1) % AREA_NAMES.length];
      areaIds.add(areaId);
      batch.add(dsl.query(sql, areaId, options.getCompanyId(), areaName, i, now, now));
      if (batch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, sql, batch);
      }
    }
    flushBatch(conn, sql, batch);
    log.info("Area generation completed (count={})", options.getAreaCount());
    return areaIds;
  }

  // 拠点をバッチ生成してID一覧を返す。
  List<String> generateBranches(
      Connection conn, SeedDataOptions options, Timestamp now, List<String> areaIds)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.branch "
            + "(id, company_id, area_id, code, name, zip_code, prefecture_code, address, "
            + "created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<String> branchIds = new ArrayList<>();
    List<Query> batch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    for (int i = 1; i <= options.getBranchCount(); i++) {
      String branchId = String.format("br%019d", i);
      String areaId = areaIds.get((i - 1) % areaIds.size());
      String branchCode = String.format("BR%03d", i);
      String branchName = faker.address().city() + "校";
      String prefectureCode = PREFECTURES.get((i - 1) % PREFECTURES.size()).code();
      String address = buildJapaneseAddress();
      branchIds.add(branchId);
      batch.add(dsl.query(sql, branchId, options.getCompanyId(), areaId, branchCode, branchName,
          buildZipCode(), prefectureCode, address, now, now));
      if (batch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, sql, batch);
      }
    }
    flushBatch(conn, sql, batch);
    log.info("Branch generation completed (count={})", options.getBranchCount());
    return branchIds;
  }

  // DB に登録済みの学校を読み込む。
  List<SchoolSeed> loadExistingSchools(Connection conn) throws SQLException {
    DSLContext dsl = dsl(conn);
    Field<String> code = DSL.field(DSL.name("code"), String.class);
    Field<String> name = DSL.field(DSL.name("name"), String.class);
    List<Record2<String, String>> rows =
        dsl.select(code, name)
            .from(DSL.table(DSL.name("public", "school")))
            .where(DSL.field(DSL.name("is_deleted"), Boolean.class).eq(false))
            .orderBy(code.asc())
            .fetch();

    List<SchoolSeed> schools = new ArrayList<>(rows.size());
    for (Record2<String, String> row : rows) {
      schools.add(new SchoolSeed(row.value1(), row.value2()));
    }
    if (schools.isEmpty()) {
      throw new IllegalStateException(
          "No school data found. Run `task school` before seed generation.");
    }
    log.info("Loaded existing schools for seed linkage (count={})", schools.size());
    return schools;
  }

  // 対象会社に紐づく科目を読み込む。
  private List<SubjectSeed> loadSubjects(Connection conn, String companyId) {
    DSLContext dsl = dsl(conn);
    Field<String> id = DSL.field(DSL.name("id"), String.class);
    Field<String> code = DSL.field(DSL.name("code"), String.class);
    Field<String> name = DSL.field(DSL.name("name"), String.class);
    List<Record2<String, String>> rows =
        dsl.select(id, name)
            .from(DSL.table(DSL.name("public", "subject")))
            .where(DSL.field(DSL.name("company_id"), String.class).eq(companyId))
            .and(DSL.field(DSL.name("is_deleted"), Boolean.class).eq(false))
            .orderBy(code.asc().nullsLast(), id.asc())
            .fetch();

    List<SubjectSeed> subjects = new ArrayList<>(rows.size());
    for (Record2<String, String> row : rows) {
      subjects.add(new SubjectSeed(row.value1(), null, row.value2()));
    }
    return subjects;
  }

  // 講師をバッチ生成してID一覧を返す。
  List<String> generateTeachers(Connection conn, SeedDataOptions options, Timestamp now, List<SchoolSeed> schools)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.teacher "
            + "(id, company_id, code, name, kana, birthday, gender_code, school_code, school_name, "
            + "school_grade_code, phone, email, status, note, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<String> teacherIds = new ArrayList<>();
    List<Query> batch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    for (int i = 1; i <= options.getTeacherCount(); i++) {
      String teacherId = String.format("tr%019d", i);
      String teacherCode = String.format("TC%05d", i);
      SchoolSeed school = schools.get((i - 1) % schools.size());
      MasterRow gender = GENDERS.get((i - 1) % GENDERS.size());
      MasterRow schoolGrade = SCHOOL_GRADES.get((i - 1) % SCHOOL_GRADES.size());
      String status = TEACHER_STATUSES[(i - 1) % TEACHER_STATUSES.length];
      Date birthday = Date.valueOf(LocalDate.now().minusYears(22 + (i % 18)).minusDays(i % 28));
      teacherIds.add(teacherId);
      batch.add(
          dsl.query(
              sql,
              teacherId,
              options.getCompanyId(),
              teacherCode,
              faker.name().fullName(),
              buildKanaName(),
              birthday,
              gender.code(),
              school.code(),
              school.name(),
              schoolGrade.code(),
              buildPhoneNumber(),
              buildTeacherEmail(i),
              status,
              "seed teacher " + i,
              now,
              now));
      if (batch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, sql, batch);
      }
    }
    flushBatch(conn, sql, batch);
    log.info("Teacher generation completed (count={})", options.getTeacherCount());
    return teacherIds;
  }

  // リードをバッチ生成してID一覧を返す。
  List<LeadSeed> generateLeads(
      Connection conn, SeedDataOptions options, Timestamp now, List<String> branchIds, List<SchoolSeed> schools)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.lead "
            + "(id, company_id, branch_id, inquiry_at, student_name, student_kana, guardian_name, guardian_kana, school_name, "
            + "grade_name, phone, email, channel, status, follow_up_at, note, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<LeadSeed> leadSeeds = new ArrayList<>();
    List<Query> batch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    int enrolledLeadCount = Math.min(options.getStudentCount(), options.getLeadCount());
    for (int i = 1; i <= options.getLeadCount(); i++) {
      String leadId = String.format("ld%019d", i);
      String branchId = branchIds.get((i - 1) % branchIds.size());
      SchoolSeed school = schools.get(ThreadLocalRandom.current().nextInt(schools.size()));
      String status =
          i <= enrolledLeadCount
              ? "enrolled"
              : LEAD_STATUSES[(i - enrolledLeadCount - 1) % LEAD_STATUSES.length];
      Timestamp inquiryAt = Timestamp.valueOf(now.toLocalDateTime().minusDays((i * 3L) % 90).minusHours(i % 12));
      Timestamp followUpAt =
          "considering".equals(status)
              ? Timestamp.valueOf(now.toLocalDateTime().plusDays(1 + (i % 14)))
              : null;
      leadSeeds.add(new LeadSeed(leadId, branchId, status));
      batch.add(
          dsl.query(
              sql,
              leadId,
              options.getCompanyId(),
              branchId,
              inquiryAt,
              faker.name().fullName(),
              buildKanaName(),
              faker.name().fullName(),
              buildKanaName(),
              school.name(),
              String.format("%d年", 1 + ((i - 1) % 6)),
              buildPhoneNumber(),
              buildLeadEmail(i),
              LEAD_CHANNELS[(i - 1) % LEAD_CHANNELS.length],
              status,
              followUpAt,
              "seed lead " + i,
              now,
              now));
      if (batch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, sql, batch);
      }
    }
    flushBatch(conn, sql, batch);
    log.info("Lead generation completed (count={})", options.getLeadCount());
    return leadSeeds;
  }

  // 問い合わせごとの予定を生成する。
  void generateLeadSchedules(
      Connection conn, SeedDataOptions options, Timestamp now, List<LeadSeed> leadSeeds)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String subjectSql =
        "INSERT INTO public.schedule_subject "
            + "(id, company_id, lead_id, student_id, teacher_id, guardian_id, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, NULL, NULL, NULL, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String sql =
        "INSERT INTO public.schedule_event "
            + "(id, company_id, branch_id, schedule_subject_id, schedule_type, scheduled_at, status, reason, note, "
            + "created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    int sequence = 1;
    for (int i = 0; i < leadSeeds.size(); i++) {
      LeadSeed leadSeed = leadSeeds.get(i);
      String leadId = leadSeed.leadId();
      dsl.query(subjectSql, leadId, options.getCompanyId(), leadId, now, now).execute();
      int scheduleCount = 1 + ThreadLocalRandom.current().nextInt(3);
      for (int j = 0; j < scheduleCount; j++) {
        String scheduleType =
            SCHEDULE_EVENT_TYPES[(i + j) % SCHEDULE_EVENT_TYPES.length];
        String scheduleStatus =
            SCHEDULE_EVENT_STATUSES[(i + j) % SCHEDULE_EVENT_STATUSES.length];
        LocalDateTime scheduledTime =
            now.toLocalDateTime().minusDays((i * 2L) + j).minusHours(j * 3L);
        Timestamp scheduledAt = Timestamp.valueOf(scheduledTime);
        String reason = switch (scheduleStatus) {
          case "rescheduled" -> "seed reschedule reason";
          case "not_done" -> "seed not done reason";
          case "canceled" -> "seed cancel reason";
          default -> null;
        };
        int scheduleNo = sequence++;
        batch.add(
            dsl.query(
                sql,
                String.format("ls%019d", scheduleNo),
                options.getCompanyId(),
                leadSeed.branchId(),
                leadId,
                scheduleType,
                scheduledAt,
                scheduleStatus,
                reason,
                "seed lead schedule " + scheduleNo,
                now,
                now));
        if (batch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
          flushBatch(conn, sql, batch);
        }
      }
    }
    flushBatch(conn, sql, batch);
    log.info("Lead schedule generation completed (count~={})", sequence - 1);
  }

  // 生徒と主所属拠点をまとめて生成する。
  List<StudentSeed> generateStudents(
      Connection conn,
      SeedDataOptions options,
      Timestamp now,
      List<String> branchIds,
      List<SchoolSeed> schools,
      List<String> leadIds)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String studentSql =
        "INSERT INTO public.student "
            + "(id, company_id, lead_id, code, name, kana, birthday, gender_code, school_code, "
            + "school_name, school_grade_code, status, note, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String studentBranchSql =
        "INSERT INTO public.student_branch "
            + "(id, company_id, student_id, branch_id, is_primary, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, true, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";

    List<Query> studentBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<Query> branchBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<StudentSeed> studentSeeds = new ArrayList<>(options.getStudentCount());
    for (int i = 1; i <= options.getStudentCount(); i++) {
      String studentId = String.format("st%019d", i);
      String studentCode = String.format("ST%05d", i);
      String branchId = branchIds.get((i - 1) % branchIds.size());
      String leadId = leadIds.isEmpty() ? null : leadIds.get((i - 1) % leadIds.size());
      SchoolSeed school = schools.get(ThreadLocalRandom.current().nextInt(schools.size()));
      MasterRow gender = GENDERS.get((i - 1) % GENDERS.size());
      MasterRow schoolGrade = SCHOOL_GRADES.get((i - 1) % SCHOOL_GRADES.size());
      String name = faker.name().fullName();
      String kana = buildKanaName();
      Date birthday = Date.valueOf(LocalDate.now().minusYears(10 + (i % 8)).minusDays(i % 28));
      String note = "seed student " + i;
      studentSeeds.add(new StudentSeed(studentId, branchId, leadId));

      studentBatch.add(dsl.query(studentSql, studentId, options.getCompanyId(), leadId, studentCode,
          name, kana, birthday, gender.code(), school.code(), school.name(), schoolGrade.code(),
          note, now, now));
      branchBatch.add(dsl.query(studentBranchSql, "sb%019d".formatted(i), options.getCompanyId(),
          studentId, branchId, now, now));

      if (studentBatch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, studentSql, studentBatch);
        flushBatch(conn, studentBranchSql, branchBatch);
      }
    }
    flushBatch(conn, studentSql, studentBatch);
    flushBatch(conn, studentBranchSql, branchBatch);
    log.info("Student generation completed (count={})", options.getStudentCount());
    return studentSeeds;
  }

  // 生徒ごとの保護者、請求先、紐付けを生成する。
  List<StudentAccountSeed> generateStudentAccounts(
      Connection conn, SeedDataOptions options, Timestamp now, List<StudentSeed> students)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String guardianSql =
        "INSERT INTO public.guardian "
            + "(id, company_id, name, kana, relationship_code, prefecture_code, phone, email, "
            + "postal_code, address, note, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String billingContactSql =
        "INSERT INTO public.billing_contact "
            + "(id, company_id, name, kana, billing_method, prefecture_code, phone, email, "
            + "postal_code, address, note, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String studentGuardianSql =
        "INSERT INTO public.student_guardian "
            + "(id, company_id, student_id, guardian_id, relationship_code, is_primary_contact, "
            + "created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, true, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String studentBillingContactSql =
        "INSERT INTO public.student_billing_contact "
            + "(id, company_id, student_id, billing_contact_id, is_primary, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, true, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";

    List<Query> guardianBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<Query> billingContactBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<Query> studentGuardianBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<Query> studentBillingContactBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<StudentAccountSeed> accounts = new ArrayList<>(students.size());
    for (int i = 1; i <= students.size(); i++) {
      StudentSeed student = students.get(i - 1);
      String guardianId = String.format("gd%019d", i);
      String billingContactId = String.format("bc%019d", i);
      MasterRow relationship = RELATIONSHIPS.get((i - 1) % RELATIONSHIPS.size());
      MasterRow prefecture = PREFECTURES.get((i - 1) % PREFECTURES.size());
      String guardianName = faker.name().fullName();
      String guardianKana = buildKanaName();
      String phone = buildPhoneNumber();
      String email = buildGuardianEmail(i);
      String postalCode = buildZipCode();
      String address = buildJapaneseAddress();

      accounts.add(new StudentAccountSeed(student.studentId(), guardianId, billingContactId));
      guardianBatch.add(dsl.query(guardianSql, guardianId, options.getCompanyId(), guardianName,
          guardianKana, relationship.code(), prefecture.code(), phone, email, postalCode, address,
          "seed guardian " + i, now, now));
      billingContactBatch.add(dsl.query(billingContactSql, billingContactId, options.getCompanyId(),
          guardianName, guardianKana, "bank_transfer", prefecture.code(), phone, email, postalCode,
          address, "seed billing contact " + i, now, now));
      studentGuardianBatch.add(dsl.query(studentGuardianSql, String.format("sg%019d", i),
          options.getCompanyId(), student.studentId(), guardianId, relationship.code(), now, now));
      studentBillingContactBatch.add(dsl.query(studentBillingContactSql, String.format("sc%019d", i),
          options.getCompanyId(), student.studentId(), billingContactId, now, now));

      if (guardianBatch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, guardianSql, guardianBatch);
        flushBatch(conn, billingContactSql, billingContactBatch);
        flushBatch(conn, studentGuardianSql, studentGuardianBatch);
        flushBatch(conn, studentBillingContactSql, studentBillingContactBatch);
      }
    }
    flushBatch(conn, guardianSql, guardianBatch);
    flushBatch(conn, billingContactSql, billingContactBatch);
    flushBatch(conn, studentGuardianSql, studentGuardianBatch);
    flushBatch(conn, studentBillingContactSql, studentBillingContactBatch);
    log.info("Student account generation completed (count={})", accounts.size());
    return accounts;
  }

  // 生徒ごとの受講契約を生成する。
  List<ContractSeed> generateContracts(
      Connection conn,
      SeedDataOptions options,
      Timestamp now,
      List<StudentAccountSeed> accounts,
      List<SubjectSeed> subjects)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public.contract "
            + "(id, company_id, student_id, guardian_id, contract_start_date, contract_end_date, "
            + "subject_id, weekly_lessons, preferred_weekday, preferred_start_time, preferred_end_time, "
            + "billing_cycle, monthly_fee, discount_amount, status, note, created_at, updated_at, "
            + "is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, 'monthly', ?, 0, 'active', ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    List<Query> batch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<ContractSeed> contracts = new ArrayList<>(accounts.size());
    for (int i = 1; i <= accounts.size(); i++) {
      StudentAccountSeed account = accounts.get(i - 1);
      SubjectSeed subject = subjects.get((i - 1) % subjects.size());
      String contractId = String.format("ct%019d", i);
      Date startDate = Date.valueOf(LocalDate.now().minusMonths(i % 12).withDayOfMonth(1));
      int weeklyLessons = 1 + (i % 3);
      int preferredWeekday = 1 + (i % 6);
      Time startTime = Time.valueOf(LocalTime.of(16 + (i % 4), 0));
      Time endTime = Time.valueOf(startTime.toLocalTime().plusMinutes(60));
      long monthlyFee = 12_000L + (weeklyLessons * 5_000L);
      contracts.add(new ContractSeed(contractId, account.studentId(), account.billingContactId(), monthlyFee));
      batch.add(dsl.query(sql, contractId, options.getCompanyId(), account.studentId(),
          account.guardianId(), startDate, subject.subjectId(), weeklyLessons, preferredWeekday,
          startTime, endTime, monthlyFee, "seed contract " + i, now, now));
      if (batch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, sql, batch);
      }
    }
    flushBatch(conn, sql, batch);
    log.info("Contract generation completed (count={})", contracts.size());
    return contracts;
  }

  // 契約に基づく請求、請求明細、入金を生成する。
  void generateBillingsAndPayments(
      Connection conn, SeedDataOptions options, Timestamp now, List<ContractSeed> contracts)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String billingSql =
        "INSERT INTO public.billing "
            + "(id, company_id, student_id, billing_contact_id, contract_id, billing_month, issued_on, "
            + "due_on, status, total_amount, note, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String billingLineSql =
        "INSERT INTO public.billing_line "
            + "(id, company_id, billing_id, student_id, line_type, description, quantity, unit_price, "
            + "amount, sort_order, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, 'monthly_fee', ?, 1, ?, ?, 1, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";
    String paymentSql =
        "INSERT INTO public.payment "
            + "(id, company_id, billing_id, student_id, received_on, amount, payment_method, status, "
            + "note, created_at, updated_at, is_deleted, deleted_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, false, NULL) "
            + "ON CONFLICT (id) DO NOTHING";

    List<Query> billingBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<Query> billingLineBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    List<Query> paymentBatch = new ArrayList<>(SeedDataOptions.DEFAULT_BATCH_SIZE);
    for (int i = 1; i <= contracts.size(); i++) {
      ContractSeed contract = contracts.get(i - 1);
      String billingId = String.format("bl%019d", i);
      Date billingMonth = Date.valueOf(LocalDate.now().withDayOfMonth(1));
      Date issuedOn = Date.valueOf(LocalDate.now());
      Date dueOn = Date.valueOf(LocalDate.now().plusDays(14));
      String status = i % 3 == 0 ? "paid" : "issued";
      billingBatch.add(dsl.query(billingSql, billingId, options.getCompanyId(), contract.studentId(),
          contract.billingContactId(), contract.contractId(), billingMonth, issuedOn, dueOn, status,
          contract.monthlyFee(), "seed billing " + i, now, now));
      billingLineBatch.add(dsl.query(billingLineSql, String.format("li%019d", i), options.getCompanyId(),
          billingId, contract.studentId(), "月謝", contract.monthlyFee(), contract.monthlyFee(), now, now));
      if ("paid".equals(status)) {
        paymentBatch.add(dsl.query(paymentSql, String.format("py%019d", i), options.getCompanyId(),
            billingId, contract.studentId(), Date.valueOf(LocalDate.now()), contract.monthlyFee(),
            "bank_transfer", "seed payment " + i, now, now));
      }
      if (billingBatch.size() == SeedDataOptions.DEFAULT_BATCH_SIZE) {
        flushBatch(conn, billingSql, billingBatch);
        flushBatch(conn, billingLineSql, billingLineBatch);
        flushBatch(conn, paymentSql, paymentBatch);
      }
    }
    flushBatch(conn, billingSql, billingBatch);
    flushBatch(conn, billingLineSql, billingLineBatch);
    flushBatch(conn, paymentSql, paymentBatch);
    log.info("Billing and payment generation completed (billingCount={})", contracts.size());
  }

  // コード/名称/表示順を持つマスタを共通のINSERTで投入する。
  private void upsertCodeNameRows(Connection conn, String tableName, List<MasterRow> rows)
      throws SQLException {
    DSLContext dsl = dsl(conn);
    String sql =
        "INSERT INTO public."
            + tableName
            + " (code, name, sort_order) VALUES (?, ?, ?) ON CONFLICT (code) DO NOTHING";
    List<Query> batch = new ArrayList<>(rows.size());
    for (MasterRow row : rows) {
      batch.add(dsl.query(sql, row.code(), row.name(), row.sortOrder()));
    }
    flushBatch(conn, sql, batch);
  }

  // バッチを実行して再利用しやすいようにクリアする。
  private void flushBatch(Connection conn, String sql, List<Query> batch) throws SQLException {
    if (batch.isEmpty()) {
      return;
    }
    dsl(conn).batch(batch).execute();
    conn.commit();
    batch.clear();
  }

  // 単一 SQL を実行して件数を返す。
  private int delete(Connection conn, String sql, Object... bindings) {
    if (sql.startsWith("DELETE FROM public.")) {
      int whereIndex = sql.indexOf(" WHERE ");
      if (whereIndex > "DELETE FROM ".length()) {
        String tableName = sql.substring("DELETE FROM ".length(), whereIndex).trim();
        if (!tableExists(conn, tableName)) {
          return 0;
        }
      }
    }
    return dsl(conn).query(sql, bindings).execute();
  }

  // 対象テーブルが存在するかを確認する。
  private boolean tableExists(Connection conn, String tableName) {
    return dsl(conn).fetchValue("select to_regclass(?)", tableName) != null;
  }

  /** Connection から jOOQ の DSLContext を作成します。 */
  private DSLContext dsl(Connection conn) {
    return DSL.using(conn);
  }

  // 郵便番号を7桁で生成する。
  private String buildZipCode() {
    return String.format("%07d", ThreadLocalRandom.current().nextInt(0, 10_000_000));
  }

  // 日本語っぽい住所を生成する。
  private String buildJapaneseAddress() {
    return faker.address().fullAddress().replace('\n', ' ');
  }

  // 架空の電話番号を固定フォーマットで生成する。
  private String buildPhoneNumber() {
    return String.format(
        "090-%04d-%04d",
        ThreadLocalRandom.current().nextInt(10_000),
        ThreadLocalRandom.current().nextInt(10_000));
  }

  // リード用のメールアドレスを連番で生成する。
  private String buildLeadEmail(int sequence) {
    return String.format("lead%05d@example.com", sequence);
  }

  // 講師用のメールアドレスを連番で生成する。
  private String buildTeacherEmail(int sequence) {
    return String.format("teacher%05d@example.com", sequence);
  }

  // 保護者・請求先用のメールアドレスを連番で生成する。
  private String buildGuardianEmail(int sequence) {
    return String.format("guardian%05d@example.com", sequence);
  }

  // 会社IDと連番から、会社間で衝突しにくい seed 用科目IDを生成する。
  private String buildSubjectId(String companyId, int sequence) {
    long companyHash = Integer.toUnsignedLong(companyId.hashCode()) % 1_000_000_000L;
    return String.format("sj%09d%010d", companyHash, sequence);
  }

  // カナっぽい氏名を生成する。
  private String buildKanaName() {
    int firstCount = 2 + ThreadLocalRandom.current().nextInt(2);
    int lastCount = 2 + ThreadLocalRandom.current().nextInt(2);
    return buildKanaWord(firstCount) + " " + buildKanaWord(lastCount);
  }

  // カナ単語を生成する。
  private String buildKanaWord(int syllableCount) {
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < syllableCount; i++) {
      builder.append(KANA_SYLLABLES[ThreadLocalRandom.current().nextInt(KANA_SYLLABLES.length)]);
    }
    return builder.toString();
  }

  // 共通マスタのコード・名称・表示順を表す行。
  private record MasterRow(String code, String name, int sortOrder) {}

  // 参照用の学校の最小情報。
  private record SchoolSeed(String code, String name) {}

  // 参照用の科目の最小情報。
  private record SubjectSeed(String subjectId, String code, String name) {}
}
