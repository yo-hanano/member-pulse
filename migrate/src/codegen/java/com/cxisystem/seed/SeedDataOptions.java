package com.cxisystem.seed;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** CLI 引数の値を保持する読み取り専用コンテナ。 */
final class SeedDataOptions {
  static final int DEFAULT_AREA_COUNT = 3;
  static final int DEFAULT_LOCATION_COUNT = 5;
  static final int DEFAULT_LEAD_COUNT = 80;
  static final int DEFAULT_MEMBER_COUNT = 120;
  static final int DEFAULT_REVIEW_MONTHS = 6;
  static final int DEFAULT_BATCH_SIZE = 500;

  static final String DEFAULT_COMPANY_ID = "m3JjAoupaZaQUXzGWKE4q";
  static final String DEFAULT_COMPANY_CODE = "dev";
  static final String DEFAULT_COMPANY_NAME = "MemberPulse Demo";
  static final String DEFAULT_ADMIN_EMAIL = "tester@cxi-system.com";
  static final String DEFAULT_ADMIN_NAME = "テスト 太郎";
  static final String DEFAULT_ADMIN_PASSWORD_HASH =
      "$argon2id$v=19$m=65536,t=3,p=4$utv97PFpesOztI8x23HfCQ$KLCfVMiGjCJ8tK3qJWYT+5z6DHQ8capi6B9qEVcIP4c";

  private final boolean help;
  private final boolean truncate;
  private final int areaCount;
  private final int locationCount;
  private final int leadCount;
  private final int memberCount;
  private final int reviewMonths;
  private final String companyId;
  private final String companyCode;
  private final String companyName;
  private final LocalDate baseMonth;

  private SeedDataOptions(
      boolean help,
      boolean truncate,
      int areaCount,
      int locationCount,
      int leadCount,
      int memberCount,
      int reviewMonths,
      String companyId,
      String companyCode,
      String companyName,
      LocalDate baseMonth) {
    this.help = help;
    this.truncate = truncate;
    this.areaCount = areaCount;
    this.locationCount = locationCount;
    this.leadCount = leadCount;
    this.memberCount = memberCount;
    this.reviewMonths = reviewMonths;
    this.companyId = companyId;
    this.companyCode = companyCode;
    this.companyName = companyName;
    this.baseMonth = baseMonth.withDayOfMonth(1);
  }

  /** フラグ指定があるかを判定する。 */
  static boolean hasFlag(String[] args, String flag) {
    String token = "--" + flag;
    for (String arg : args) {
      if (arg.equals(token) || arg.startsWith(token + "=")) {
        return true;
      }
    }
    return false;
  }

  /** 対話モードでオプション値を構築する。 */
  static SeedDataOptions prompt() {
    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
    System.out.println("Interactive mode. Press Enter to use defaults.");
    try {
      int areaCount = readInt(reader, "エリア件数", DEFAULT_AREA_COUNT);
      int locationCount = readInt(reader, "拠点件数", DEFAULT_LOCATION_COUNT);
      int leadCount = readInt(reader, "リード件数", DEFAULT_LEAD_COUNT);
      int memberCount = readInt(reader, "会員件数", DEFAULT_MEMBER_COUNT);
      int reviewMonths = readInt(reader, "月次レビュー月数", DEFAULT_REVIEW_MONTHS);
      boolean truncate = readBoolean(reader, "既存データ削除", false);
      String companyId = readString(reader, "会社ID", DEFAULT_COMPANY_ID);
      String companyCode = readString(reader, "会社コード", DEFAULT_COMPANY_CODE);
      String companyName = readString(reader, "会社名", DEFAULT_COMPANY_NAME);
      LocalDate baseMonth = readMonth(reader, "基準月", defaultBaseMonth());

      return new SeedDataOptions(
          false,
          truncate,
          areaCount,
          locationCount,
          leadCount,
          memberCount,
          reviewMonths,
          companyId,
          companyCode,
          companyName,
          baseMonth);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to read interactive input", e);
    }
  }

