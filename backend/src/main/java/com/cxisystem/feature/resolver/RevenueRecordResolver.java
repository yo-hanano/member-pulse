package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.RevenueSummary;
import com.cxisystem.feature.input.RevenueRecordInput;
import com.cxisystem.feature.service.LocationService;
import com.cxisystem.feature.service.MemberService;
import com.cxisystem.feature.service.RevenueRecordService;
import com.cxisystem.feature.type.Location;
import com.cxisystem.feature.type.Member;
import com.cxisystem.feature.type.RevenueRecord;
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
 * 売上台帳向けの GraphQL エントリポイントです。売上画面へ月別一覧・サマリ・手入力 CRUD・ 月謝自動生成を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class RevenueRecordResolver extends AbstractResolver {

  @Inject
  RevenueRecordService revenueRecordService;

  @Inject
  MemberService memberService;

  @Inject
  LocationService locationService;

  /** 対象月（任意で拠点も）の売上明細を売上日降順で返します。 */
  @Query("revenueRecordsByMonth")
  @RolesAllowed("admin")
  public List<RevenueRecord> getRevenueRecordsByMonth(@NotNull LocalDate targetMonth,
      String locationId) {
    return revenueRecordService.findByMonth(targetMonth, locationId);
  }

  /** 対象月の売上サマリ（売上合計・MRR・平均月謝・月謝件数）を返します。 */
  @Query("revenueSummary")
  @RolesAllowed("admin")
  public RevenueSummary getRevenueSummary(@NotNull LocalDate targetMonth, String locationId) {
    return revenueRecordService.summary(targetMonth, locationId);
  }

  /** 手入力の売上明細を新規作成します。 */
  @Mutation("createRevenueRecord")
  @RolesAllowed("admin")
  public RevenueRecord createRevenueRecord(@Valid RevenueRecordInput input) {
    return revenueRecordService.create(input);
  }

  /** 売上明細を更新します。 */
  @Mutation("updateRevenueRecord")
  @RolesAllowed("admin")
  public RevenueRecord updateRevenueRecord(@NotNull String revenueRecordId,
      @Valid RevenueRecordInput input) {
    return revenueRecordService.update(revenueRecordId, input);
  }

  /** 売上明細を論理削除します。 */
  @Mutation("deleteRevenueRecord")
  @RolesAllowed("admin")
  public boolean deleteRevenueRecord(@NotNull String revenueRecordId) {
    return revenueRecordService.deleteRevenueRecord(revenueRecordId);
  }

  /** 対象月の月謝売上を契約から自動生成し、作成件数を返します。再実行しても重複しません。 */
  @Mutation("generateMembershipFeeRevenues")
  @RolesAllowed("admin")
  public int generateMembershipFeeRevenues(@NotNull LocalDate targetMonth) {
    return revenueRecordService.generateMembershipFees(targetMonth);
  }

  /** 売上一覧に紐づく会員をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Member>> member(@Source List<RevenueRecord> revenueRecords) {
    return vtSupplyAsync(() -> {
      Set<String> memberIds = revenueRecords.stream().map(RevenueRecord::getMemberId)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      List<Member> memberList = memberService.findByIds(memberIds);
      Map<String, Member> memberMap =
          memberList.stream().collect(Collectors.toMap(Member::getId, member -> member));
      return revenueRecords.stream()
          .map(revenueRecord -> memberMap.get(revenueRecord.getMemberId())).toList();
    });
  }

  /** 売上一覧に紐づく拠点をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Location>> location(@Source List<RevenueRecord> revenueRecords) {
    return vtSupplyAsync(() -> {
      Set<String> locationIds = revenueRecords.stream().map(RevenueRecord::getLocationId)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      List<Location> locationList = locationService.findByIds(locationIds);
      Map<String, Location> locationMap =
          locationList.stream().collect(Collectors.toMap(Location::getId, location -> location));
      return revenueRecords.stream()
          .map(revenueRecord -> locationMap.get(revenueRecord.getLocationId())).toList();
    });
  }
}
