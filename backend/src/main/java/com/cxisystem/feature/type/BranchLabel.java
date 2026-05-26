package com.cxisystem.feature.type;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Name;

/**
 * 生徒一覧で表示する拠点ラベルです。 拠点名と主所属フラグだけを持つ軽量な表示用型です。
 */
@Name("BranchLabel")
@Data
@NoArgsConstructor
public class BranchLabel {

  private String name;
  private Boolean primary;
}
