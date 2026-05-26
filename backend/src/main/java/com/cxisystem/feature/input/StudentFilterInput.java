package com.cxisystem.feature.input;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 生徒一覧の絞り込み条件です。 current MVP ではコード、名前、カナ、所属拠点、学校名、学校種、学年コード、在籍状態で検索します。
 */
@Name("StudentFilterInput")
@Input
@Data
@NoArgsConstructor
public class StudentFilterInput {

  private String code;
  private String name;
  private String kana;
  private String branchId;
  private String schoolName;
  private String schoolTypeCode;
  private String schoolGradeCode;
  private String status;
}
