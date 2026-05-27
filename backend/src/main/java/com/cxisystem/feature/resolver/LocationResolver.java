package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.LocationFilterInput;
import com.cxisystem.feature.input.LocationInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.service.AreaService;
import com.cxisystem.feature.service.LocationService;
import com.cxisystem.feature.service.PrefectureService;
import com.cxisystem.feature.type.Area;
import com.cxisystem.feature.type.Location;
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
 * 拠点管理画面向けの GraphQL エントリポイントです。 拠点 CRUD と関連するエリア、都道府県の解決を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class LocationResolver extends AbstractResolver {

  @Inject
  LocationService locationService;

  @Inject
  AreaService areaService;

  @Inject
  PrefectureService prefectureService;

  /** すべての拠点を返します。 */
  @Query("allLocations")
  @RolesAllowed("admin")
  public List<Location> getAllLocations() {
    return locationService.findAll();
  }

  /** 条件付きの拠点一覧をページ形式で返します。 */
  @Query("locationPagination")
  @RolesAllowed("admin")
  public Page<Location> getLocationPagination(@Valid Pagination pagination,
      @Valid LocationFilterInput filter) {
    return locationService.pagination(pagination, filter);
  }

  /** ID で拠点 1 件を取得します。 */
  @Query("locationById")
  @RolesAllowed("admin")
  public Location getLocationById(@NotNull String locationId) {
    return locationService.findById(locationId);
  }

  /** 拠点を新規作成します。 */
  @Mutation("createLocation")
  @RolesAllowed("admin")
  public Location createLocation(@Valid LocationInput input) {
    return locationService.create(input);
  }

  /** 拠点を更新します。 */
  @Mutation("updateLocation")
  @RolesAllowed("admin")
  public Location updateLocation(@NotNull String locationId, @Valid LocationInput input) {
    return locationService.update(locationId, input);
  }

  /** 拠点を論理削除します。 */
  @Mutation("deleteLocation")
  @RolesAllowed("admin")
  public boolean deleteLocation(@NotNull String locationId) {
    return locationService.deleteLocation(locationId);
  }

  /** 拠点一覧に紐づくエリアをまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Area>> area(@Source List<Location> locations) {
    return vtSupplyAsync(() -> {
      Set<String> areaIds = locations.stream().map(Location::getAreaId).filter(Objects::nonNull)
          .collect(Collectors.toSet());
      List<Area> areaList = areaService.findByIds(areaIds);
      Map<String, Area> areaMap =
          areaList.stream().collect(Collectors.toMap(Area::getId, area -> area));
      return locations.stream().map(location -> areaMap.get(location.getAreaId())).toList();
    });
  }

  /** 拠点一覧に紐づく都道府県をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Prefecture>> prefecture(@Source List<Location> locations) {
    return vtSupplyAsync(() -> {
      Set<String> prefectureCodes = locations.stream().map(Location::getPrefectureCode)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      List<Prefecture> prefectureList = prefectureService.findByCodes(prefectureCodes);
      Map<String, Prefecture> prefectureMap = prefectureList.stream()
          .collect(Collectors.toMap(Prefecture::getCode, prefecture -> prefecture));
      return locations.stream().map(location -> prefectureMap.get(location.getPrefectureCode()))
          .toList();
    });
  }
}
