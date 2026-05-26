package com.cxisystem.feature.mail;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.extern.slf4j.Slf4j;

/**
 * 開発用のメール送信ダミー実装。 実送信はせず、URL をログへ出力する。
 */
@Slf4j
@ApplicationScoped
public class LoggingMailSender implements MailSender {

  /** 招待メール送信の代わりに URL をログへ出力します。 */
  @Override
  public void sendInvite(String toEmail, String inviteUrl) {
    log.info("[MAIL][INVITE] to={}, url={}", toEmail, inviteUrl);
  }

  /** パスワードリセットメール送信の代わりに URL をログへ出力します。 */
  @Override
  public void sendPasswordReset(String toEmail, String resetUrl) {
    log.info("[MAIL][RESET_PASSWORD] to={}, url={}", toEmail, resetUrl);
  }
}
