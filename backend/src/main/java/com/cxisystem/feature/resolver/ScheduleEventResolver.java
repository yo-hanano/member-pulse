package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.ScheduleEventCompleteInput;
import com.cxisystem.feature.input.ScheduleEventFilterInput;
import com.cxisystem.feature.input.ScheduleEventInput;
import com.cxisystem.feature.input.ScheduleEventOutcomeInput;
import com.cxisystem.feature.input.ScheduleEventRescheduleInput;
import com.cxisystem.feature.input.ScheduleEventStatusChangeInput;
import com.cxisystem.feature.service.ScheduleEventService;
import com.cxisystem.feature.service.ScheduleSubjectService;
import com.cxisystem.feature.type.ScheduleEvent;
import com.cxisystem.feature.type.ScheduleSubject;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
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
 * 予定管理画面向けの GraphQL エントリポイントです。 予定 CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class ScheduleEventResolver extends AbstractResolver {

  @Inject
  ScheduleEventService scheduleEventService;

  @Inject
  ScheduleSubjectService scheduleSubjectService;

  /** すべての予定を返します。 */
  @Query("allScheduleEvents")
  @RolesAllowed("admin")
  public List<ScheduleEvent> getAllScheduleEvents() {
    return scheduleEventService.findAll();
  }

  /** 条件付きの予定一覧をページ形式で返します。 */
  @Query("scheduleEventPagination")
  @RolesAllowed("admin")
  public Page<ScheduleEvent> getScheduleEventPagination(@Valid Pagination pagination,
      @Valid ScheduleEventFilterInput filter) {
    return scheduleEventService.pagination(pagination, filter);
  }

  /** ID で予定 1 件を取得します。 */
  @Query("scheduleEventById")
  @RolesAllowed("admin")
  public ScheduleEvent getScheduleEventById(@NotNull String scheduleEventId) {
    return scheduleEventService.findById(scheduleEventId);
  }

  /** 予定を新規作成します。 */
  @Mutation("createScheduleEvent")
  @RolesAllowed("admin")
  public ScheduleEvent createScheduleEvent(@Valid ScheduleEventInput input) {
    return scheduleEventService.create(input);
  }

  /** 予定を更新します。 */
  @Mutation("updateScheduleEvent")
  @RolesAllowed("admin")
  public ScheduleEvent updateScheduleEvent(@NotNull String scheduleEventId,
      @Valid ScheduleEventInput input) {
    return scheduleEventService.update(scheduleEventId, input);
  }

  /** 最新予定を日程変更し、次の予定を追加します。 */
  @Mutation("rescheduleScheduleEvent")
  @RolesAllowed("admin")
  public ScheduleEvent rescheduleScheduleEvent(@NotNull String scheduleEventId,
      @Valid ScheduleEventRescheduleInput input) {
    return scheduleEventService.reschedule(scheduleEventId, input);
  }

  /** 最新予定をキャンセルします。 */
  @Mutation("cancelScheduleEvent")
  @RolesAllowed("admin")
  public ScheduleEvent cancelScheduleEvent(@NotNull String scheduleEventId,
      @Valid ScheduleEventStatusChangeInput input) {
    return scheduleEventService.cancel(scheduleEventId, input);
  }

  /** 最新予定を実施済みにします。 */
  @Mutation("completeScheduleEvent")
  @RolesAllowed("admin")
  public ScheduleEvent completeScheduleEvent(@NotNull String scheduleEventId,
      @Valid ScheduleEventCompleteInput input) {
    return scheduleEventService.complete(scheduleEventId, input);
  }

  /** 実施後の営業結果をリードへ反映します。 */
  @Mutation("recordScheduleEventOutcome")
  @RolesAllowed("admin")
  public ScheduleEvent recordScheduleEventOutcome(@NotNull String scheduleEventId,
      @Valid ScheduleEventOutcomeInput input) {
    return scheduleEventService.recordOutcome(scheduleEventId, input);
  }

  /** 予定を論理削除します。 */
  @Mutation("deleteScheduleEvent")
  @RolesAllowed("admin")
  public boolean deleteScheduleEvent(@NotNull String scheduleEventId) {
    return scheduleEventService.deleteScheduleEvent(scheduleEventId);
  }

  /** 予定一覧に紐づく主体をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<ScheduleSubject>> subject(
      @Source List<ScheduleEvent> scheduleEvents) {
    return vtSupplyAsync(() -> {
      Set<String> subjectIds = scheduleEvents.stream().map(ScheduleEvent::getScheduleSubjectId)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      if (subjectIds.isEmpty()) {
        return Collections.<ScheduleSubject>nCopies(scheduleEvents.size(), null);
      }

      Map<String, ScheduleSubject> subjectMap = scheduleSubjectService.findByIds(subjectIds)
          .stream().collect(Collectors.toMap(ScheduleSubject::getId, subject -> subject));
      return scheduleEvents.stream().map(event -> subjectMap.get(event.getScheduleSubjectId()))
          .toList();
    });
  }
}
