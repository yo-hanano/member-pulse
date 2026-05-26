package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.AreaFilterInput;
import com.cxisystem.feature.input.AreaInput;
import com.cxisystem.feature.input.AreaOrderInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.service.AreaService;
import com.cxisystem.feature.type.Area;
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
 * エリア管理画面向けの GraphQL エントリポイントです。 管理者向けの一覧、詳細、登録、更新、削除、並び替えを公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class AreaResolver extends AbstractResolver {

  @Inject
  AreaService areaService;

  /** すべてのエリアを返します。 */
  @Query("allAreas")
  @RolesAllowed("admin")
  public List<Area> getAllAreas() {
    return areaService.findAll();
  }

  /** 条件付きのエリア一覧をページ形式で返します。 */
  @Query("areaPagination")
  @RolesAllowed("admin")
  public Page<Area> getAreaPagination(@Valid Pagination pagination, @Valid AreaFilterInput filter) {
    return areaService.pagination(pagination, filter);
  }

  /** ID でエリア 1 件を取得します。 */
  @Query("areaById")
  @RolesAllowed("admin")
  public Area getAreaById(@NotNull String areaId) {
    return areaService.findById(areaId);
  }

  /** エリアを新規作成します。 */
  @Mutation("createArea")
  @RolesAllowed("admin")
  public Area createArea(@Valid AreaInput input) {
    return areaService.create(input);
  }

  /** エリアを更新します。 */
  @Mutation("updateArea")
  @RolesAllowed("admin")
  public Area updateArea(@NotNull String areaId, @Valid AreaInput input) {
    return areaService.update(areaId, input);
  }

  /** エリアを論理削除します。 */
  @Mutation("deleteArea")
  @RolesAllowed("admin")
  public boolean deleteArea(@NotNull String areaId) {
    return areaService.deleteArea(areaId);
  }

  /** エリアの表示順を一括更新します。 */
  @Mutation("updateAreaOrders")
  @RolesAllowed("admin")
  public boolean updateAreaOrders(List<@Valid AreaOrderInput> inputs) {
    return areaService.updateOrders(inputs);
  }
}
