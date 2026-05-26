package com.cxisystem.feature.enumeration;

/**
 * employee.status の永続化値。 初期段階では invited / active / suspended の最小セットで扱う。
 */
public enum EmployeeStatus {
  INVITED("invited"), ACTIVE("active"), SUSPENDED("suspended");

  private final String value;

  EmployeeStatus(String value) {
    this.value = value;
  }

  /** 永続化に使う文字列表現を返します。 */
  public String value() {
    return value;
  }
}
