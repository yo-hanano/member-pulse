package com.cxisystem.exception;

import io.smallrye.graphql.api.ErrorCode;

@ErrorCode("NOT_FOUND")
public class NotFoundException extends RuntimeException {

  /** NOT_FOUND として返す例外を生成します。 */
  public NotFoundException(String message) {
    super(message);
  }
}
