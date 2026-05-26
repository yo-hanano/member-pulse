package com.cxisystem.feature.resolver;

import com.cxisystem.feature.input.LessonPeriodInput;
import com.cxisystem.feature.service.LessonPeriodService;
import com.cxisystem.feature.type.LessonPeriod;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;

/** 時限マスタ管理画面向けの GraphQL エントリポイントです。 */
@RunOnVirtualThread
@GraphQLApi
public class LessonPeriodResolver extends AbstractResolver {

  @Inject
  LessonPeriodService lessonPeriodService;

  /** すべての時限を表示順で返します。 */
  @Query("allLessonPeriods")
  @RolesAllowed("admin")
  public List<LessonPeriod> getAllLessonPeriods() {
    return lessonPeriodService.findAll();
  }

  /** ID で時限 1 件を返します。 */
  @Query("lessonPeriodById")
  @RolesAllowed("admin")
  public LessonPeriod getLessonPeriodById(@NotNull String lessonPeriodId) {
    return lessonPeriodService.findById(lessonPeriodId);
  }

  /** 時限を新規作成します。 */
  @Mutation("createLessonPeriod")
  @RolesAllowed("admin")
  public LessonPeriod createLessonPeriod(@Valid LessonPeriodInput input) {
    return lessonPeriodService.create(input);
  }

  /** 時限を更新します。 */
  @Mutation("updateLessonPeriod")
  @RolesAllowed("admin")
  public LessonPeriod updateLessonPeriod(@NotNull String lessonPeriodId,
      @Valid LessonPeriodInput input) {
    return lessonPeriodService.update(lessonPeriodId, input);
  }

  /** 時限を論理削除します。 */
  @Mutation("deleteLessonPeriod")
  @RolesAllowed("admin")
  public boolean deleteLessonPeriod(@NotNull String lessonPeriodId) {
    return lessonPeriodService.deleteLessonPeriod(lessonPeriodId);
  }
}
