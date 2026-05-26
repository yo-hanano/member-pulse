package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.SchoolGradeService;
import com.cxisystem.feature.type.SchoolGrade;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 学年マスタを公開する GraphQL エントリポイントです。 生徒や講師フォームで使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class SchoolGradeResolver extends AbstractResolver {

  @Inject
  SchoolGradeService schoolGradeService;

  /**
   * 学年一覧を返します。
   *
   * @return 学年一覧
   */
  @Query("allSchoolGrades")
  public List<SchoolGrade> getAllSchoolGrades() {
    return schoolGradeService.findAll();
  }
}
