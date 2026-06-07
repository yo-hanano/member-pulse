package com.cxisystem.feature.resolver;

import com.cxisystem.feature.input.MembershipSubscriptionInput;
import com.cxisystem.feature.input.MembershipSubscriptionUpdateInput;
import com.cxisystem.feature.service.MembershipPlanService;
import com.cxisystem.feature.service.MembershipSubscriptionService;
import com.cxisystem.feature.type.MembershipPlan;
import com.cxisystem.feature.type.MembershipSubscription;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;

/**
 * コース契約向けの GraphQL エントリポイントです。会員詳細のコース管理タブへ 契約履歴の参照とプラン変更・休会・再開・終了・修正の操作を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class MembershipSubscriptionResolver extends AbstractResolver {

  @Inject
  MembershipSubscriptionService membershipSubscriptionService;

  @Inject
  MembershipPlanService membershipPlanService;

  /** 会員のコース契約履歴を新しい順で返します。 */
  @Query("membershipSubscriptionsByMemberId")
  @RolesAllowed("admin")
  public List<MembershipSubscription> getMembershipSubscriptionsByMemberId(
      @NotNull String memberId) {
    return membershipSubscriptionService.findByMemberId(memberId);
  }

  /** プラン変更を行います。旧契約の終了と新契約の開始を同一トランザクションで処理します。 */
  @Mutation("changeMembershipPlan")
  @RolesAllowed("admin")
  public MembershipSubscription changeMembershipPlan(@NotNull String memberId,
      @NotNull @Valid MembershipSubscriptionInput input) {
    return membershipSubscriptionService.changeMembershipPlan(memberId, input);
  }

  /** 契約を休会にします。 */
  @Mutation("pauseMembershipSubscription")
  @RolesAllowed("admin")
  public MembershipSubscription pauseMembershipSubscription(
      @NotNull String membershipSubscriptionId) {
    return membershipSubscriptionService.pause(membershipSubscriptionId);
  }

  /** 休会中の契約を再開します。 */
  @Mutation("resumeMembershipSubscription")
  @RolesAllowed("admin")
  public MembershipSubscription resumeMembershipSubscription(
      @NotNull String membershipSubscriptionId) {
    return membershipSubscriptionService.resume(membershipSubscriptionId);
  }

  /** 契約を終了日付きで終了します。 */
  @Mutation("endMembershipSubscription")
  @RolesAllowed("admin")
  public MembershipSubscription endMembershipSubscription(@NotNull String membershipSubscriptionId,
      @NotNull LocalDate endDate) {
    return membershipSubscriptionService.end(membershipSubscriptionId, endDate);
  }

  /** 契約の月額とメモを修正します。 */
  @Mutation("updateMembershipSubscription")
  @RolesAllowed("admin")
  public MembershipSubscription updateMembershipSubscription(
      @NotNull String membershipSubscriptionId, @Valid MembershipSubscriptionUpdateInput input) {
    return membershipSubscriptionService.update(membershipSubscriptionId, input);
  }

  /** 契約一覧に紐づく月額プランをまとめて解決します。履歴表示のため削除済みプランも対象にします。 */
  @ActivateRequestContext
  public CompletableFuture<List<MembershipPlan>> membershipPlan(
      @Source List<MembershipSubscription> subscriptions) {
    return vtSupplyAsync(() -> {
      Set<String> planIds = subscriptions.stream().map(MembershipSubscription::getMembershipPlanId)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      List<MembershipPlan> planList = membershipPlanService.findByIdsIncludingDeleted(planIds);
      Map<String, MembershipPlan> planMap =
          planList.stream().collect(Collectors.toMap(MembershipPlan::getId, plan -> plan));
      return subscriptions.stream()
          .map(subscription -> planMap.get(subscription.getMembershipPlanId())).toList();
    });
  }
}
