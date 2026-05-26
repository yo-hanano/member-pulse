package com.cxisystem.exception;

import io.smallrye.graphql.api.ErrorCode;

/**
 * 現在のパスワード検証に失敗したことを表す例外です。 GraphQL 側で専用エラーコードとして扱います。
 */
@ErrorCode("INVALID_PASSWORD")
public class InvalidPasswordException extends RuntimeException {

  /**
   * 例外を生成します。
   *
   * @param message エラーメッセージ
   */
  public InvalidPasswordException(String message) {
    super(message);
  }
}
