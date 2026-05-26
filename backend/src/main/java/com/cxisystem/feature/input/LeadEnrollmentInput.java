package com.cxisystem.feature.input;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * リードから新規入会するときに受け取る入力値です。 生徒・主保護者・請求先の登録値に加えて、入会日を扱います。
 */
@Name("LeadEnrollmentInput")
@Input
@Data
@NoArgsConstructor
public class LeadEnrollmentInput {

  @NotNull private LocalDate enrollmentDate;

  @NotNull @Valid private LeadEnrollmentStudentInput student;

  @NotNull @Valid private GuardianInput guardian;

  @NotNull @Valid private BillingContactInput billingContact;
}