  /** CLI 引数をパースしてオプション値を構築する。 */
  static SeedDataOptions parse(String[] args) {
    Map<String, String> values = new HashMap<>();
    Set<String> flags = new HashSet<>();
    for (int i = 0; i < args.length; i++) {
      String arg = args[i];
      if (!arg.startsWith("--")) {
        throw new IllegalArgumentException("Unknown argument: " + arg);
      }
      String key = arg.substring(2);
      if (key.contains("=")) {
        String[] parts = key.split("=", 2);
        values.put(parts[0], parts[1]);
      } else if ((i + 1) < args.length && !args[i + 1].startsWith("--")) {
        values.put(key, args[++i]);
      } else {
        flags.add(key);
      }
    }

    return new SeedDataOptions(
        flags.contains("help"),
        flags.contains("truncate"),
        intValue(values, "area-count", DEFAULT_AREA_COUNT),
        intValue(values, "location-count", DEFAULT_LOCATION_COUNT),
        intValue(values, "lead-count", DEFAULT_LEAD_COUNT),
        intValue(values, "member-count", DEFAULT_MEMBER_COUNT),
        intValue(values, "review-months", DEFAULT_REVIEW_MONTHS),
        value(values, "company-id", DEFAULT_COMPANY_ID),
        value(values, "company-code", DEFAULT_COMPANY_CODE),
        value(values, "company-name", DEFAULT_COMPANY_NAME),
        monthValue(values, "base-month", defaultBaseMonth()));
  }

  boolean isHelp() {
    return help;
  }

  boolean isTruncate() {
    return truncate;
  }

  int getAreaCount() {
    return areaCount;
  }

  int getLocationCount() {
    return locationCount;
  }

  int getLeadCount() {
    return leadCount;
  }

  int getMemberCount() {
    return memberCount;
  }

  int getReviewMonths() {
    return reviewMonths;
  }

  String getCompanyId() {
    return companyId;
  }

  String getCompanyCode() {
    return companyCode;
  }

  String getCompanyName() {
    return companyName;
  }

  LocalDate getBaseMonth() {
    return baseMonth;
  }

  private static LocalDate defaultBaseMonth() {
    return LocalDate.now().withDayOfMonth(1);
  }

  private static int intValue(Map<String, String> values, String key, int defaultValue) {
    String raw = values.get(key);
    if (raw == null) {
      return defaultValue;
    }
    try {
      int parsed = Integer.parseInt(raw);
      if (parsed <= 0) {
        throw new IllegalArgumentException(key + " must be positive: " + raw);
      }
      return parsed;
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid value for " + key + ": " + raw, e);
    }
  }

  private static String value(Map<String, String> values, String key, String defaultValue) {
    String raw = values.get(key);
    return Objects.requireNonNullElse(raw, defaultValue);
  }

  private static LocalDate monthValue(Map<String, String> values, String key, LocalDate defaultValue) {
    String raw = values.get(key);
    if (raw == null || raw.isBlank()) {
      return defaultValue;
    }
    return LocalDate.parse(raw + "-01");
  }

  private static String readString(BufferedReader reader, String label, String defaultValue)
      throws IOException {
    String line = readLine(reader, label, defaultValue);
    return line.isBlank() ? defaultValue : line;
  }

  private static int readInt(BufferedReader reader, String label, int defaultValue)
      throws IOException {
    String line = readLine(reader, label, String.valueOf(defaultValue));
    if (line.isBlank()) {
      return defaultValue;
    }
    try {
      int parsed = Integer.parseInt(line);
      if (parsed <= 0) {
        throw new IllegalArgumentException(label + " must be positive: " + line);
      }
      return parsed;
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid value for " + label + ": " + line, e);
    }
  }

  private static boolean readBoolean(BufferedReader reader, String label, boolean defaultValue)
      throws IOException {
    String line = readLine(reader, label, String.valueOf(defaultValue));
    if (line.isBlank()) {
      return defaultValue;
    }
    String normalized = line.trim().toLowerCase();
    return normalized.equals("true")
        || normalized.equals("t")
        || normalized.equals("1")
        || normalized.equals("yes")
        || normalized.equals("y")
        || normalized.equals("on");
  }

  private static LocalDate readMonth(BufferedReader reader, String label, LocalDate defaultValue)
      throws IOException {
    String defaultText = defaultValue.toString().substring(0, 7);
    String line = readLine(reader, label, defaultText);
    return line.isBlank() ? defaultValue : LocalDate.parse(line + "-01");
  }

  private static String readLine(BufferedReader reader, String label, String defaultValue)
      throws IOException {
    System.out.print(label + " [" + defaultValue + "]: ");
    String line = reader.readLine();
    return line == null ? defaultValue : line.trim();
  }
}
