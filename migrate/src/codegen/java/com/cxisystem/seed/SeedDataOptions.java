package com.cxisystem.seed;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

// CLI引数の値を保持する読み取り専用コンテナ。
final class SeedDataOptions {
  static final int DEFAULT_AREA_COUNT = 10;
  static final int DEFAULT_BRANCH_COUNT = 20;
  static final int DEFAULT_STUDENT_COUNT = 100;
  static final int DEFAULT_BATCH_SIZE = 1000;

  static final String DEFAULT_COMPANY_ID = "m3JjAoupaZaQUXzGWKE4q";
  static final String DEFAULT_COMPANY_CODE = "dev";
  static final String DEFAULT_COMPANY_NAME = "テスト株式会社";
  static final String DEFAULT_ADMIN_EMAIL = "tester@cxi-system.com";
  static final String DEFAULT_ADMIN_NAME = "テスト 太郎";
  static final String DEFAULT_ADMIN_PASSWORD_HASH =
      "$argon2id$v=19$m=65536,t=3,p=4$utv97PFpesOztI8x23HfCQ$KLCfVMiGjCJ8tK3qJWYT+5z6DHQ8capi6B9qEVcIP4c";

  private final boolean help;
  private final boolean truncate;
  private final int areaCount;
  private final int branchCount;
  private final int studentCount;
  private final int leadCount;
  private final int teacherCount;
  private final String companyId;
  private final String companyCode;
  private final String companyName;

  private SeedDataOptions(
      boolean help,
      boolean truncate,
      int areaCount,
      int branchCount,
      int studentCount,
      int leadCount,
      int teacherCount,
      String companyId,
      String companyCode,
      String companyName) {
    this.help = help;
    this.truncate = truncate;
    this.areaCount = areaCount;
    this.branchCount = branchCount;
    this.studentCount = studentCount;
    this.leadCount = leadCount;
    this.teacherCount = teacherCount;
    this.companyId = companyId;
    this.companyCode = companyCode;
    this.companyName = companyName;
  }

  // フラグ指定があるかを判定する。
  static boolean hasFlag(String[] args, String flag) {
    String token = "--" + flag;
    for (String arg : args) {
      if (arg.equals(token) || arg.startsWith(token + "=")) {
        return true;
      }
    }
    return false;
  }

  // 対話モードでオプション値を構築する。
  static SeedDataOptions prompt() {
    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
    System.out.println("Interactive mode. Press Enter to use defaults.");
    try {
      int areaCount = readInt(reader, "エリア件数", DEFAULT_AREA_COUNT);
      int branchCount = readInt(reader, "拠点件数", DEFAULT_BRANCH_COUNT);
      int studentCount = readInt(reader, "生徒件数", DEFAULT_STUDENT_COUNT);
      int leadCount = readInt(reader, "リード件数", studentCount * 2);
      int teacherCount = readInt(reader, "講師件数", branchCount);
      boolean truncate = readBoolean(reader, "既存データ削除", false);

      String companyId = readString(reader, "会社ID", DEFAULT_COMPANY_ID);
      String companyCode = readString(reader, "会社コード", DEFAULT_COMPANY_CODE);
      String companyName = readString(reader, "会社名", DEFAULT_COMPANY_NAME);

      return new SeedDataOptions(
          false,
          truncate,
          areaCount,
          branchCount,
          studentCount,
          leadCount,
          teacherCount,
          companyId,
          companyCode,
          companyName);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to read interactive input", e);
    }
  }

  // CLI引数をパースしてオプション値を構築する。
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

    boolean help = flags.contains("help");
    boolean truncate = flags.contains("truncate");
    int areaCount = intValue(values, "area-count", DEFAULT_AREA_COUNT);
    int branchCount = intValue(values, "branch-count", DEFAULT_BRANCH_COUNT);
    int studentCount = intValue(values, "student-count", DEFAULT_STUDENT_COUNT);
    int leadCount = intValue(values, "lead-count", studentCount * 2);
    int teacherCount = intValue(values, "teacher-count", branchCount);

    String companyId = value(values, "company-id", DEFAULT_COMPANY_ID);
    String companyCode = value(values, "company-code", DEFAULT_COMPANY_CODE);
    String companyName = value(values, "company-name", DEFAULT_COMPANY_NAME);

    return new SeedDataOptions(
        help,
        truncate,
        areaCount,
        branchCount,
        studentCount,
        leadCount,
        teacherCount,
        companyId,
        companyCode,
        companyName);
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

  int getBranchCount() {
    return branchCount;
  }

  int getStudentCount() {
    return studentCount;
  }

  int getLeadCount() {
    return leadCount;
  }

  int getTeacherCount() {
    return teacherCount;
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

  // 数値引数の検証（0以下はエラー）。
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

  // 省略時はデフォルト値を使う。
  private static String value(Map<String, String> values, String key, String defaultValue) {
    String raw = values.get(key);
    return Objects.requireNonNullElse(raw, defaultValue);
  }

  // 対話入力が空ならデフォルト値を使う。
  private static String readString(BufferedReader reader, String label, String defaultValue)
      throws IOException {
    String line = readLine(reader, label, defaultValue);
    return line.isBlank() ? defaultValue : line;
  }

  // 対話入力の数値を読む。
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

  // 対話入力の真偽値を読む。
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

  // ラベル付きの1行入力を読む。
  private static String readLine(BufferedReader reader, String label, String defaultValue)
      throws IOException {
    System.out.print(label + " [" + defaultValue + "]: ");
    String line = reader.readLine();
    return line == null ? defaultValue : line.trim();
  }
}
