package com.cxisystem.feature.mail;

/**
 * メール送信抽象。 本番ではSMTPや外部サービスへ差し替える。
 */
public interface MailSender {

  void sendInvite(String toEmail, String inviteUrl);

  void sendPasswordReset(String toEmail, String resetUrl);
}
