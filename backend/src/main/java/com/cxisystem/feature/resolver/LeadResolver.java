package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.LeadFilterInput;
import com.cxisystem.feature.input.LeadInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.service.BranchService;
import com.cxisystem.feature.service.LeadService;
import com.cxisystem.feature.type.Branch;
import com.cxisystem.feature.type.Lead;
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
 * リード管理画面向けの GraphQL エントリポイントです。 current schema のリード CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class LeadResolver extends AbstractResolver {

  @Inject
  LeadService leadService;

  @Inject
  BranchService branchService;

  /** すべてのリードを返します。 */
  @Query("allLeads")
  @RolesAllowed("admin")
  public List<Lead> getAllLeads() {
    return leadService.findAll();
  }

  /** 条件付きのリード一覧をページ形式で返します。 */
  @Query("leadPagination")
  @RolesAllowed("admin")
  public Page<Lead> getLeadPagination(@Valid Pagination pagination, @Valid LeadFilterInput filter) {
    return leadService.pagination(pagination, filter);
  }

  /** ID でリード 1 件を取得します。 */
  @Query("leadById")
  @RolesAllowed("admin")
  public Lead getLeadById(@NotNull String leadId) {
    return leadService.findById(leadId);
  }

  /** リードを新規作成します。 */
  @Mutation("createLead")
  @RolesAllowed("admin")
  public Lead createLead(@Valid LeadInput input) {
    return leadService.create(input);
  }

  /** リードを更新します。 */
  @Mutation("updateLead")
  @RolesAllowed("admin")
  public Lead updateLead(@NotNull String leadId, @Valid LeadInput input) {
    return leadService.update(leadId, input);
  }

  /** リードを論理削除します。 */
  @Mutation("deleteLead")
  @RolesAllowed("admin")
  public boolean deleteLead(@NotNull String leadId) {
    return leadService.deleteLead(leadId);
  }

  /** リード一覧の拠点をまとめて解決します。 */
  @ActivateRequestContext
  public CompletableFuture<List<Branch>> branch(@Source List<Lead> leads) {
    return vtSupplyAsync(() -> {
      Set<String> branchIds = leads.stream().map(Lead::getBranchId).filter(Objects::nonNull)
          .collect(Collectors.toSet());
      if (branchIds.isEmpty()) {
        return Collections.nCopies(leads.size(), null);
      }

      Map<String, Branch> branchMap = branchService.findByIds(branchIds).stream()
          .collect(Collectors.toMap(Branch::getId, branch -> branch));
      return leads.stream().map(lead -> branchMap.get(lead.getBranchId())).toList();
    });
  }
}
