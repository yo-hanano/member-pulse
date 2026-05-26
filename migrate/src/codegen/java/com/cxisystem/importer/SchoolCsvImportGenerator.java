package com.cxisystem.importer;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Loader;
import org.jooq.Query;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// 学校CSVをDBへ取り込むための importer。
public final class SchoolCsvImportGenerator {
  private static final Logger log = LoggerFactory.getLogger(SchoolCsvImportGenerator.class);
  private static final DateTimeFormatter CSV_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/M/d");
  private static final int BATCH_SIZE = 1000;

  private static final Field<String> SCHOOL_CODE = DSL.field(DSL.name("school_code"), String.class);
  private static final Field<String> SCHOOL_TYPE_LABEL =
      DSL.field(DSL.name("school_type_label"), String.class);
  private static final Field<String> PREFECTURE_LABEL =
      DSL.field(DSL.name("prefecture_label"), String.class);
  private static final Field<String> ESTABLISHMENT_KBN_LABEL =
      DSL.field(DSL.name("establishment_kbn_label"), String.class);
  private static final Field<String> HON_BUN_KO_LABEL =
      DSL.field(DSL.name("hon_bun_ko_label"), String.class);
  private static final Field<String> SCHOOL_NAME = DSL.field(DSL.name("school_name"), String.class);
  private static final Field<String> SCHOOL_ADDRESS =
      DSL.field(DSL.name("school_address"), String.class);
  private static final Field<String> ZIP_CODE = DSL.field(DSL.name("zip_code"), String.class);
  private static final Field<String> SETTEI_DATE = DSL.field(DSL.name("settei_date"), String.class);
  private static final Field<String> HAISHI_DATE = DSL.field(DSL.name("haishi_date"), String.class);
  private static final Field<String> OLD_CHOSA_NO = DSL.field(DSL.name("old_chosa_no"), String.class);
  private static final Field<String> IKO_CODE = DSL.field(DSL.name("iko_code"), String.class);

  private static final String RAW_TABLE_NAME = "school_import_raw";
  private static final String CREATE_RAW_TABLE_SQL =
      """
      CREATE TEMP TABLE school_import_raw (
        school_code TEXT,
        school_type_label TEXT,
        prefecture_label TEXT,
        establishment_kbn_label TEXT,
        hon_bun_ko_label TEXT,
        school_name TEXT,
        school_address TEXT,
        zip_code TEXT,
        settei_date TEXT,
        haishi_date TEXT,
        old_chosa_no TEXT,
        iko_code TEXT
      ) ON COMMIT DROP
      """;
  private static final String INSERT_SCHOOL_SQL =
      """
      INSERT INTO public.school (
        code,
        school_type_code,
        prefecture_code,
        establishment_kbn,
        hon_bun_ko,
        name,
        address,
        zip_code,
        settei_date,
        haishi_date,
        old_chosa_no,
        iko_code,
        created_at,
        updated_at,
        is_deleted,
        deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, NULL)
      ON CONFLICT (code) DO UPDATE SET
        school_type_code = EXCLUDED.school_type_code,
        prefecture_code = EXCLUDED.prefecture_code,
        establishment_kbn = EXCLUDED.establishment_kbn,
        hon_bun_ko = EXCLUDED.hon_bun_ko,
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        zip_code = EXCLUDED.zip_code,
        settei_date = EXCLUDED.settei_date,
        haishi_date = EXCLUDED.haishi_date,
        old_chosa_no = EXCLUDED.old_chosa_no,
        iko_code = EXCLUDED.iko_code,
        updated_at = EXCLUDED.updated_at,
        is_deleted = false,
        deleted_at = NULL
      """;

  private SchoolCsvImportGenerator() {}

