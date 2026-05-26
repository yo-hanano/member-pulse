package com.cxisystem.feature.resolver;

import com.cxisystem.feature.input.ContractInput;
import com.cxisystem.feature.service.ContractService;
import com.cxisystem.feature.type.Contract;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;

/**
 * コース管理画面向けの GraphQL エントリポイントです。 生徒配下のコース契約 CRUD を公開します。
 */
@RunOnVirtualThread
@GraphQLApi
public class ContractResolver extends AbstractResolver {

  @Inject
  ContractService contractService;

  /** 生徒に紐づくコース契約一覧を返します。 */
  @Query("contractsByStudentId")
  @RolesAllowed("admin")
  public List<Contract> getContractsByStudentId(@NotNull String studentId) {
    return contractService.findByStudentId(studentId);
  }

  /** 生徒にコース契約を追加します。 */
  @Mutation("createStudentContract")
  @RolesAllowed("admin")
  public Contract createStudentContract(@NotNull String studentId, @Valid ContractInput input) {
    return contractService.createForStudent(studentId, input);
  }

  /** コース契約を更新します。 */
  @Mutation("updateStudentContract")
  @RolesAllowed("admin")
  public Contract updateStudentContract(@NotNull String contractId, @Valid ContractInput input) {
    return contractService.update(contractId, input);
  }

  /** コース契約を削除します。 */
  @Mutation("deleteStudentContract")
  @RolesAllowed("admin")
  public boolean deleteStudentContract(@NotNull String contractId) {
    return contractService.deleteContract(contractId);
  }
}
