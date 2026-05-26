package com.cxisystem.feature.util;

import com.password4j.Argon2Function;
import com.password4j.Hash;
import com.password4j.Password;
import com.password4j.types.Argon2;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Argon2id ベースのパスワードハッシュ化と検証。 BFF 側の認証処理と互換になる前提で backend にも共通実装を置く。
 */
@ApplicationScoped
public class PasswordUtil {

  private static final Argon2Function DEFAULT_ARGON2 =
      Argon2Function.getInstance(65536, 3, 4, 32, Argon2.ID);

  /** 平文パスワードを Argon2id でハッシュ化します。 */
  public static String hash(String plainPassword) {
    if (plainPassword == null || plainPassword.isEmpty()) {
      throw new IllegalArgumentException("Password cannot be null or empty");
    }
    Hash hash = Password.hash(plainPassword).with(DEFAULT_ARGON2);
    return hash.getResult();
  }

  /** 平文パスワードが保存済みハッシュと一致するか検証します。 */
  public static boolean verify(String plainPassword, String hashedPassword) {
    if (plainPassword == null || hashedPassword == null) {
      return false;
    }
    try {
      Argon2Function argon2 = Argon2Function.getInstanceFromHash(hashedPassword);
      return Password.check(plainPassword, hashedPassword).with(argon2);
    } catch (Exception exception) {
      return false;
    }
  }
}
