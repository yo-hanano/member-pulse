package com.cxisystem.feature.enumeration;

/**
 * employee_token.type の永続化値。 招待とパスワード再設定を同一テーブルで扱うための識別子として使う。
 */
public enum EmployeeTokenType {
  INVITE("invite"), RESET_PASSWORD("reset_password");

  private final String value;

  EmployeeTokenType(String value) {
    this.value = value;
  }

  /** 永続化に使う文字列表現を返します。 */
  public String value() {
    return value;
  }
}
