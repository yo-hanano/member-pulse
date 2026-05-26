package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.Company.COMPANY;
import static com.cxisystem.jooq.tables.Employee.EMPLOYEE;
import static com.cxisystem.jooq.tables.EmployeeToken.EMPLOYEE_TOKEN;

import com.cxisystem.annotation.Rls;
import com.cxisystem.feature.dto.EmployeeInviteResult;
import com.cxisystem.feature.enumeration.EmployeeStatus;
import com.cxisystem.feature.enumeration.EmployeeTokenType;
import com.cxisystem.feature.mail.MailSender;
import com.cxisystem.feature.util.AuthContextUtil;
import com.cxisystem.feature.util.PasswordUtil;
import com.cxisystem.feature.util.TokenUtil;
import com.cxisystem.jooq.tables.records.EmployeeRecord;
import com.cxisystem.jooq.tables.records.EmployeeTokenRecord;
import io.quarkus.security.ForbiddenException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jooq.Condition;
import org.jooq.DSLContext;

/**
 * employee 招待・初回パスワード設定・パスワードリセットを扱うサービス。
 * 公開API向けトークン検証/消費と、管理画面向け招待発行を一箇所へ集約する。
 */
@Slf4j
@ApplicationScoped
public class EmployeeInviteService {

  @Inject
  DSLContext dsl;

  @Inject
  MailSender mailSender;

  @Inject
  SecurityIdentity identity;

  @ConfigProperty(name = "app.frontend.base-url", defaultValue = "http://localhost:5173")
  String frontendBaseUrl;

  @ConfigProperty(name = "app.employee-token.invite-ttl", defaultValue = "PT48H")
  Duration inviteTtl;

  @ConfigProperty(name = "app.employee-token.reset-ttl", defaultValue = "PT15M")
  Duration resetTtl;

  /** 管理画面から employee 招待を発行し、招待 URL を返します。 */
  @Rls
  @Transactional
  public EmployeeInviteResult issueInvite(String email) {
    if (!identity.getRoles().contains("admin")) {
      throw new ForbiddenException("admin role required");
    }

    String inviterId = AuthContextUtil.getCurrentUserId();
    if (inviterId == null || inviterId.isBlank()) {
      throw new IllegalStateException("inviterId is empty");
    }

    EmployeeRecord employee = findOrCreateEmployee(email);
    OffsetDateTime now = OffsetDateTime.now();
    revokeExistingInviteTokens(employee.getId(), now);

    String rawToken = TokenUtil.generateToken();
    String tokenHash = TokenUtil.hashToken(rawToken);
    OffsetDateTime expiresAt = now.plus(inviteTtl);

    EmployeeTokenRecord tokenRecord = dsl.newRecord(EMPLOYEE_TOKEN);
    tokenRecord.setEmployeeId(employee.getId());
    tokenRecord.setEmployeeCompanyId(employee.getCompanyId());
    tokenRecord.setType(EmployeeTokenType.INVITE.value());
    tokenRecord.setTokenHash(tokenHash);
    tokenRecord.setExpiresAt(expiresAt);
    tokenRecord.setCreatedByEmployeeId(inviterId);
    tokenRecord.store();

    String inviteUrl = buildInviteUrl(rawToken);
    mailSender.sendInvite(employee.getEmail(), inviteUrl);

    log.info("Invite issued: inviterId={}, employeeId={}, email={}", inviterId, employee.getId(),
        employee.getEmail());
    return new EmployeeInviteResult(employee.getId(), employee.getEmail(), inviteUrl,
        expiresAt.toInstant());
  }

  /** 公開招待トークンを検証し、画面表示に必要な情報を返します。 */
  @Transactional
  public InviteTokenInfo verifyInviteToken(String rawToken) {
    EmployeeTokenRecord tokenRecord = fetchValidInviteToken(rawToken);
    setRlsCompanyIdFromToken(tokenRecord.getId(), "invalid invite token");
    EmployeeRecord employee = fetchEmployeeById(tokenRecord.getEmployeeId())
        .orElseThrow(() -> new IllegalArgumentException("invalid invite token"));
    return new InviteTokenInfo(employee.getId(), employee.getEmail(),
        tokenRecord.getExpiresAt().toInstant());
  }

  /** 招待トークンを消費して初回パスワード設定を完了します。 */
  @Transactional
  public String completeInvite(String rawToken, String newPassword) {
    OffsetDateTime now = OffsetDateTime.now();
    EmployeeTokenRecord tokenRecord = fetchValidInviteTokenForUpdate(rawToken, now);
    setRlsCompanyIdFromToken(tokenRecord.getId(), "invalid invite token");
    EmployeeRecord employee = fetchEmployeeByIdForUpdate(tokenRecord.getEmployeeId())
        .orElseThrow(() -> new IllegalArgumentException("invalid invite token"));

    employee.setPassword(PasswordUtil.hash(newPassword));
    employee.setStatus(EmployeeStatus.ACTIVE.value());
    employee.setPasswordSetAt(LocalDateTime.now());
    employee.store();

    tokenRecord.setUsedAt(now);
    tokenRecord.store();
    return employee.getId();
  }

