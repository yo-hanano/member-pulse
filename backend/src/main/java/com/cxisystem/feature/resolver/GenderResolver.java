package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.GenderService;
import com.cxisystem.feature.type.Gender;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 性別マスタを公開する GraphQL エントリポイントです。 生徒や講師フォームで使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class GenderResolver extends AbstractResolver {

  @Inject
  GenderService genderService;

  /**
   * 性別一覧を返します。
   *
   * @return 性別一覧
   */
  @Query("allGenders")
  public List<Gender> getAllGenders() {
    return genderService.findAll();
  }
}
