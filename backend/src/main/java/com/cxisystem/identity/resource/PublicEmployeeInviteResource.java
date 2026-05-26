package com.cxisystem.identity.resource;

import com.cxisystem.feature.dto.PublicInviteCompleteResponse;
import com.cxisystem.feature.dto.PublicInviteVerifyResponse;
import com.cxisystem.feature.service.EmployeeInviteService;
import com.cxisystem.identity.request.PublicInviteCompleteRequest;
import com.cxisystem.identity.request.PublicInviteVerifyRequest;
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
 * 公開招待API。 token 検証と初回パスワード設定を GraphQL から分離して未認証 REST に置く。
 */
@Path("/public/employee/invite")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PublicEmployeeInviteResource {

  @Inject
  EmployeeInviteService inviteService;

  @Inject
  RateLimitService rateLimitService;

  @POST
  @Path("/verify")
  public PublicInviteVerifyResponse verify(@Valid PublicInviteVerifyRequest request,
      @Context HttpServerRequest serverRequest) {
    String clientIp = resolveClientIp(serverRequest);
    if (!rateLimitService.allowInviteVerify(request.getToken(), clientIp)) {
      throw new WebApplicationException("rate limit exceeded", Response.Status.TOO_MANY_REQUESTS);
    }
    try {
      EmployeeInviteService.InviteTokenInfo info =
          inviteService.verifyInviteToken(request.getToken());
      return new PublicInviteVerifyResponse(info.email(), info.expiresAt());
    } catch (IllegalArgumentException exception) {
      throw new WebApplicationException("invalid invite token", Response.Status.BAD_REQUEST);
    }
  }

  @POST
  @Path("/complete")
  public PublicInviteCompleteResponse complete(@Valid PublicInviteCompleteRequest request,
      @Context HttpServerRequest serverRequest) {
    String clientIp = resolveClientIp(serverRequest);
    if (!rateLimitService.allowInviteComplete(request.getToken(), clientIp)) {
      throw new WebApplicationException("rate limit exceeded", Response.Status.TOO_MANY_REQUESTS);
    }
    try {
      String employeeId =
          inviteService.completeInvite(request.getToken(), request.getNewPassword());
      return new PublicInviteCompleteResponse(employeeId);
    } catch (IllegalArgumentException exception) {
      throw new WebApplicationException("invalid invite token", Response.Status.BAD_REQUEST);
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
