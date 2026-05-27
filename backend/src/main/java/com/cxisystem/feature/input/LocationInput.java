package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 拠点の作成・更新で受け取る入力値です。 area は任意、住所情報も入力できる範囲で扱います。
 */
@Name("LocationInput")
@Input
@Data
@NoArgsConstructor
public class LocationInput {

  @Size(max = 21) private String areaId;

  @NotBlank @Size(max = 100) private String name;

  @Size(max = 8) private String zipCode;

  @Size(max = 21) private String prefectureCode;

  @Size(max = 255) private String address;

  private Boolean isDefault;

  private Integer displayOrder;
}
