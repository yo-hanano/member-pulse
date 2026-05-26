package com.cxisystem.feature.resolver;

import com.cxisystem.feature.dto.EmployeeInviteResult;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.EmployeeFilterInput;
import com.cxisystem.feature.input.EmployeeInput;
import com.cxisystem.feature.input.EmployeeInviteInput;
import com.cxisystem.feature.input.OwnAccountUpdateInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.service.EmployeeInviteService;
import com.cxisystem.feature.service.EmployeeService;
import com.cxisystem.feature.type.Employee;
import com.cxisystem.feature.util.AuthContextUtil;
import io.quarkus.security.ForbiddenException;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.graphql.execution.context.SmallRyeContext;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;

/**
 * employee 管理画面向け GraphQL エントリポイント。 初期段階では admin 専用 CRUD に限定して API 面を固める。
 */
@RunOnVirtualThread
@GraphQLApi
public class EmployeeResolver extends AbstractResolver {

  @Inject
  EmployeeService employeeService;

  @Inject
  EmployeeInviteService employeeInviteService;

  @Inject
  SecurityIdentity identity;

  @Inject
  SmallRyeContext smallRyeContext;

  /** すべての employee を返します。 */
  @Query("allEmployees")
  @RolesAllowed("admin")
  public List<Employee> getAllEmployees() {
    return employeeService.findAll();
  }

  /** 条件付きの employee 一覧をページ形式で返します。 */
  @Query("employeePagination")
  @RolesAllowed("admin")
  public Page<Employee> getEmployeePagination(@Valid Pagination pagination,
      @Valid EmployeeFilterInput filter) {
    return employeeService.pagination(pagination, filter);
  }

  @Query("employeeById")
  public Employee getEmployeeById(@NotNull String employeeId) {
    if (!identity.getRoles().contains("admin")) {
      String currentUserId = AuthContextUtil.getCurrentUserId();
      if (currentUserId == null || !currentUserId.equals(employeeId)) {
        throw new ForbiddenException("admin or self required");
      }
    }
    return employeeService.findById(employeeId);
  }

  /** employee を新規作成します。 */
  @Mutation("createEmployee")
  @RolesAllowed("admin")
  public Employee createEmployee(@Valid EmployeeInput input) {
    return employeeService.create(input);
  }

  /** employee を更新します。 */
  @Mutation("updateEmployee")
  @RolesAllowed("admin")
  public Employee updateEmployee(@NotNull String employeeId, @Valid EmployeeInput input) {
    return employeeService.update(employeeId, input);
  }

  /** ログイン中ユーザー自身のアカウント情報を更新します。 */
  @Mutation("updateOwnAccount")
  @RolesAllowed({"admin", "user"})
  public Employee updateOwnAccount(@Valid OwnAccountUpdateInput input) {
    String currentUserId = AuthContextUtil.getCurrentUserId();
    Employee updated = employeeService.updateOwnAccount(input);

    Map<String, Object> sessionPatch = new HashMap<>();
    sessionPatch.put("userId", currentUserId);
    sessionPatch.put("name", updated.getName());
    sessionPatch.put("email", updated.getEmail());
    smallRyeContext.addExtension("sessionPatch", sessionPatch);

    return updated;
  }

  /** employee を論理削除します。 */
  @Mutation("deleteEmployee")
  @RolesAllowed("admin")
  public boolean deleteEmployee(@NotNull String employeeId) {
    return employeeService.deleteEmployee(employeeId);
  }

  /** 指定メールアドレス宛に招待 URL を発行します。 */
  @Mutation("issueEmployeeInvite")
  @RolesAllowed("admin")
  public EmployeeInviteResult issueEmployeeInvite(@Valid EmployeeInviteInput input) {
    return employeeInviteService.issueInvite(input.getEmail());
  }
}
