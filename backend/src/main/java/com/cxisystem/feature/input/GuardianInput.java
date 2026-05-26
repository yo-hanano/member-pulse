package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 保護者の作成・更新で受け取る入力値です。 生徒フォーム内の主保護者入力にも、将来の保護者単独画面にも流用します。
 */
@Name("GuardianInput")
@Input
@Data
@NoArgsConstructor
public class GuardianInput {

  @Size(max = 21) private String id;

  @NotBlank @Size(max = 100) private String name;

  @NotBlank @Size(max = 100) private String kana;

  @NotBlank @Size(max = 32) private String relationshipCode;

  @NotBlank @Size(max = 21) private String prefectureCode;

  @NotBlank @Size(max = 20) private String phone;

  @Size(max = 255) private String email;

  @NotBlank @Size(max = 10) private String postalCode;

  @NotBlank @Size(max = 255) private String address;

  @Size(max = 1000) private String note;
}
