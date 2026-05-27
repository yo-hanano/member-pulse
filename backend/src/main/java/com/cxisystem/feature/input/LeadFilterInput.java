package com.cxisystem.feature.input;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * リード一覧の絞り込み条件です。Phase 0 の lead テーブルに合わせて検索項目を定義します。
 */
@Name("LeadFilterInput")
@Input
@Data
@NoArgsConstructor
public class LeadFilterInput {

  private LocalDateTime inquiryAtFrom;
  private LocalDateTime inquiryAtTo;
  private String locationId;
  private String name;
  private String source;
  private String status;
}
