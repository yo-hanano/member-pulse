package com.cxisystem.identity.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 招待トークン検証リクエスト。
 */
@NoArgsConstructor
@Data
public class PublicInviteVerifyRequest {

  @NotBlank private String token;
}
