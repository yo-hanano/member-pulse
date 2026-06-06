package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.MembershipPlanService;
import com.cxisystem.feature.type.MembershipPlan;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 月額プラン向けの GraphQL エントリポイントです。入会処理のコース選択で利用します。
 */
@RunOnVirtualThread
@GraphQLApi
public class MembershipPlanResolver extends AbstractResolver {

  @Inject
  MembershipPlanService membershipPlanService;

  /** 募集中の月額プラン一覧を表示順で返します。 */
  @Query("activeMembershipPlans")
  @RolesAllowed("admin")
  public List<MembershipPlan> getActiveMembershipPlans() {
    return membershipPlanService.findActivePlans();
  }
}
