package com.cxisystem.feature.type;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 旧 branch GraphQL フィールドとの後方互換だけを担う簡易型です。
 */
@Data
@NoArgsConstructor
public class Branch {

  private String id;

  private String code;

  private String name;

  private Prefecture prefecture;
}
