package com.cxisystem.feature.input;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 拠点一覧の絞り込み条件です。 拠点名、コード、所属エリアでの検索を受け付けます。
 */
@Name("BranchFilterInput")
@Input
@Data
@NoArgsConstructor
public class BranchFilterInput {

  private String name;
  private String code;
  private String areaId;
}
