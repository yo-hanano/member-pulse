package com.cxisystem.feature.resolver;

import com.cxisystem.feature.service.ScheduleEventTypeService;
import com.cxisystem.feature.type.ScheduleEventType;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

/**
 * 予定種別マスタを公開する GraphQL エントリポイントです。 予定選択肢表示で使う読み取り専用 API を提供します。
 */
@RunOnVirtualThread
@GraphQLApi
public class ScheduleEventTypeResolver extends AbstractResolver {

  @Inject
  ScheduleEventTypeService scheduleEventTypeService;

  /**
   * 予定種別一覧を返します。
   *
   * @return 予定種別一覧
   */
  @Query("allScheduleEventTypes")
  public List<ScheduleEventType> getAllScheduleEventTypes() {
    return scheduleEventTypeService.findAll();
  }
}
