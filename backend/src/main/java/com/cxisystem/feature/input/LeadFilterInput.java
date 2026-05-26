package com.cxisystem.feature.input;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * リード一覧の絞り込み条件です。 MVP では問合せ日時、拠点、氏名、保護者名、学校名、流入経路、状態で検索できるようにします。
 */
@Name("LeadFilterInput")
@Input
@Data
@NoArgsConstructor
public class LeadFilterInput {

  private LocalDateTime inquiryAtFrom;
  private LocalDateTime inquiryAtTo;
  private String branchId;
  private String studentName;
  private String guardianName;
  private String schoolName;
  private String channel;
  private String status;
}
