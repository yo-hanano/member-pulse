package com.cxisystem.feature.input;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * エリア一覧の絞り込み条件です。 初期段階では名称の部分一致だけを扱います。
 */
@Name("AreaFilterInput")
@Input
@Data
@NoArgsConstructor
public class AreaFilterInput {

  private String name;
}
