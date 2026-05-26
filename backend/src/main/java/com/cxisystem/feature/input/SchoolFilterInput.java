package com.cxisystem.feature.input;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 学校一覧の絞り込み条件です。 学校コード、学校名、都道府県、学校種で検索します。
 */
@Name("SchoolFilterInput")
@Input
@Data
@NoArgsConstructor
public class SchoolFilterInput {

  @Size(max = 16) private String code;

  @Size(max = 128) private String name;

  @Size(max = 21) private String prefectureCode;

  @Size(max = 8) private String schoolTypeCode;

  private Integer establishmentKbn;
}
