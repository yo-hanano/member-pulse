package com.cxisystem.security;

import java.util.Set;
import lombok.Data;

/**
 * 認証済みユーザーの最小情報を保持するDTO。 後続でRedisセッション連携を入れる前提で、属性参照の型だけ先に揃える。
 */
@Data
public class UserInfo {

  private String userId;
  private String name;
  private String companyId;
  private String email;
  private Set<String> groups;
}
