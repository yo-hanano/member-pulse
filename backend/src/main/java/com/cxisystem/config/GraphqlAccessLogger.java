package com.cxisystem.config;

import io.quarkus.runtime.Startup;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jboss.logging.Logger;

/**
 * /graphql へのアクセスを軽量に記録します。 監査というより、運用時のデバッグ向けの補助ログです。
 */
@Startup
@ApplicationScoped
public class GraphqlAccessLogger {

  private static final Logger LOG = Logger.getLogger(GraphqlAccessLogger.class);
  private static final Pattern OP_TYPE = Pattern.compile("\\b(query|mutation|subscription)\\b");
  private static final Pattern OP_NAME =
      Pattern.compile("\\b(query|mutation|subscription)\\s+([A-Za-z0-9_]+)");

  @Inject
  Router router;

  /** GraphQL ルートにログ用ハンドラを登録します。 */
  @PostConstruct
  void register() {
    Route bodyRoute = router.route("/graphql");
    bodyRoute.order(Integer.MIN_VALUE);
    bodyRoute.handler(BodyHandler.create());

    Route logRoute = router.route("/graphql");
    logRoute.order(Integer.MIN_VALUE + 1);
    logRoute.handler(this::logGraphql);
  }

  /**
   * GraphQL リクエストのアクセスログを出します。
   *
   * @param ctx RoutingContext
   */
  void logGraphql(RoutingContext ctx) {
    if (ctx.request().method() != HttpMethod.POST) {
      ctx.next();
      return;
    }

    final long startedAt = System.nanoTime();
    ctx.addBodyEndHandler(v -> {
      long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
      String reqId = ctx.request().getHeader("x-request-id");
      String body = ctx.body() != null ? ctx.body().asString() : null;
      LOG.info(buildMessage(body, elapsedMs, reqId));
    });
    ctx.next();
  }

  /**
   * ログ表示用メッセージを組み立てます。
   *
   * @param body GraphQL body
   * @param elapsedMs 経過時間
   * @param reqId リクエストID
   * @return ログメッセージ
   */
  private String buildMessage(String body, long elapsedMs, String reqId) {
    String requestId = reqId == null || reqId.isBlank() ? "-" : reqId;
    if (body == null || body.isBlank()) {
      return String.format("GraphQL op=unknown elapsed=%dms reqId=%s", elapsedMs, requestId);
    }
    try {
      String trimmed = body.trim();
      if (trimmed.startsWith("[")) {
        JsonArray array = new JsonArray(trimmed);
        int count = array.size();
        JsonObject first = count > 0 ? array.getJsonObject(0) : null;
        String opInfo = extractOpInfo(first);
        return String.format("GraphQL batch=%d %s elapsed=%dms reqId=%s", count, opInfo, elapsedMs,
            requestId);
      }
      JsonObject json = new JsonObject(trimmed);
      String opInfo = extractOpInfo(json);
      return String.format("GraphQL %s elapsed=%dms reqId=%s", opInfo, elapsedMs, requestId);
    } catch (Exception exception) {
      return String.format("GraphQL op=unparsed elapsed=%dms reqId=%s", elapsedMs, requestId);
    }
  }

  /**
   * GraphQL body から operation 情報を抽出します。
   *
   * @param json JSON body
   * @return operation の表示文字列
   */
  private String extractOpInfo(JsonObject json) {
    if (json == null) {
      return "op=unknown";
    }
    String operationName = json.getString("operationName");
    String query = json.getString("query");
    String type = extractType(query);
    String name = operationName != null ? operationName : extractName(query);
    if (type == null && name == null) {
      return "op=unknown";
    }
    if (type == null) {
      return "op=" + name;
    }
    if (name == null) {
      return "op=" + type;
    }
    return "op=" + type + ":" + name;
  }

  /**
   * クエリ文字列から operation 種別を抽出します。
   *
   * @param query GraphQL query
   * @return operation 種別
   */
  private String extractType(String query) {
    if (query == null) {
      return null;
    }
    Matcher matcher = OP_TYPE.matcher(query);
    return matcher.find() ? matcher.group(1) : null;
  }

  /**
   * クエリ文字列から operation 名を抽出します。
   *
   * @param query GraphQL query
   * @return operation 名
   */
  private String extractName(String query) {
    if (query == null) {
      return null;
    }
    Matcher matcher = OP_NAME.matcher(query);
    return matcher.find() ? matcher.group(2) : null;
  }
}
