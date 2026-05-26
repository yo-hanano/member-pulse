package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.SchoolFilterInput;
import com.cxisystem.feature.service.SchoolService;
import com.cxisystem.feature.type.School;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 学校マスタを公開する GraphQL エントリポイントです。 CSV 同期前提の検索 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class SchoolResolver extends AbstractResolver {

  @Inject
  SchoolService schoolService;

  /** 条件付きの学校一覧をページ形式で返します。 */
  @Query("schoolPagination")
  @RolesAllowed("admin")
  public Page<School> getSchoolPagination(@Valid Pagination pagination,
      @Valid SchoolFilterInput filter) {
    return schoolService.pagination(pagination, filter);
  }

  /** 学校コードで学校 1 件を取得します。 */
  @Query("schoolByCode")
  @RolesAllowed("admin")
  public School getSchoolByCode(@NotNull String schoolCode) {
    return schoolService.findById(schoolCode);
  }
}