  // コマンドライン引数に従って CSV 取り込みを実行する。
  public static void main(String[] args) {
    if (SchoolCsvImportOptions.hasFlag(args, "help")) {
      printHelp();
      return;
    }

    String profile = System.getenv("PROFILE");
    boolean allowed =
        profile != null && ("local".equalsIgnoreCase(profile) || "stg".equalsIgnoreCase(profile));
    if (!allowed) {
      log.error("PROFILE must be local or stg to run school CSV import. Current PROFILE={}", profile);
      System.exit(2);
    }

    DbConfig dbConfig = DbConfig.fromEnv();
    if (dbConfig == null) {
      log.error("Database config is missing. Set LIQUIBASE_COMMAND_URL/USERNAME/PASSWORD or PG*.");
      System.exit(2);
    }

    SchoolCsvImportOptions options = SchoolCsvImportOptions.parse(args);
    Path csvDir = Paths.get(options.getCsvDir());
    if (!Files.isDirectory(csvDir)) {
      log.error("CSV directory does not exist: {}", csvDir.toAbsolutePath());
      System.exit(2);
    }

    log.info(
        "Starting school CSV import for JDBC URL: {}, csvDir={}, truncate={}",
        dbConfig.url,
        csvDir.toAbsolutePath(),
        options.isTruncate());

    try (Connection conn = DriverManager.getConnection(dbConfig.url, dbConfig.username, dbConfig.password)) {
      conn.setAutoCommit(false);
      DSLContext dsl = DSL.using(conn);
      try {
        prepareRawTable(dsl);
        if (options.isTruncate()) {
          truncateSchoolTable(dsl);
        }

        List<Path> csvFiles = listCsvFiles(csvDir);
        if (csvFiles.isEmpty()) {
          throw new IllegalStateException("No CSV files found in " + csvDir.toAbsolutePath());
        }

        for (Path csvFile : csvFiles) {
          loadCsvFile(dsl, csvFile);
        }

        Map<Integer, String> prefectureCodeByOrder = loadPrefectureCodeMap(dsl);
        int imported = upsertSchools(dsl, prefectureCodeByOrder);
        conn.commit();

        log.info(
            "School CSV import completed (files={}, schools={})",
            csvFiles.size(),
            imported);
      } catch (Exception e) {
        conn.rollback();
        throw e;
      }
    } catch (Exception e) {
      log.error("School CSV import failed", e);
      System.exit(1);
    }
  }

  // ヘルプを出力する。
  private static void printHelp() {
    String help =
        """
        Usage: SchoolCsvImportGenerator [options]

        Default: load all CSV files under src/csv and upsert them into public.school.
        Use --truncate to delete existing public.school rows before import.
        Note: --truncate is intended for a fresh DB or before dependent rows are created.

        Options:
          --help                 Show this help message
          --csv-dir PATH         CSV directory (default: src/csv)
          --truncate             Delete existing public.school rows before import

        DB env (required):
          LIQUIBASE_COMMAND_URL / LIQUIBASE_COMMAND_USERNAME / LIQUIBASE_COMMAND_PASSWORD
          or PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
        """;
    System.out.println(help);
  }

  // staging 用の一時テーブルを作成する。
  private static void prepareRawTable(DSLContext dsl) {
    dsl.execute(CREATE_RAW_TABLE_SQL);
  }

  // 既存の school を削除する。依存行があると失敗するため、使い所は限定する。
  private static void truncateSchoolTable(DSLContext dsl) {
    log.warn("Deleting existing public.school rows before import");
    dsl.execute("DELETE FROM public.school");
  }

  // CSV をファイル名順で列挙する。
  private static List<Path> listCsvFiles(Path csvDir) throws IOException {
    List<Path> files = new ArrayList<>();
    try (DirectoryStream<Path> stream = Files.newDirectoryStream(csvDir, "*.csv")) {
      for (Path path : stream) {
        files.add(path);
      }
    }
    files.sort(Comparator.comparing(path -> path.getFileName().toString()));
    return files;
  }

