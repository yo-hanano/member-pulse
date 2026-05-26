package com.cxisystem.security;

import com.github.benmanes.caffeine.cache.Cache;
import io.quarkus.security.AuthenticationFailedException;
import io.quarkus.security.identity.AuthenticationRequestContext;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.SecurityIdentityAugmentor;
import io.quarkus.security.runtime.QuarkusSecurityIdentity;
import io.smallrye.jwt.auth.principal.DefaultJWTCallerPrincipal;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 由来の SecurityIdentity に Redis の UserInfo を付与します。 companyId が入っていないと RLS
 * を張れないため、認証段階で補完します。
 */
@Slf4j
@ApplicationScoped
public class AppIdentityAugmentor implements SecurityIdentityAugmentor {

  @Inject
  RedisService redisService;

  @Inject
  Cache<String, UserInfo> userInfoCache;

  @Inject
  UserInfoCacheService userInfoCacheService;

  /**
   * SecurityIdentity を拡張し、companyId と userInfo を付与します。
   *
   * @param identity 元の認証情報
   * @param context 認証コンテキスト
   * @return 拡張後の SecurityIdentity
   */
  @Override
  public Uni<SecurityIdentity> augment(SecurityIdentity identity,
      AuthenticationRequestContext context) {
    if (!(identity.getPrincipal() instanceof DefaultJWTCallerPrincipal jwtPrincipal)) {
      if (identity.isAnonymous()) {
        return Uni.createFrom().item(identity);
      }
      return Uni.createFrom()
          .failure(new AuthenticationFailedException("Authentication is required."));
    }

    String sessionId = jwtPrincipal.getTokenID();
    if (sessionId == null || sessionId.isBlank()) {
      return Uni.createFrom()
          .failure(new AuthenticationFailedException("Authentication is required."));
    }

    Set<String> tokenGroups = new HashSet<>(jwtPrincipal.getGroups());
    boolean hasTokenGroups =
        tokenGroups.stream().anyMatch(group -> group != null && !group.isBlank());

    return userInfoCacheService.getUserInfo(sessionId).onItem().transformToUni(user -> {
      if (user == null) {
        return redisService.getUserInfoByKey(sessionId).onItem().transform(fetchedUser -> {
          ensureValidUserInfo(fetchedUser);
          fetchedUser.setGroups(resolveGroups(hasTokenGroups, tokenGroups, fetchedUser));
          userInfoCache.put(sessionId, fetchedUser);
          return buildIdentity(identity, fetchedUser, hasTokenGroups);
        });
      }

      ensureValidUserInfo(user);
      user.setGroups(resolveGroups(hasTokenGroups, tokenGroups, user));
      userInfoCache.put(sessionId, user);
      return Uni.createFrom().item(buildIdentity(identity, user, hasTokenGroups));
    });
  }

  /**
   * JWT と UserInfo のグループ情報を統合します。
   *
   * @param hasTokenGroups JWT に groups が含まれるかどうか
   * @param tokenGroups JWT から抽出した groups
   * @param user UserInfo
   * @return 有効な group 名
   */
  private Set<String> resolveGroups(boolean hasTokenGroups, Set<String> tokenGroups,
      UserInfo user) {
    if (hasTokenGroups) {
      return new HashSet<>(tokenGroups);
    }
    Set<String> resolved = new HashSet<>();
    if (user != null && user.getGroups() != null) {
      for (String group : user.getGroups()) {
        if (group != null && !group.isBlank()) {
          resolved.add(group);
        }
      }
    }
    return resolved;
  }

  /**
   * UserInfo から SecurityIdentity を組み立てます。
   *
   * @param identity 元の認証情報
   * @param user 認証済みユーザー情報
   * @param hasTokenGroups JWT に groups が含まれるかどうか
   * @return 拡張済み SecurityIdentity
   */
  private SecurityIdentity buildIdentity(SecurityIdentity identity, UserInfo user,
      boolean hasTokenGroups) {
    QuarkusSecurityIdentity.Builder builder = QuarkusSecurityIdentity.builder(identity);
    builder.addAttribute("companyId", user.getCompanyId());
    builder.addAttribute("email", user.getEmail());
    builder.addAttribute("userId", user.getUserId());
    builder.addAttribute("name", user.getName());
    builder.addAttribute("groups",
        List.copyOf(user.getGroups() != null ? user.getGroups() : Set.of()));
    builder.addAttribute("userInfo", user);
    applyRoles(builder, hasTokenGroups, user.getGroups());
    return builder.build();
  }

  /**
   * JWT に groups が含まれない場合だけロールを追加します。
   *
   * @param builder SecurityIdentity の builder
   * @param hasTokenGroups JWT に groups が含まれるかどうか
   * @param groups 追加対象のロール
   */
  private void applyRoles(QuarkusSecurityIdentity.Builder builder, boolean hasTokenGroups,
      Set<String> groups) {
    if (hasTokenGroups || groups == null || groups.isEmpty()) {
      return;
    }
    for (String group : groups) {
      if (group != null && !group.isBlank()) {
        builder.addRole(group);
      }
    }
  }

  /**
   * RLS に必要な companyId の有無を検証します。
   *
   * @param user UserInfo
   */
  private void ensureValidUserInfo(UserInfo user) {
    if (user == null || user.getCompanyId() == null || user.getCompanyId().isBlank()) {
      throw new AuthenticationFailedException("Authentication is required.");
    }
  }
}
