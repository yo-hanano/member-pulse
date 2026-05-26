package com.cxisystem.feature.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import org.apache.commons.lang3.StringUtils;

/**
 * 日付文字列の変換と正規化を行う共通ユーティリティです。 source プロジェクトの `DateUtil` と役割を合わせつつ、backend
 * 向けに最小実装に絞っています。
 */
public final class DateUtil {

  private static final DateTimeFormatter[] DEFAULT_DATE_FORMATTERS =
      {DateTimeFormatter.ISO_LOCAL_DATE, DateTimeFormatter.ofPattern("yyyy/MM/dd")};

  private static final DateTimeFormatter DEFAULT_DATE_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy/MM/dd");

  private static final DateTimeFormatter[] DEFAULT_DATE_TIME_FORMATTERS =
      {DateTimeFormatter.ISO_LOCAL_DATE_TIME, DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),
          DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm")};

  private static final DateTimeFormatter DEFAULT_DATE_TIME_FORMATTER =
      DateTimeFormatter.ISO_LOCAL_DATE_TIME;

  private DateUtil() {}

  /**
   * 文字列の日付を LocalDate に変換します。 空文字や null は null を返し、ISO 形式と yyyy/MM/dd を標準で受け付けます。
   */
  public static LocalDate parseLocalDate(String value) {
    return parseLocalDate(value, DEFAULT_DATE_FORMATTERS);
  }

  /**
   * 文字列の日付を指定フォーマット群から LocalDate に変換します。 全フォーマットで失敗した場合は IllegalArgumentException
   * を投げます。
   */
  public static LocalDate parseLocalDate(String value, DateTimeFormatter... formatters) {
    String normalized = StringUtils.trimToNull(value);
    if (normalized == null) {
      return null;
    }

    DateTimeParseException lastError = null;
    DateTimeFormatter[] candidates =
        formatters == null || formatters.length == 0 ? DEFAULT_DATE_FORMATTERS : formatters;
    for (DateTimeFormatter formatter : candidates) {
      try {
        return LocalDate.parse(normalized, formatter);
      } catch (DateTimeParseException exception) {
        lastError = exception;
      }
    }

    throw new IllegalArgumentException("invalid date value: " + normalized, lastError);
  }

  /**
   * LocalDate を文字列に変換します。 デフォルトでは ISO 形式を返します。
   */
  public static String formatLocalDate(LocalDate value) {
    return formatLocalDate(value, DEFAULT_DATE_FORMATTER);
  }

  /**
   * LocalDate を指定フォーマッタで文字列に変換します。 null はそのまま null を返します。
   */
  public static String formatLocalDate(LocalDate value, DateTimeFormatter formatter) {
    if (value == null) {
      return null;
    }
    DateTimeFormatter effectiveFormatter = formatter == null ? DEFAULT_DATE_FORMATTER : formatter;
    return value.format(effectiveFormatter);
  }

  /**
   * 文字列の日時を LocalDateTime に変換します。 空文字や null は null を返し、ISO
   * 形式と代表的な区切り形式を標準で受け付けます。
   */
  public static LocalDateTime parseLocalDateTime(String value) {
    return parseLocalDateTime(value, DEFAULT_DATE_TIME_FORMATTERS);
  }

  /**
   * 文字列の日時を指定フォーマット群から LocalDateTime に変換します。 全フォーマットで失敗した場合は
   * IllegalArgumentException を投げます。
   */
  public static LocalDateTime parseLocalDateTime(String value, DateTimeFormatter... formatters) {
    String normalized = StringUtils.trimToNull(value);
    if (normalized == null) {
      return null;
    }

    DateTimeParseException lastError = null;
    DateTimeFormatter[] candidates =
        formatters == null || formatters.length == 0 ? DEFAULT_DATE_TIME_FORMATTERS : formatters;
    for (DateTimeFormatter formatter : candidates) {
      try {
        return LocalDateTime.parse(normalized, formatter);
      } catch (DateTimeParseException exception) {
        lastError = exception;
      }
    }

    throw new IllegalArgumentException("invalid date time value: " + normalized, lastError);
  }

  /**
   * LocalDateTime を文字列に変換します。 デフォルトでは ISO 形式を返します。
   */
  public static String formatLocalDateTime(LocalDateTime value) {
    return formatLocalDateTime(value, DEFAULT_DATE_TIME_FORMATTER);
  }

  /**
   * LocalDateTime を指定フォーマッタで文字列に変換します。 null はそのまま null を返します。
   */
  public static String formatLocalDateTime(LocalDateTime value, DateTimeFormatter formatter) {
    if (value == null) {
      return null;
    }
    DateTimeFormatter effectiveFormatter =
        formatter == null ? DEFAULT_DATE_TIME_FORMATTER : formatter;
    return value.format(effectiveFormatter);
  }
}
