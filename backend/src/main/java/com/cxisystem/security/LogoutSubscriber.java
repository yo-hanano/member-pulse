package com.cxisystem.security;

import io.quarkus.runtime.Startup;
import io.quarkus.runtime.StartupEvent;
import io.vertx.mutiny.redis.client.Command;
import io.vertx.mutiny.redis.client.Redis;
import io.vertx.mutiny.redis.client.RedisConnection;
import io.vertx.mutiny.redis.client.Request;
import io.vertx.mutiny.redis.client.Response;
import io.vertx.redis.client.ResponseType;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis の logout チャネルを購読し、該当セッションのキャッシュを落とします。 複数ノード環境でのログアウト伝播を担う補助コンポーネントです。
 */
@Slf4j
@Startup
@ApplicationScoped
public class LogoutSubscriber {

  private static final String CHANNEL = "logout";

  @Inject
  Redis redis;

  @Inject
  UserInfoCacheService userInfoCacheService;

  private RedisConnection connection;

  /**
   * 起動時に Redis 購読を開始します。
   *
   * @param event 起動イベント
   */
  void onStart(@Observes StartupEvent event) {
    redis.connect().invoke(conn -> {
      connection = conn;
      conn.handler(this::handleMessage);
    }).call(conn -> conn.send(Request.cmd(Command.SUBSCRIBE).arg(CHANNEL))
        .invoke(() -> log.info("Subscribed to Redis channel '{}'", CHANNEL))).subscribe()
        .with(ignore -> {
        }, failure -> log.error("Failed to subscribe to logout channel", failure));
  }

  /**
   * Redis のメッセージを処理します。
   *
   * @param message Redis メッセージ
   */
  private void handleMessage(Response message) {
    log.debug("Received message: type={}, size={}, content={}",
        message != null ? message.type() : null, message != null ? message.size() : null, message);
    if (message == null || message.type() != ResponseType.PUSH || message.size() < 3) {
      return;
    }
    String kind = message.get(0).toString();
    if (!"message".equalsIgnoreCase(kind)) {
      return;
    }
    String sessionId = message.get(2).toString();
    if (sessionId == null || sessionId.isBlank()) {
      return;
    }
    try {
      userInfoCacheService.invalidate(sessionId);
      log.info("Invalidated userInfo cache for sessionId={}", sessionId);
    } catch (Exception exception) {
      log.error("Failed to invalidate userInfo cache for sessionId={}", sessionId, exception);
    }
  }

  /**
   * 起動時に確保した接続を閉じます。
   */
  @PreDestroy
  void onStop() {
    if (connection != null) {
      connection.close().await().indefinitely();
    }
  }
}
