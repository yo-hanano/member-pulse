package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.SchoolTypeService;
import com.cxisystem.feature.type.SchoolType;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 学校種マスタを公開する GraphQL エントリポイントです。 学校選択肢表示で使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class SchoolTypeResolver extends AbstractResolver {

  @Inject
  SchoolTypeService schoolTypeService;

  /**
   * 学校種一覧を返します。
   *
   * @return 学校種一覧
   */
  @Query("allSchoolTypes")
  public List<SchoolType> getAllSchoolTypes() {
    return schoolTypeService.findAll();
  }
}
