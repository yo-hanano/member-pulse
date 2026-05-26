const DATE_SEPARATOR_PATTERN = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/;
const DATETIME_SEPARATOR_PATTERN = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?/;

// 日付文字列を yyyy/MM/dd に正規化して表示する。
export function formatDateYmd(value: string | Date | null | undefined) {
  if (value == null) {
    return "-";
  }

  if (value instanceof Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("/");
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "-";
  }

  const matched = trimmed.match(DATE_SEPARATOR_PATTERN);
  if (!matched) {
    return trimmed;
  }

  const [, year, month, day] = matched;
  return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
}

// 日時文字列を yyyy/MM/dd HH:mm に正規化して表示する。
export function formatDateTimeYmdHm(value: string | Date | null | undefined) {
  if (value == null) {
    return "-";
  }

  if (value instanceof Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("/") + ` ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "-";
  }

  const matched = trimmed.match(DATETIME_SEPARATOR_PATTERN);
  if (!matched) {
    return trimmed;
  }

  const [, year, month, day, hour, minute] = matched;
  return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")} ${hour.padStart(2, "0")}:${minute}`;
}

// datetime-local input で扱いやすい yyyy-MM-ddTHH:mm 形式へ正規化する。
export function toDateTimeLocalValue(value: string | Date | null | undefined) {
  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const matched = trimmed.match(DATETIME_SEPARATOR_PATTERN);
  if (!matched) {
    return trimmed.slice(0, 16);
  }

  const [, year, month, day, hour, minute] = matched;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}`;
}

// datetime-local 形式の値を、日付入力と時刻入力へ分けて扱います。
export function splitDateTimeLocalValue(value: string | Date | null | undefined) {
  const normalized = toDateTimeLocalValue(value);
  return {
    date: normalized.slice(0, 10),
    time: normalized.slice(11, 16),
  };
}

// 分割した日付・時刻入力を datetime-local 形式へ戻します。
export function joinDateTimeLocalValue(date: string, time: string) {
  if (!date || !time) {
    return "";
  }
  return `${date}T${time}`;
}
