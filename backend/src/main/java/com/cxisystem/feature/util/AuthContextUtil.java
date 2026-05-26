package com.cxisystem.feature.util;

import com.cxisystem.security.UserInfo;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.inject.spi.CDI;

/**
 * SecurityIdentity から現在ユーザー情報を取得するユーティリティ。 CDI管理外の補助クラスや jOOQ Listener
 * からも参照できるよう static 化している。
 */
public final class AuthContextUtil {

  private AuthContextUtil() {}

  /** 現在ログイン中ユーザーの companyId を返します。 */
  public static String getCurrentCompanyId() {
    UserInfo user = getCurrentUserInfo();
    return user != null ? user.getCompanyId() : null;
  }

  /** 現在ログイン中ユーザーの userId を返します。 */
  public static String getCurrentUserId() {
    UserInfo user = getCurrentUserInfo();
    return user != null ? user.getUserId() : null;
  }

  /** SecurityIdentity から現在ユーザー情報を取得します。 */
  @SuppressWarnings("null")
  public static UserInfo getCurrentUserInfo() {
    try {
      var instance = CDI.current().select(SecurityIdentity.class);
      if (instance == null || !instance.isResolvable()) {
        return null;
      }
      SecurityIdentity identity = instance.get();
      return identity.getAttribute("userInfo");
    } catch (Exception ignored) {
      return null;
    }
  }
}
