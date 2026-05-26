package com.cxisystem.feature.resolver;

import com.cxisystem.feature.input.BranchLessonPeriodTimeSetInput;
import com.cxisystem.feature.input.BranchOpeningScheduleInput;
import com.cxisystem.feature.input.BranchOpeningScheduleTemplateInput;
import com.cxisystem.feature.service.BranchLessonPeriodTimeSetService;
import com.cxisystem.feature.service.BranchOpeningScheduleService;
import com.cxisystem.feature.service.BranchOpeningScheduleTemplateService;
import com.cxisystem.feature.type.BranchLessonPeriodTimeSet;
import com.cxisystem.feature.type.BranchLessonPeriodTimeSetDetail;
import com.cxisystem.feature.type.BranchOpeningSchedule;
import com.cxisystem.feature.type.BranchOpeningScheduleDetail;
import com.cxisystem.feature.type.BranchOpeningScheduleTemplate;
import com.cxisystem.feature.type.BranchOpeningScheduleTemplateDetail;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;

/** 開校テンプレート、拠点スケジュール、拠点時限時刻セット向けの GraphQL エントリポイントです。 */
@RunOnVirtualThread
@GraphQLApi
public class BranchOpeningScheduleResolver extends AbstractResolver {

  @Inject
  BranchOpeningScheduleTemplateService templateService;

  @Inject
  BranchOpeningScheduleService scheduleService;

  @Inject
  BranchLessonPeriodTimeSetService timeSetService;

  /** 会社で利用できる開校スケジュールテンプレート一覧を返します。 */
  @Query("allBranchOpeningScheduleTemplates")
  @RolesAllowed("admin")
  public List<BranchOpeningScheduleTemplate> getAllTemplates() {
    return templateService.findAll();
  }

  /** 曜日と時限を含むテンプレート詳細を返します。 */
  @Query("branchOpeningScheduleTemplateById")
  @RolesAllowed("admin")
  public BranchOpeningScheduleTemplateDetail getTemplateById(@NotNull String templateId) {
    return templateService.findDetail(templateId);
  }

  /** テンプレートを親子まとめて作成します。 */
  @Mutation("createBranchOpeningScheduleTemplate")
  @RolesAllowed("admin")
  public BranchOpeningScheduleTemplateDetail createTemplate(
      @Valid BranchOpeningScheduleTemplateInput input) {
    return templateService.create(input);
  }

  /** テンプレートを親子まとめて更新します。 */
  @Mutation("updateBranchOpeningScheduleTemplate")
  @RolesAllowed("admin")
  public BranchOpeningScheduleTemplateDetail updateTemplate(@NotNull String templateId,
      @Valid BranchOpeningScheduleTemplateInput input) {
    return templateService.update(templateId, input);
  }

  /** テンプレートを論理削除します。 */
  @Mutation("deleteBranchOpeningScheduleTemplate")
  @RolesAllowed("admin")
  public boolean deleteTemplate(@NotNull String templateId) {
    return templateService.deleteTemplate(templateId);
  }

  /** 指定拠点の時限時刻セット一覧を返します。 */
  @Query("branchLessonPeriodTimeSets")
  @RolesAllowed("admin")
  public List<BranchLessonPeriodTimeSet> getTimeSets(@NotNull String branchId) {
    return timeSetService.findByBranchId(branchId);
  }

  /** 時限別時刻を含む拠点時限時刻セット詳細を返します。 */
  @Query("branchLessonPeriodTimeSetById")
  @RolesAllowed("admin")
  public BranchLessonPeriodTimeSetDetail getTimeSetById(@NotNull String timeSetId) {
    return timeSetService.findDetail(timeSetId);
  }

  /** 拠点時限時刻セットを親子まとめて作成します。 */
  @Mutation("createBranchLessonPeriodTimeSet")
  @RolesAllowed("admin")
  public BranchLessonPeriodTimeSetDetail createTimeSet(
      @Valid BranchLessonPeriodTimeSetInput input) {
    return timeSetService.create(input);
  }

  /** 拠点時限時刻セットを親子まとめて更新します。 */
  @Mutation("updateBranchLessonPeriodTimeSet")
  @RolesAllowed("admin")
  public BranchLessonPeriodTimeSetDetail updateTimeSet(@NotNull String timeSetId,
      @Valid BranchLessonPeriodTimeSetInput input) {
    return timeSetService.update(timeSetId, input);
  }

  /** 拠点時限時刻セットを論理削除します。 */
  @Mutation("deleteBranchLessonPeriodTimeSet")
  @RolesAllowed("admin")
  public boolean deleteTimeSet(@NotNull String timeSetId) {
    return timeSetService.deleteTimeSet(timeSetId);
  }

  /** 指定拠点の通常開校スケジュール一覧を返します。 */
  @Query("branchOpeningSchedules")
  @RolesAllowed("admin")
  public List<BranchOpeningSchedule> getSchedules(@NotNull String branchId) {
    return scheduleService.findByBranchId(branchId);
  }

  /** 曜日と時限を含む拠点通常開校スケジュール詳細を返します。 */
  @Query("branchOpeningScheduleById")
  @RolesAllowed("admin")
  public BranchOpeningScheduleDetail getScheduleById(@NotNull String scheduleId) {
    return scheduleService.findDetail(scheduleId);
  }

  /** 拠点通常開校スケジュールを親子まとめて作成します。 */
  @Mutation("createBranchOpeningSchedule")
  @RolesAllowed("admin")
  public BranchOpeningScheduleDetail createSchedule(@Valid BranchOpeningScheduleInput input) {
    return scheduleService.create(input);
  }

  /** 拠点通常開校スケジュールを親子まとめて更新します。 */
  @Mutation("updateBranchOpeningSchedule")
  @RolesAllowed("admin")
  public BranchOpeningScheduleDetail updateSchedule(@NotNull String scheduleId,
      @Valid BranchOpeningScheduleInput input) {
    return scheduleService.update(scheduleId, input);
  }

  /** 拠点通常開校スケジュールを論理削除します。 */
  @Mutation("deleteBranchOpeningSchedule")
  @RolesAllowed("admin")
  public boolean deleteSchedule(@NotNull String scheduleId) {
    return scheduleService.deleteSchedule(scheduleId);
  }
}