  // CSV を staging に読み込む。
  private static void loadCsvFile(DSLContext dsl, Path csvFile) throws IOException {
    log.info("Loading CSV file: {}", csvFile.toAbsolutePath());
    try (InputStream in = Files.newInputStream(csvFile)) {
      Loader<?> loader =
          dsl.loadInto(DSL.table(DSL.name(RAW_TABLE_NAME)))
              .loadCSV(in, StandardCharsets.UTF_8)
              .fields(
                  SCHOOL_CODE,
                  SCHOOL_TYPE_LABEL,
                  PREFECTURE_LABEL,
                  ESTABLISHMENT_KBN_LABEL,
                  HON_BUN_KO_LABEL,
                  SCHOOL_NAME,
                  SCHOOL_ADDRESS,
                  ZIP_CODE,
                  SETTEI_DATE,
                  HAISHI_DATE,
                  OLD_CHOSA_NO,
                  IKO_CODE)
              .ignoreRows(1)
              .separator(',')
              .quote('"')
              .execute();
      log.info(
          "Loaded CSV file: {}, processed={}, stored={}, ignored={}",
          csvFile.getFileName(),
          loader.processed(),
          loader.stored(),
          loader.ignored());
    }
  }

  // prefecture.sort_order から CSV 先頭の都道府県番号に対応する code を作る。
  private static Map<Integer, String> loadPrefectureCodeMap(DSLContext dsl) {
    Field<Integer> sortOrder = DSL.field(DSL.name("sort_order"), Integer.class);
    Field<String> code = DSL.field(DSL.name("code"), String.class);
    Map<Integer, String> codes =
        dsl.select(sortOrder, code)
            .from(DSL.table(DSL.name("public", "prefecture")))
            .fetchMap(sortOrder, code);
    if (codes.size() != 47) {
      throw new IllegalStateException("prefecture master is incomplete: " + codes.size());
    }
    return codes;
  }

  // staging を正規化して school テーブルへ反映する。
  private static int upsertSchools(DSLContext dsl, Map<Integer, String> prefectureCodeByOrder) {
    var rows =
        dsl.select(
                SCHOOL_CODE,
                SCHOOL_TYPE_LABEL,
                PREFECTURE_LABEL,
                ESTABLISHMENT_KBN_LABEL,
                HON_BUN_KO_LABEL,
                SCHOOL_NAME,
                SCHOOL_ADDRESS,
                ZIP_CODE,
                SETTEI_DATE,
                HAISHI_DATE,
                OLD_CHOSA_NO,
                IKO_CODE)
            .from(DSL.table(DSL.name(RAW_TABLE_NAME)))
            .fetch();

    Timestamp now = Timestamp.valueOf(LocalDateTime.now());
    List<Query> batch = new ArrayList<>(BATCH_SIZE);
    int imported = 0;
    for (Record row : rows) {
      SchoolRow normalized = normalize(row, prefectureCodeByOrder);
      batch.add(
          dsl.query(
              INSERT_SCHOOL_SQL,
              normalized.code(),
              normalized.schoolTypeCode(),
              normalized.prefectureCode(),
              normalized.establishmentKbn(),
              normalized.honBunKo(),
              normalized.name(),
              normalized.address(),
              normalized.zipCode(),
              normalized.setteiDate(),
              normalized.haishiDate(),
              normalized.oldChosaNo(),
              normalized.ikoCode(),
              now,
              now));
      imported++;
      if (batch.size() == BATCH_SIZE) {
        flushBatch(dsl, batch);
      }
    }
    flushBatch(dsl, batch);
    return imported;
  }

  // バッチを実行してクリアする。
  private static void flushBatch(DSLContext dsl, List<Query> batch) {
    if (batch.isEmpty()) {
      return;
    }
    dsl.batch(batch).execute();
    batch.clear();
  }

