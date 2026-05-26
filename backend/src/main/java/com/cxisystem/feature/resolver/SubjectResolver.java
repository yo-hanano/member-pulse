package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.SubjectService;
import com.cxisystem.feature.type.Subject;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 科目マスタ向けの GraphQL エントリポイントです。 コース登録で利用する候補を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class SubjectResolver extends AbstractResolver {

  @Inject
  SubjectService subjectService;

  /** 有効な科目候補を返します。 */
  @Query("subjectOptions")
  @RolesAllowed("admin")
  public List<Subject> getSubjectOptions() {
    return subjectService.findOptions();
  }
}
