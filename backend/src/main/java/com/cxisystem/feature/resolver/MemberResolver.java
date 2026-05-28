package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.MemberFilterInput;
import com.cxisystem.feature.input.MemberInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.service.LeadService;
import com.cxisystem.feature.service.LocationService;
import com.cxisystem.feature.service.MemberService;
import com.cxisystem.feature.type.Lead;
import com.cxisystem.feature.type.Location;
import com.cxisystem.feature.type.Member;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
 * 会員管理画面向けの GraphQL エントリポイントです。基本情報 CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class MemberResolver extends AbstractResolver {

  @Inject
  MemberService memberService;

  @Inject
  LocationService locationService;

  @Inject
  LeadService leadService;

  /** すべての会員を返します。 */
  @Query("allMembers")
  @RolesAllowed("admin")
  public List<Member> getAllMembers() {
    return memberService.findAll();
  }

  /** 条件付きの会員一覧をページ形式で返します。 */
  @Query("memberPagination")
  @RolesAllowed("admin")
  public Page<Member> getMemberPagination(@Valid Pagination pagination,
      @Valid MemberFilterInput filter) {
    return memberService.pagination(pagination, filter);
  }

  /** ID で会員 1 件を取得します。 */
  @Query("memberById")
  @RolesAllowed("admin")
  public Member getMemberById(@NotNull String memberId) {
    return memberService.findById(memberId);
  }

  /** 会員を新規作成します。 */
  @Mutation("createMember")
  @RolesAllowed("admin")
  public Member createMember(@Valid MemberInput input) {
    return memberService.create(input);
  }

  /** 会員を更新します。 */
  @Mutation("updateMember")
  @RolesAllowed("admin")
  public Member updateMember(@NotNull String memberId, @Valid MemberInput input) {
    return memberService.update(memberId, input);
  }

  /** 会員を論理削除します。 */
  @Mutation("deleteMember")
  @RolesAllowed("admin")
  public boolean deleteMember(@NotNull String memberId) {
    return memberService.deleteMember(memberId);
  }

  /** 会員一覧に紐づく拠点をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Location>> location(@Source List<Member> members) {
    return vtSupplyAsync(() -> {
      Set<String> locationIds = members.stream().map(Member::getLocationId).filter(Objects::nonNull)
          .collect(Collectors.toSet());
      List<Location> locationList = locationService.findByIds(locationIds);
      Map<String, Location> locationMap =
          locationList.stream().collect(Collectors.toMap(Location::getId, location -> location));
      return members.stream().map(member -> locationMap.get(member.getLocationId())).toList();
    });
  }

  /** 会員一覧に紐づく変換元リードをまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Lead>> lead(@Source List<Member> members) {
    return vtSupplyAsync(() -> {
      Set<String> leadIds = members.stream().map(Member::getLeadId).filter(Objects::nonNull)
          .collect(Collectors.toSet());
      List<Lead> leadList = leadService.findByIds(leadIds);
      Map<String, Lead> leadMap =
          leadList.stream().collect(Collectors.toMap(Lead::getId, lead -> lead));
      return members.stream().map(member -> leadMap.get(member.getLeadId())).toList();
    });
  }
}
