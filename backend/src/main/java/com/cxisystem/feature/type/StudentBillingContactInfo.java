package com.cxisystem.feature.type;

/**
 * 生徒に紐づく請求先情報です。 請求先本体の項目に加えて、生徒との関係上の主請求先フラグを持ちます。
 */
public class StudentBillingContactInfo {

  private String id;
  private String name;
  private String kana;
  private String prefectureCode;
  private String phone;
  private String email;
  private String postalCode;
  private String address;
  private String note;
  private Boolean primary;

  /** 請求先 ID を返します。 */
  public String getId() {
    return id;
  }

  /** 請求先 ID を設定します。 */
  public void setId(String id) {
    this.id = id;
  }

  /** 請求先名を返します。 */
  public String getName() {
    return name;
  }

  /** 請求先名を設定します。 */
  public void setName(String name) {
    this.name = name;
  }

  /** 請求先名かなを返します。 */
  public String getKana() {
    return kana;
  }

  /** 請求先名かなを設定します。 */
  public void setKana(String kana) {
    this.kana = kana;
  }

  /** 都道府県コードを返します。 */
  public String getPrefectureCode() {
    return prefectureCode;
  }

  /** 都道府県コードを設定します。 */
  public void setPrefectureCode(String prefectureCode) {
    this.prefectureCode = prefectureCode;
  }

  /** 電話番号を返します。 */
  public String getPhone() {
    return phone;
  }

  /** 電話番号を設定します。 */
  public void setPhone(String phone) {
    this.phone = phone;
  }

  /** メールアドレスを返します。 */
  public String getEmail() {
    return email;
  }

  /** メールアドレスを設定します。 */
  public void setEmail(String email) {
    this.email = email;
  }

  /** 郵便番号を返します。 */
  public String getPostalCode() {
    return postalCode;
  }

  /** 郵便番号を設定します。 */
  public void setPostalCode(String postalCode) {
    this.postalCode = postalCode;
  }

  /** 住所を返します。 */
  public String getAddress() {
    return address;
  }

  /** 住所を設定します。 */
  public void setAddress(String address) {
    this.address = address;
  }

  /** メモを返します。 */
  public String getNote() {
    return note;
  }

  /** メモを設定します。 */
  public void setNote(String note) {
    this.note = note;
  }

  /** 主請求先かどうかを返します。 */
  public Boolean getPrimary() {
    return primary;
  }

  /** 主請求先かどうかを設定します。 */
  public void setPrimary(Boolean primary) {
    this.primary = primary;
  }
}
