package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.ScheduleEventStatusService;
import com.cxisystem.feature.type.ScheduleEventStatus;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 予定ステータスマスタを公開する GraphQL エントリポイントです。 予定ステータス選択肢表示で使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class ScheduleEventStatusResolver extends AbstractResolver {

  @Inject
  ScheduleEventStatusService scheduleEventStatusService;

  /**
   * 予定ステータス一覧を返します。
   *
   * @return 予定ステータス一覧
   */
  @Query("allScheduleEventStatuses")
  public List<ScheduleEventStatus> getAllScheduleEventStatuses() {
    return scheduleEventStatusService.findAll();
  }
}
