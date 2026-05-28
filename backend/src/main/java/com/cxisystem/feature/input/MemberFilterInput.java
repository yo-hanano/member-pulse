package com.cxisystem.feature.input;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 会員一覧の絞り込み条件です。基本情報 CRUD で扱う検索項目を定義します。
 */
@Name("MemberFilterInput")
@Input
@Data
@NoArgsConstructor
public class MemberFilterInput {

  private LocalDate joinedAtFrom;
  private LocalDate joinedAtTo;
  private String locationId;
  private String name;
  private String source;
  private String status;
}
