package com.cxisystem.importer;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

// 学校CSV importer のコマンドライン引数を保持する。
final class SchoolCsvImportOptions {
  static final String DEFAULT_CSV_DIR = "src/csv";

  private final boolean help;
  private final boolean truncate;
  private final String csvDir;

  private SchoolCsvImportOptions(boolean help, boolean truncate, String csvDir) {
    this.help = help;
    this.truncate = truncate;
    this.csvDir = csvDir;
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

  // CLI 引数からオプションを構築する。
  static SchoolCsvImportOptions parse(String[] args) {
    Map<String, String> values = new HashMap<>();
    Set<String> flags = new java.util.HashSet<>();
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
    String csvDir = Objects.requireNonNullElse(values.get("csv-dir"), DEFAULT_CSV_DIR);

    return new SchoolCsvImportOptions(help, truncate, csvDir);
  }

  boolean isHelp() {
    return help;
  }

  boolean isTruncate() {
    return truncate;
  }

  String getCsvDir() {
    return csvDir;
  }
}
