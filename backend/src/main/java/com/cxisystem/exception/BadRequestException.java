package com.cxisystem.exception;

import io.smallrye.graphql.api.ErrorCode;

@ErrorCode("BAD_REQUEST")
public class BadRequestException extends RuntimeException {

  /** BAD_REQUEST として返す例外を生成します。 */
  public BadRequestException(String message) {
    super(message);
  }
}
