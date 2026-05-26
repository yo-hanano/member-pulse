package com.cxisystem.feature.input;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 講師一覧の絞り込み条件です。 current MVP では講師コード、名前、かな、性別、学校、学年、電話、メール、在籍状態で検索します。
 */
@Name("TeacherFilterInput")
@Input
@Data
@NoArgsConstructor
public class TeacherFilterInput {

  private String code;
  private String name;
  private String kana;
  private String genderCode;
  private String schoolName;
  private String schoolGradeCode;
  private String phone;
  private String email;
  private String status;
}
