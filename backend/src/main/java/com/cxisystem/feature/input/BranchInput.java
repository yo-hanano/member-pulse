package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 拠点の作成・更新で受け取る入力値です。 拠点自身の基本情報だけを持ち、所属管理は別機能で扱います。
 */
@Name("BranchInput")
@Input
@Data
@NoArgsConstructor
public class BranchInput {

  @NotBlank private String areaId;

  @NotBlank private String code;

  @NotBlank private String name;

  @NotBlank private String zipCode;

  @NotBlank private String prefectureCode;

  @NotBlank private String address;
}
