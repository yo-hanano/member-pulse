package com.cxisystem.feature.resolver;

import com.cxisystem.feature.input.TrialSessionInput;
import com.cxisystem.feature.service.LeadService;
import com.cxisystem.feature.service.LocationService;
import com.cxisystem.feature.service.TrialSessionService;
import com.cxisystem.feature.type.Lead;
import com.cxisystem.feature.type.Location;
import com.cxisystem.feature.type.TrialSession;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
 * リード詳細画面向けの体験セッション GraphQL エントリポイントです。
 */
@RunOnVirtualThread
@GraphQLApi
public class TrialSessionResolver extends AbstractResolver {

  @Inject
  TrialSessionService trialSessionService;

  @Inject
  LeadService leadService;

  @Inject
  LocationService locationService;

  /** リードに紐づく体験セッション一覧を返します。 */
  @Query("trialSessionsByLeadId")
  @RolesAllowed("admin")
  public List<TrialSession> getTrialSessionsByLeadId(@NotNull String leadId) {
    return trialSessionService.findByLeadId(leadId);
  }

  /** ID で体験セッション 1 件を取得します。 */
  @Query("trialSessionById")
  @RolesAllowed("admin")
  public TrialSession getTrialSessionById(@NotNull String trialSessionId) {
    return trialSessionService.findById(trialSessionId);
  }

  /** 体験セッションを新規作成します。 */
  @Mutation("createTrialSession")
  @RolesAllowed("admin")
  public TrialSession createTrialSession(@Valid TrialSessionInput input) {
    return trialSessionService.create(input);
  }

  /** 体験セッションを更新します。 */
  @Mutation("updateTrialSession")
  @RolesAllowed("admin")
  public TrialSession updateTrialSession(@NotNull String trialSessionId,
      @Valid TrialSessionInput input) {
    return trialSessionService.update(trialSessionId, input);
  }

  /** 体験セッションを論理削除します。 */
  @Mutation("deleteTrialSession")
  @RolesAllowed("admin")
  public boolean deleteTrialSession(@NotNull String trialSessionId) {
    return trialSessionService.deleteTrialSession(trialSessionId);
  }

  /** 体験セッション一覧に紐づくリードをまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Lead>> lead(@Source List<TrialSession> trialSessions) {
    return vtSupplyAsync(() -> {
      Set<String> leadIds = trialSessions.stream().map(TrialSession::getLeadId)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      List<Lead> leadList = leadService.findByIds(leadIds);
      Map<String, Lead> leadMap =
          leadList.stream().collect(Collectors.toMap(Lead::getId, lead -> lead));
      return trialSessions.stream().map(trialSession -> leadMap.get(trialSession.getLeadId()))
          .toList();
    });
  }

  /** 体験セッション一覧に紐づく拠点をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Location>> location(@Source List<TrialSession> trialSessions) {
    return vtSupplyAsync(() -> {
      Set<String> locationIds = trialSessions.stream().map(TrialSession::getLocationId)
          .filter(Objects::nonNull).collect(Collectors.toSet());
      List<Location> locationList = locationService.findByIds(locationIds);
      Map<String, Location> locationMap =
          locationList.stream().collect(Collectors.toMap(Location::getId, location -> location));
      return trialSessions.stream()
          .map(trialSession -> locationMap.get(trialSession.getLocationId())).toList();
    });
  }
}
