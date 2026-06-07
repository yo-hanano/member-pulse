package com.cxisystem.feature.resolver;

import com.cxisystem.feature.input.MembershipPlanInput;
import com.cxisystem.feature.service.MembershipPlanService;
import com.cxisystem.feature.type.MembershipPlan;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;

/**
 * 月額プラン向けの GraphQL エントリポイントです。マスタ管理の CRUD と入会処理のコース選択を公開します。
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

  /** 停止中も含む全プラン一覧を表示順で返します。 */
  @Query("allMembershipPlans")
  @RolesAllowed("admin")
  public List<MembershipPlan> getAllMembershipPlans() {
    return membershipPlanService.findAllPlans();
  }

  /** 月額プランを新規作成します。 */
  @Mutation("createMembershipPlan")
  @RolesAllowed("admin")
  public MembershipPlan createMembershipPlan(@Valid MembershipPlanInput input) {
    return membershipPlanService.create(input);
  }

  /** 月額プランを更新します。 */
  @Mutation("updateMembershipPlan")
  @RolesAllowed("admin")
  public MembershipPlan updateMembershipPlan(@NotNull String membershipPlanId,
      @Valid MembershipPlanInput input) {
    return membershipPlanService.update(membershipPlanId, input);
  }

  /** 月額プランを論理削除します。 */
  @Mutation("deleteMembershipPlan")
  @RolesAllowed("admin")
  public boolean deleteMembershipPlan(@NotNull String membershipPlanId) {
    return membershipPlanService.deleteMembershipPlan(membershipPlanId);
  }
}