  /** 指定 employee へパスワードリセット URL を発行します。 */
  @Transactional
  public void requestPasswordReset(String email, String companyCode) {
    String companyId = resolveCompanyIdByCode(companyCode);
    if (companyId == null || companyId.isBlank()) {
      log.info("Password reset requested but company not found: code={}", companyCode);
      return;
    }

    dsl.execute("select set_config('app.current_company_id', ?, true)", companyId);
    EmployeeRecord employee =
        dsl.selectFrom(EMPLOYEE).where(EMPLOYEE.EMAIL.eq(email).and(EMPLOYEE.IS_DELETED.isFalse()))
            .fetchOptional().orElse(null);
    if (employee == null || !EmployeeStatus.ACTIVE.value().equals(employee.getStatus())) {
      log.info("Password reset requested but employee not active or not found: email={}", email);
      return;
    }

    OffsetDateTime now = OffsetDateTime.now();
    revokeExistingTokens(employee.getId(), EmployeeTokenType.RESET_PASSWORD, now);

    String rawToken = TokenUtil.generateToken();
    String tokenHash = TokenUtil.hashToken(rawToken);
    OffsetDateTime expiresAt = now.plus(resetTtl);

    EmployeeTokenRecord tokenRecord = dsl.newRecord(EMPLOYEE_TOKEN);
    tokenRecord.setEmployeeId(employee.getId());
    tokenRecord.setEmployeeCompanyId(employee.getCompanyId());
    tokenRecord.setType(EmployeeTokenType.RESET_PASSWORD.value());
    tokenRecord.setTokenHash(tokenHash);
    tokenRecord.setExpiresAt(expiresAt);
    tokenRecord.store();

    String resetUrl = buildResetUrl(rawToken);
    mailSender.sendPasswordReset(employee.getEmail(), resetUrl);
    log.info("Password reset issued: employeeId={}, email={}", employee.getId(),
        employee.getEmail());
  }

  /** リセットトークンを消費してパスワード再設定を完了します。 */
  @Transactional
  public String completePasswordReset(String rawToken, String newPassword) {
    OffsetDateTime now = OffsetDateTime.now();
    EmployeeTokenRecord tokenRecord = fetchValidResetTokenForUpdate(rawToken, now);
    setRlsCompanyIdFromToken(tokenRecord.getId(), "invalid reset token");
    EmployeeRecord employee = fetchEmployeeByIdForUpdate(tokenRecord.getEmployeeId())
        .orElseThrow(() -> new IllegalArgumentException("invalid reset token"));

    employee.setPassword(PasswordUtil.hash(newPassword));
    employee.setPasswordSetAt(LocalDateTime.now());
    employee.store();

    tokenRecord.setUsedAt(now);
    tokenRecord.store();
    log.info("Password reset completed: employeeId={}", employee.getId());
    return employee.getId();
  }

  /** 招待対象の employee を取得し、なければ新規作成します。 */
  private EmployeeRecord findOrCreateEmployee(String email) {
    EmployeeRecord existing =
        dsl.selectFrom(EMPLOYEE).where(EMPLOYEE.EMAIL.eq(email).and(EMPLOYEE.IS_DELETED.isFalse()))
            .fetchOptional().orElse(null);
    if (existing != null) {
      existing.setStatus(EmployeeStatus.INVITED.value());
      existing.store();
      return existing;
    }

    EmployeeRecord employee = dsl.newRecord(EMPLOYEE);
    employee.setEmail(email);
    employee.setName(defaultNameFromEmail(email));
    employee.setIsAdmin(false);
    employee.setStatus(EmployeeStatus.INVITED.value());
    employee.setIsDeleted(false);
    employee.store();
    employee.refresh();
    return employee;
  }

  /** 既存の招待トークンを無効化します。 */
  private void revokeExistingInviteTokens(String employeeId, OffsetDateTime now) {
    revokeExistingTokens(employeeId, EmployeeTokenType.INVITE, now);
  }

  /** 指定 employee と種別に対する未使用トークンをまとめて失効します。 */
  private void revokeExistingTokens(String employeeId, EmployeeTokenType type, OffsetDateTime now) {
    dsl.update(EMPLOYEE_TOKEN).set(EMPLOYEE_TOKEN.REVOKED_AT, now)
        .where(EMPLOYEE_TOKEN.EMPLOYEE_ID.eq(employeeId)).and(EMPLOYEE_TOKEN.TYPE.eq(type.value()))
        .and(EMPLOYEE_TOKEN.USED_AT.isNull()).and(EMPLOYEE_TOKEN.REVOKED_AT.isNull())
        .and(EMPLOYEE_TOKEN.EXPIRES_AT.gt(now)).execute();
  }

  /** 有効な招待トークンを 1 件取得します。 */
  private EmployeeTokenRecord fetchValidInviteToken(String rawToken) {
    OffsetDateTime now = OffsetDateTime.now();
    return dsl.selectFrom(EMPLOYEE_TOKEN).where(inviteTokenCondition(rawToken, now)).fetchOptional()
        .orElseThrow(() -> new IllegalArgumentException("invalid invite token"));
  }

