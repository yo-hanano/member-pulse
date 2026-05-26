package com.cxisystem.feature.input;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 請求先の作成・更新で受け取る入力値です。 保護者とは別モデルとして、請求書宛名や請求連絡先を保持します。
 */
@Name("BillingContactInput")
@Input
@Data
@NoArgsConstructor
public class BillingContactInput {

  @Size(max = 21) private String id;

  @NotBlank @Size(max = 100) private String name;

  @NotBlank @Size(max = 100) private String kana;

  @NotBlank @Size(max = 21) private String prefectureCode;

  @NotBlank @Size(max = 20) private String phone;

  @NotBlank @Size(max = 255) private String email;

  @NotBlank @Size(max = 10) private String postalCode;

  @NotBlank @Size(max = 255) private String address;

  @Size(max = 1000) private String note;
}
