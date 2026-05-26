package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.RelationshipService;
import com.cxisystem.feature.type.Relationship;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 続柄マスタを公開する GraphQL エントリポイントです。 保護者フォームで使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class RelationshipResolver extends AbstractResolver {

  @Inject
  RelationshipService relationshipService;

  /**
   * 続柄一覧を返します。
   *
   * @return 続柄一覧
   */
  @Query("allRelationships")
  public List<Relationship> getAllRelationships() {
    return relationshipService.findAll();
  }
}