  // CSV の1行を school テーブル向けに正規化する。
  private static SchoolRow normalize(Record row, Map<Integer, String> prefectureCodeByOrder) {
    String code = requireText(row, SCHOOL_CODE);
    String schoolTypeCode = extractCode(requireText(row, SCHOOL_TYPE_LABEL));
    String prefectureCode = resolvePrefectureCode(requireText(row, PREFECTURE_LABEL), prefectureCodeByOrder);
    int establishmentKbn = parseIntCode(requireText(row, ESTABLISHMENT_KBN_LABEL));
    int honBunKo = parseIntCode(requireText(row, HON_BUN_KO_LABEL));
    String name = requireText(row, SCHOOL_NAME);
    String address = requireText(row, SCHOOL_ADDRESS);
    String zipCode = blankToNull(row.get(ZIP_CODE));
    LocalDate setteiDate = parseDate(requireText(row, SETTEI_DATE));
    LocalDate haishiDate = parseOptionalDate(row.get(HAISHI_DATE));
    String oldChosaNo = blankToNull(row.get(OLD_CHOSA_NO));
    String ikoCode = normalizeIkoCode(row.get(IKO_CODE));

    return new SchoolRow(
        code,
        schoolTypeCode,
        prefectureCode,
        establishmentKbn,
        honBunKo,
        name,
        address,
        zipCode,
        setteiDate,
        haishiDate,
        oldChosaNo,
        ikoCode);
  }

  // `01(北海道)` のような表現から code 部分だけを返す。
  private static String resolvePrefectureCode(
      String rawValue, Map<Integer, String> prefectureCodeByOrder) {
    String orderText = extractCode(rawValue);
    int order;
    try {
      order = Integer.parseInt(orderText);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid prefecture order: " + rawValue, e);
    }
    String code = prefectureCodeByOrder.get(order);
    if (code == null) {
      throw new IllegalStateException("Unknown prefecture order: " + rawValue);
    }
    return code;
  }

  // `A1(幼稚園)` や `1(国)` のような値から先頭のコードを抜き出す。
  private static String extractCode(String rawValue) {
    int separator = rawValue.indexOf('(');
    return separator >= 0 ? rawValue.substring(0, separator).trim() : rawValue.trim();
  }

  // 先頭コードを整数として返す。
  private static int parseIntCode(String rawValue) {
    try {
      return Integer.parseInt(extractCode(rawValue));
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid numeric code: " + rawValue, e);
    }
  }

  // 必須値を取得する。
  private static String requireText(Record row, Field<String> field) {
    String value = row.get(field);
    if (value == null || value.isBlank()) {
      throw new IllegalArgumentException("Required CSV value is missing: " + field.getName());
    }
    return value;
  }

  // 空文字列は null に寄せる。
  private static String blankToNull(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value;
  }

  // 旧コードは複数候補が入っていることがあるので、先頭だけを採用する。
  private static String normalizeIkoCode(String value) {
    String normalized = blankToNull(value);
    if (normalized == null) {
      return null;
    }

    String[] parts = normalized.split("[、,､，\\r\\n]+");
    String first = parts[0].trim();
    if (parts.length > 1) {
      log.warn("Multiple iko_code values found. Using the first value only: {}", normalized);
    }
    return first.isBlank() ? null : first;
  }

  // 日付文字列を `yyyy/M/d` として解釈する。
  private static LocalDate parseDate(String value) {
    return LocalDate.parse(value, CSV_DATE_FORMAT);
  }

  // 空欄なら null、それ以外は日付として解釈する。
  private static LocalDate parseOptionalDate(String value) {
    String normalized = blankToNull(value);
    return normalized == null ? null : parseDate(normalized);
  }

  // 正規化済み学校レコード。
  private record SchoolRow(
      String code,
      String schoolTypeCode,
      String prefectureCode,
      int establishmentKbn,
      int honBunKo,
      String name,
      String address,
      String zipCode,
      LocalDate setteiDate,
      LocalDate haishiDate,
      String oldChosaNo,
      String ikoCode) {}
}
