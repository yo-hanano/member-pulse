package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.BranchFilterInput;
import com.cxisystem.feature.input.BranchInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.service.AreaService;
import com.cxisystem.feature.service.BranchService;
import com.cxisystem.feature.service.PrefectureService;
import com.cxisystem.feature.type.Area;
import com.cxisystem.feature.type.Branch;
import com.cxisystem.feature.type.Prefecture;
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
 * 拠点管理画面向けの GraphQL エントリポイントです。 管理者向けの CRUD に加えて、関連するエリアと都道府県の dataloader
 * を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class BranchResolver extends AbstractResolver {

  @Inject
  BranchService branchService;

  @Inject
  AreaService areaService;

  @Inject
  PrefectureService prefectureService;

  /** すべての拠点を返します。 */
  @Query("allBranches")
  @RolesAllowed("admin")
  public List<Branch> getAllBranches() {
    return branchService.findAll();
  }

  /** 条件付きの拠点一覧をページ形式で返します。 */
  @Query("branchPagination")
  @RolesAllowed("admin")
  public Page<Branch> getBranchPagination(@Valid Pagination pagination,
      @Valid BranchFilterInput filter) {
    return branchService.pagination(pagination, filter);
  }

  /** ID で拠点 1 件を取得します。 */
  @Query("branchById")
  @RolesAllowed("admin")
  public Branch getBranchById(@NotNull String branchId) {
    return branchService.findById(branchId);
  }

  /** 拠点を新規作成します。 */
  @Mutation("createBranch")
  @RolesAllowed("admin")
  public Branch createBranch(@Valid BranchInput input) {
    return branchService.create(input);
  }

  /** 拠点を更新します。 */
  @Mutation("updateBranch")
  @RolesAllowed("admin")
  public Branch updateBranch(@NotNull String branchId, @Valid BranchInput input) {
    return branchService.update(branchId, input);
  }

  /** 拠点を論理削除します。 */
  @Mutation("deleteBranch")
  @RolesAllowed("admin")
  public boolean deleteBranch(@NotNull String branchId) {
    return branchService.deleteBranch(branchId);
  }

  /** 拠点一覧に紐づくエリアをまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Area>> area(@Source List<Branch> branches) {
    return vtSupplyAsync(() -> {
      Set<String> areaIds = branches.stream().map(Branch::getAreaId).filter(Objects::nonNull)
          .collect(Collectors.toSet());

      List<Area> areaList = areaService.findByIds(areaIds);
      Map<String, Area> areaMap =
          areaList.stream().collect(Collectors.toMap(Area::getId, area -> area));

      return branches.stream().map(branch -> areaMap.get(branch.getAreaId())).toList();
    });
  }

  /** 拠点一覧に紐づく都道府県をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Prefecture>> prefecture(@Source List<Branch> branches) {
    return vtSupplyAsync(() -> {
      Set<String> prefectureCodes = branches.stream().map(Branch::getPrefectureCode)
          .filter(Objects::nonNull).collect(Collectors.toSet());

      List<Prefecture> prefectureList = prefectureService.findByCodes(prefectureCodes);
      Map<String, Prefecture> prefectureMap = prefectureList.stream()
          .collect(Collectors.toMap(Prefecture::getCode, prefecture -> prefecture));

      return branches.stream().map(branch -> prefectureMap.get(branch.getPrefectureCode()))
          .toList();
    });
  }
}