  /** 更新ロック付きで有効な招待トークンを取得します。 */
  private EmployeeTokenRecord fetchValidInviteTokenForUpdate(String rawToken, OffsetDateTime now) {
    return dsl.selectFrom(EMPLOYEE_TOKEN).where(inviteTokenCondition(rawToken, now)).forUpdate()
        .fetchOptional().orElseThrow(() -> new IllegalArgumentException("invalid invite token"));
  }

  /** 招待トークン検索用の where 条件を組み立てます。 */
  private Condition inviteTokenCondition(String rawToken, OffsetDateTime now) {
    String tokenHash = TokenUtil.hashToken(rawToken);
    return EMPLOYEE_TOKEN.TOKEN_HASH.eq(tokenHash)
        .and(EMPLOYEE_TOKEN.TYPE.eq(EmployeeTokenType.INVITE.value()))
        .and(EMPLOYEE_TOKEN.USED_AT.isNull()).and(EMPLOYEE_TOKEN.REVOKED_AT.isNull())
        .and(EMPLOYEE_TOKEN.EXPIRES_AT.gt(now));
  }

  /** 更新ロック付きで有効なリセットトークンを取得します。 */
  private EmployeeTokenRecord fetchValidResetTokenForUpdate(String rawToken, OffsetDateTime now) {
    return dsl.selectFrom(EMPLOYEE_TOKEN).where(resetTokenCondition(rawToken, now)).forUpdate()
        .fetchOptional().orElseThrow(() -> new IllegalArgumentException("invalid reset token"));
  }

  /** リセットトークン検索用の where 条件を組み立てます。 */
  private Condition resetTokenCondition(String rawToken, OffsetDateTime now) {
    String tokenHash = TokenUtil.hashToken(rawToken);
    return EMPLOYEE_TOKEN.TOKEN_HASH.eq(tokenHash)
        .and(EMPLOYEE_TOKEN.TYPE.eq(EmployeeTokenType.RESET_PASSWORD.value()))
        .and(EMPLOYEE_TOKEN.USED_AT.isNull()).and(EMPLOYEE_TOKEN.REVOKED_AT.isNull())
        .and(EMPLOYEE_TOKEN.EXPIRES_AT.gt(now));
  }

  /** トークンに紐づく companyId を RLS 用セッションへ設定します。 */
  private void setRlsCompanyIdFromToken(String tokenId, String errorMessage) {
    String companyId = dsl.select(EMPLOYEE_TOKEN.EMPLOYEE_COMPANY_ID).from(EMPLOYEE_TOKEN)
        .where(EMPLOYEE_TOKEN.ID.eq(tokenId)).fetchOptional(EMPLOYEE_TOKEN.EMPLOYEE_COMPANY_ID)
        .orElse(null);
    if (companyId == null || companyId.isBlank()) {
      throw new IllegalArgumentException(errorMessage);
    }
    dsl.execute("select set_config('app.current_company_id', ?, true)", companyId);
  }

  /** company code から companyId を引きます。 */
  private String resolveCompanyIdByCode(String companyCode) {
    if (companyCode == null || companyCode.isBlank()) {
      return null;
    }
    return dsl.select(COMPANY.ID).from(COMPANY)
        .where(COMPANY.CODE.eq(companyCode).and(COMPANY.IS_DELETED.isFalse()))
        .fetchOptional(COMPANY.ID).orElse(null);
  }

  /** employee をロックなしで 1 件取得します。 */
  private Optional<EmployeeRecord> fetchEmployeeById(String employeeId) {
    return dsl.selectFrom(EMPLOYEE).where(EMPLOYEE.ID.eq(employeeId)).fetchOptional();
  }

  /** employee を更新ロック付きで 1 件取得します。 */
  private Optional<EmployeeRecord> fetchEmployeeByIdForUpdate(String employeeId) {
    return dsl.selectFrom(EMPLOYEE).where(EMPLOYEE.ID.eq(employeeId)).forUpdate().fetchOptional();
  }

  /** 招待画面へ遷移する URL を組み立てます。 */
  private String buildInviteUrl(String rawToken) {
    String baseUrl =
        frontendBaseUrl.endsWith("/") ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
            : frontendBaseUrl;
    return baseUrl + "/recovery/invite?token=" + rawToken;
  }

  /** パスワード再設定画面へ遷移する URL を組み立てます。 */
  private String buildResetUrl(String rawToken) {
    String baseUrl =
        frontendBaseUrl.endsWith("/") ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
            : frontendBaseUrl;
    return baseUrl + "/recovery/reset-password?token=" + rawToken;
  }

  /** email から初期表示用の名前を作ります。 */
  private String defaultNameFromEmail(String email) {
    int atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
  }

  /** 招待トークン検証結果として返す値オブジェクトです。 */
  public record InviteTokenInfo(String employeeId, String email, Instant expiresAt) {}
}
