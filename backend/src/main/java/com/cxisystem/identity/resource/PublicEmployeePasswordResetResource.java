package com.cxisystem.identity.resource;

import com.cxisystem.feature.dto.PublicPasswordResetResponse;
import com.cxisystem.feature.service.EmployeeInviteService;
import com.cxisystem.identity.request.PublicPasswordResetCompleteRequest;
import com.cxisystem.identity.request.PublicPasswordResetRequest;
import com.cxisystem.security.RateLimitService;
import io.vertx.core.http.HttpServerRequest;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 公開パスワードリセットAPI。 request は存在推測を避けるため常に ok を返す。
 */
@Path("/public/employee/password/reset")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PublicEmployeePasswordResetResource {

  @Inject
  EmployeeInviteService inviteService;

  @Inject
  RateLimitService rateLimitService;

  @POST
  @Path("/request")
  public PublicPasswordResetResponse request(@Valid PublicPasswordResetRequest request,
      @Context HttpServerRequest serverRequest) {
    String clientIp = resolveClientIp(serverRequest);
    if (!rateLimitService.allowResetRequest(clientIp)) {
      throw new WebApplicationException("rate limit exceeded", Response.Status.TOO_MANY_REQUESTS);
    }
    inviteService.requestPasswordReset(request.getEmail(), request.getCompanyCode());
    return new PublicPasswordResetResponse(true);
  }

  @POST
  @Path("/complete")
  public PublicPasswordResetResponse complete(@Valid PublicPasswordResetCompleteRequest request,
      @Context HttpServerRequest serverRequest) {
    String clientIp = resolveClientIp(serverRequest);
    if (!rateLimitService.allowResetComplete(request.getToken(), clientIp)) {
      throw new WebApplicationException("rate limit exceeded", Response.Status.TOO_MANY_REQUESTS);
    }
    try {
      inviteService.completePasswordReset(request.getToken(), request.getNewPassword());
      return new PublicPasswordResetResponse(true);
    } catch (IllegalArgumentException exception) {
      throw new WebApplicationException("invalid reset token", Response.Status.BAD_REQUEST);
    }
  }

  private String resolveClientIp(HttpServerRequest serverRequest) {
    if (serverRequest == null) {
      return "unknown";
    }
    String forwarded = serverRequest.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return serverRequest.remoteAddress() != null ? serverRequest.remoteAddress().host() : "unknown";
  }
}
