package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.PrefectureService;
import com.cxisystem.feature.type.Prefecture;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 都道府県マスタを公開する GraphQL エントリポイントです。 拠点フォームなどの選択肢表示で使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class PrefectureResolver extends AbstractResolver {

  @Inject
  PrefectureService prefectureService;

  /**
   * 都道府県一覧を返します。
   *
   * @return 都道府県一覧
   */
  @Query("allPrefectures")
  public List<Prefecture> getAllPrefectures() {
    return prefectureService.findAll();
  }
}
