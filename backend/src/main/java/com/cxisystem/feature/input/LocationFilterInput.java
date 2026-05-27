package com.cxisystem.feature.input;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 拠点一覧の絞り込み条件です。名称、エリア、都道府県で検索できます。
 */
@Name("LocationFilterInput")
@Input
@Data
@NoArgsConstructor
public class LocationFilterInput {

  private String name;

  private String areaId;

  private String prefectureCode;
}
