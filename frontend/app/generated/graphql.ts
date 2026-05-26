/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
export type AreaFilterInput = {
  name?: string | null | undefined;
};

export type AreaInput = {
  dispOrder?: number | null | undefined;
  name: string;
};

export type AreaOrderInput = {
  dispOrder?: number | null | undefined;
  id: string;
};

export type BillingContactInput = {
  address: string;
  email: string;
  id?: string | null | undefined;
  kana: string;
  name: string;
  note?: string | null | undefined;
  phone: string;
  postalCode: string;
  prefectureCode: string;
};

export type BranchFilterInput = {
  areaId?: string | null | undefined;
  code?: string | null | undefined;
  name?: string | null | undefined;
};

export type BranchInput = {
  address: string;
  areaId: string;
  code: string;
  name: string;
  prefectureCode: string;
  zipCode: string;
};

export type BranchLessonPeriodTimeInput = {
  /** ISO-8601 */
  endTime: string;
  lessonPeriodId: string;
  /** ISO-8601 */
  startTime: string;
};

export type BranchLessonPeriodTimeSetInput = {
  branchId: string;
  name: string;
  note?: string | null | undefined;
  times?: Array<BranchLessonPeriodTimeInput | null | undefined> | null | undefined;
};

export type BranchOpeningScheduleInput = {
  branchId: string;
  days?: Array<OpeningScheduleDayInput | null | undefined> | null | undefined;
  /** ISO-8601 */
  effectiveFrom: string;
  /** ISO-8601 */
  effectiveTo?: string | null | undefined;
  note?: string | null | undefined;
  timeSetId?: string | null | undefined;
};

export type BranchOpeningScheduleTemplateInput = {
  days?: Array<OpeningScheduleDayInput | null | undefined> | null | undefined;
  name: string;
  note?: string | null | undefined;
};

export type ContractInput = {
  /** ISO-8601 */
  contractEndDate?: string | null | undefined;
  /** ISO-8601 */
  contractStartDate: string;
  coursePlanName?: string | null | undefined;
  courseType: string;
  discountAmount: number;
  monthlyFee: number;
  note?: string | null | undefined;
  /** ISO-8601 */
  preferredEndTime?: string | null | undefined;
  /** ISO-8601 */
  preferredStartTime?: string | null | undefined;
  preferredWeekday?: number | null | undefined;
  seatGenerationEligible: boolean;
  subjectId: string;
  weeklyLessons: number;
};

export type EmployeeFilterInput = {
  email?: string | null | undefined;
  isAdmin?: boolean | null | undefined;
  name?: string | null | undefined;
  status?: string | null | undefined;
};

export type EmployeeInput = {
  email: string;
  genderCode: string;
  isAdmin: boolean;
  name: string;
};

export type EmployeeInviteInput = {
  email: string;
};

export type GuardianInput = {
  address: string;
  email?: string | null | undefined;
  id?: string | null | undefined;
  kana: string;
  name: string;
  note?: string | null | undefined;
  phone: string;
  postalCode: string;
  prefectureCode: string;
  relationshipCode: string;
};

export type LeadEnrollmentInput = {
  billingContact: BillingContactInput;
  /** ISO-8601 */
  enrollmentDate: string;
  guardian: GuardianInput;
  student: LeadEnrollmentStudentInput;
};

export type LeadEnrollmentStudentInput = {
  /** ISO-8601 */
  birthday: string;
  branchId: string;
  code: string;
  genderCode: string;
  kana: string;
  name: string;
  note?: string | null | undefined;
  schoolCode: string;
  schoolGradeCode: string;
  status: string;
};

export type LeadFilterInput = {
  branchId?: string | null | undefined;
  channel?: string | null | undefined;
  guardianName?: string | null | undefined;
  /** ISO-8601 */
  inquiryAtFrom?: string | null | undefined;
  /** ISO-8601 */
  inquiryAtTo?: string | null | undefined;
  schoolName?: string | null | undefined;
  status?: string | null | undefined;
  studentName?: string | null | undefined;
};

export type LeadInput = {
  branchId: string;
  channel?: string | null | undefined;
  email?: string | null | undefined;
  gradeName?: string | null | undefined;
  guardianKana?: string | null | undefined;
  guardianName?: string | null | undefined;
  /** ISO-8601 */
  inquiryAt: string;
  note?: string | null | undefined;
  phone?: string | null | undefined;
  schoolName?: string | null | undefined;
  status: string;
  studentKana?: string | null | undefined;
  studentName: string;
};

export type LessonPeriodInput = {
  dispOrder: number;
  name: string;
};

export type OpeningScheduleDayInput = {
  isOpen: boolean;
  periods?: Array<OpeningSchedulePeriodInput | null | undefined> | null | undefined;
  weekday: number;
};

export type OpeningSchedulePeriodInput = {
  lessonPeriodId: string;
};

export type OwnAccountUpdateInput = {
  currentPassword: string;
  name: string;
  newPassword?: string | null | undefined;
};

export type Pagination = {
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: string | null | undefined;
  orderDirection?: string | null | undefined;
};

export type ScheduleEventCompleteInput = {
  note?: string | null | undefined;
};

export type ScheduleEventFilterInput = {
  note?: string | null | undefined;
  reason?: string | null | undefined;
  scheduleSubjectId?: string | null | undefined;
  scheduleType?: string | null | undefined;
  status?: string | null | undefined;
};

export type ScheduleEventInput = {
  note?: string | null | undefined;
  reason?: string | null | undefined;
  scheduleSubjectId: string;
  scheduleType: string;
  /** ISO-8601 */
  scheduledAt: string;
  status: string;
};

export type ScheduleEventOutcomeInput = {
  leadStatus: string;
  note?: string | null | undefined;
};

export type ScheduleEventRescheduleInput = {
  note?: string | null | undefined;
  reason: string;
  scheduleType: string;
  /** ISO-8601 */
  scheduledAt: string;
};

export type ScheduleEventStatusChangeInput = {
  note?: string | null | undefined;
  reason: string;
};

export type ScheduleSubjectInput = {
  guardianId?: string | null | undefined;
  leadId?: string | null | undefined;
  studentId?: string | null | undefined;
  teacherId?: string | null | undefined;
};

export type SchoolFilterInput = {
  code?: string | null | undefined;
  establishmentKbn?: number | null | undefined;
  name?: string | null | undefined;
  prefectureCode?: string | null | undefined;
  schoolTypeCode?: string | null | undefined;
};

export type StudentFilterInput = {
  branchId?: string | null | undefined;
  code?: string | null | undefined;
  kana?: string | null | undefined;
  name?: string | null | undefined;
  schoolGradeCode?: string | null | undefined;
  schoolName?: string | null | undefined;
  schoolTypeCode?: string | null | undefined;
  status?: string | null | undefined;
};

export type StudentInput = {
  /** ISO-8601 */
  birthday: string;
  branchId: string;
  code: string;
  genderCode: string;
  guardian?: GuardianInput | null | undefined;
  kana: string;
  name: string;
  note?: string | null | undefined;
  schoolCode: string;
  schoolGradeCode: string;
  status: string;
};

export type TeacherFilterInput = {
  code?: string | null | undefined;
  email?: string | null | undefined;
  genderCode?: string | null | undefined;
  kana?: string | null | undefined;
  name?: string | null | undefined;
  phone?: string | null | undefined;
  schoolGradeCode?: string | null | undefined;
  schoolName?: string | null | undefined;
  status?: string | null | undefined;
};

export type TeacherInput = {
  /** ISO-8601 */
  birthday?: string | null | undefined;
  code: string;
  email?: string | null | undefined;
  genderCode: string;
  kana: string;
  name: string;
  note?: string | null | undefined;
  phone?: string | null | undefined;
  schoolCode: string;
  schoolGradeCode: string;
  status: string;
};

export type AreaListItemFragment = { id: string | undefined | null, name: string | undefined | null, dispOrder: number | undefined | null };

export type AllAreasQueryVariables = Exact<{ [key: string]: never; }>;


export type AllAreasQuery = { allAreas: Array<{ id: string | undefined | null, name: string | undefined | null, dispOrder: number | undefined | null } | undefined | null> | undefined | null };

export type AreaByIdQueryVariables = Exact<{
  areaId: string;
}>;


export type AreaByIdQuery = { areaById: { id: string | undefined | null, name: string | undefined | null, dispOrder: number | undefined | null } | undefined | null };

export type AreaPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: AreaFilterInput | null | undefined;
}>;


export type AreaPageQuery = { areaPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, name: string | undefined | null, dispOrder: number | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type CreateAreaMutationVariables = Exact<{
  input: AreaInput;
}>;


export type CreateAreaMutation = { createArea: { id: string | undefined | null } | undefined | null };

export type UpdateAreaMutationVariables = Exact<{
  areaId: string;
  input: AreaInput;
}>;


export type UpdateAreaMutation = { updateArea: { id: string | undefined | null } | undefined | null };

export type DeleteAreaMutationVariables = Exact<{
  areaId: string;
}>;


export type DeleteAreaMutation = { deleteArea: boolean };

export type UpdateAreaOrdersMutationVariables = Exact<{
  inputs: Array<AreaOrderInput> | AreaOrderInput;
}>;


export type UpdateAreaOrdersMutation = { updateAreaOrders: boolean };

export type OpeningScheduleDayViewFragment = { weekday: number | undefined | null, isOpen: boolean | undefined | null, periods: Array<{ lessonPeriodId: string | undefined | null } | undefined | null> | undefined | null };

export type BranchOpeningScheduleTemplateListItemFragment = { id: string | undefined | null, name: string | undefined | null, note: string | undefined | null };

export type BranchOpeningScheduleTemplateDetailViewFragment = { id: string | undefined | null, name: string | undefined | null, note: string | undefined | null, days: Array<{ weekday: number | undefined | null, isOpen: boolean | undefined | null, periods: Array<{ lessonPeriodId: string | undefined | null } | undefined | null> | undefined | null } | undefined | null> | undefined | null };

export type BranchLessonPeriodTimeSetListItemFragment = { id: string | undefined | null, branchId: string | undefined | null, name: string | undefined | null, note: string | undefined | null };

export type BranchLessonPeriodTimeSetDetailViewFragment = { id: string | undefined | null, branchId: string | undefined | null, name: string | undefined | null, note: string | undefined | null, times: Array<{ id: string | undefined | null, lessonPeriodId: string | undefined | null, startTime: string | undefined | null, endTime: string | undefined | null } | undefined | null> | undefined | null };

export type BranchOpeningScheduleListItemFragment = { id: string | undefined | null, branchId: string | undefined | null, effectiveFrom: string | undefined | null, effectiveTo: string | undefined | null, timeSetId: string | undefined | null, note: string | undefined | null };

export type BranchOpeningScheduleDetailViewFragment = { id: string | undefined | null, branchId: string | undefined | null, effectiveFrom: string | undefined | null, effectiveTo: string | undefined | null, timeSetId: string | undefined | null, note: string | undefined | null, days: Array<{ weekday: number | undefined | null, isOpen: boolean | undefined | null, periods: Array<{ lessonPeriodId: string | undefined | null } | undefined | null> | undefined | null } | undefined | null> | undefined | null };

export type AllBranchOpeningScheduleTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllBranchOpeningScheduleTemplatesQuery = { allBranchOpeningScheduleTemplates: Array<{ id: string | undefined | null, name: string | undefined | null, note: string | undefined | null } | undefined | null> | undefined | null };

export type BranchOpeningScheduleTemplateByIdQueryVariables = Exact<{
  templateId: string;
}>;


export type BranchOpeningScheduleTemplateByIdQuery = { branchOpeningScheduleTemplateById: { id: string | undefined | null, name: string | undefined | null, note: string | undefined | null, days: Array<{ weekday: number | undefined | null, isOpen: boolean | undefined | null, periods: Array<{ lessonPeriodId: string | undefined | null } | undefined | null> | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type CreateBranchOpeningScheduleTemplateMutationVariables = Exact<{
  input: BranchOpeningScheduleTemplateInput;
}>;


export type CreateBranchOpeningScheduleTemplateMutation = { createBranchOpeningScheduleTemplate: { id: string | undefined | null } | undefined | null };

export type UpdateBranchOpeningScheduleTemplateMutationVariables = Exact<{
  templateId: string;
  input: BranchOpeningScheduleTemplateInput;
}>;


export type UpdateBranchOpeningScheduleTemplateMutation = { updateBranchOpeningScheduleTemplate: { id: string | undefined | null } | undefined | null };

export type DeleteBranchOpeningScheduleTemplateMutationVariables = Exact<{
  templateId: string;
}>;


export type DeleteBranchOpeningScheduleTemplateMutation = { deleteBranchOpeningScheduleTemplate: boolean };

export type BranchLessonPeriodTimeSetsQueryVariables = Exact<{
  branchId: string;
}>;


export type BranchLessonPeriodTimeSetsQuery = { branchLessonPeriodTimeSets: Array<{ id: string | undefined | null, branchId: string | undefined | null, name: string | undefined | null, note: string | undefined | null } | undefined | null> | undefined | null };

export type BranchLessonPeriodTimeSetByIdQueryVariables = Exact<{
  timeSetId: string;
}>;


export type BranchLessonPeriodTimeSetByIdQuery = { branchLessonPeriodTimeSetById: { id: string | undefined | null, branchId: string | undefined | null, name: string | undefined | null, note: string | undefined | null, times: Array<{ id: string | undefined | null, lessonPeriodId: string | undefined | null, startTime: string | undefined | null, endTime: string | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type CreateBranchLessonPeriodTimeSetMutationVariables = Exact<{
  input: BranchLessonPeriodTimeSetInput;
}>;


export type CreateBranchLessonPeriodTimeSetMutation = { createBranchLessonPeriodTimeSet: { id: string | undefined | null } | undefined | null };

export type UpdateBranchLessonPeriodTimeSetMutationVariables = Exact<{
  timeSetId: string;
  input: BranchLessonPeriodTimeSetInput;
}>;


export type UpdateBranchLessonPeriodTimeSetMutation = { updateBranchLessonPeriodTimeSet: { id: string | undefined | null } | undefined | null };

export type DeleteBranchLessonPeriodTimeSetMutationVariables = Exact<{
  timeSetId: string;
}>;


export type DeleteBranchLessonPeriodTimeSetMutation = { deleteBranchLessonPeriodTimeSet: boolean };

export type BranchOpeningSchedulesQueryVariables = Exact<{
  branchId: string;
}>;


export type BranchOpeningSchedulesQuery = { branchOpeningSchedules: Array<{ id: string | undefined | null, branchId: string | undefined | null, effectiveFrom: string | undefined | null, effectiveTo: string | undefined | null, timeSetId: string | undefined | null, note: string | undefined | null } | undefined | null> | undefined | null };

export type BranchOpeningScheduleByIdQueryVariables = Exact<{
  scheduleId: string;
}>;


export type BranchOpeningScheduleByIdQuery = { branchOpeningScheduleById: { id: string | undefined | null, branchId: string | undefined | null, effectiveFrom: string | undefined | null, effectiveTo: string | undefined | null, timeSetId: string | undefined | null, note: string | undefined | null, days: Array<{ weekday: number | undefined | null, isOpen: boolean | undefined | null, periods: Array<{ lessonPeriodId: string | undefined | null } | undefined | null> | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type CreateBranchOpeningScheduleMutationVariables = Exact<{
  input: BranchOpeningScheduleInput;
}>;


export type CreateBranchOpeningScheduleMutation = { createBranchOpeningSchedule: { id: string | undefined | null } | undefined | null };

export type UpdateBranchOpeningScheduleMutationVariables = Exact<{
  scheduleId: string;
  input: BranchOpeningScheduleInput;
}>;


export type UpdateBranchOpeningScheduleMutation = { updateBranchOpeningSchedule: { id: string | undefined | null } | undefined | null };

export type DeleteBranchOpeningScheduleMutationVariables = Exact<{
  scheduleId: string;
}>;


export type DeleteBranchOpeningScheduleMutation = { deleteBranchOpeningSchedule: boolean };

export type BranchDetailViewFragment = { id: string | undefined | null, areaId: string | undefined | null, code: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null };

export type BranchListItemFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, address: string | undefined | null, area: { id: string | undefined | null, name: string | undefined | null } | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null };

export type BranchOptionFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null };

export type BranchByIdQueryVariables = Exact<{
  branchId: string;
}>;


export type BranchByIdQuery = { branchById: { id: string | undefined | null, areaId: string | undefined | null, code: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type BranchPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: BranchFilterInput | null | undefined;
}>;


export type BranchPageQuery = { branchPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, address: string | undefined | null, area: { id: string | undefined | null, name: string | undefined | null } | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllBranchesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllBranchesQuery = { allBranches: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null } | undefined | null> | undefined | null };

export type CreateBranchMutationVariables = Exact<{
  input: BranchInput;
}>;


export type CreateBranchMutation = { createBranch: { id: string | undefined | null } | undefined | null };

export type UpdateBranchMutationVariables = Exact<{
  branchId: string;
  input: BranchInput;
}>;


export type UpdateBranchMutation = { updateBranch: { id: string | undefined | null } | undefined | null };

export type DeleteBranchMutationVariables = Exact<{
  branchId: string;
}>;


export type DeleteBranchMutation = { deleteBranch: boolean };

export type EmployeeFormInitialFragment = { id: string | undefined | null, name: string | undefined | null, email: string | undefined | null, genderCode: string | undefined | null, isAdmin: boolean | undefined | null };

export type EmployeeListItemFragment = { id: string | undefined | null, name: string | undefined | null, email: string | undefined | null, genderCode: string | undefined | null, isAdmin: boolean | undefined | null, status: string | undefined | null };

export type AllEmployeesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllEmployeesQuery = { allEmployees: Array<{ id: string | undefined | null, name: string | undefined | null, email: string | undefined | null, genderCode: string | undefined | null, isAdmin: boolean | undefined | null } | undefined | null> | undefined | null };

export type EmployeeByIdQueryVariables = Exact<{
  employeeId: string;
}>;


export type EmployeeByIdQuery = { employeeById: { id: string | undefined | null, name: string | undefined | null, email: string | undefined | null, genderCode: string | undefined | null, isAdmin: boolean | undefined | null } | undefined | null };

export type EmployeePageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: EmployeeFilterInput | null | undefined;
}>;


export type EmployeePageQuery = { employeePagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, name: string | undefined | null, email: string | undefined | null, genderCode: string | undefined | null, isAdmin: boolean | undefined | null, status: string | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type CreateEmployeeMutationVariables = Exact<{
  input: EmployeeInput;
}>;


export type CreateEmployeeMutation = { createEmployee: { id: string | undefined | null } | undefined | null };

export type UpdateEmployeeMutationVariables = Exact<{
  employeeId: string;
  input: EmployeeInput;
}>;


export type UpdateEmployeeMutation = { updateEmployee: { id: string | undefined | null } | undefined | null };

export type DeleteEmployeeMutationVariables = Exact<{
  employeeId: string;
}>;


export type DeleteEmployeeMutation = { deleteEmployee: boolean };

export type UpdateOwnAccountMutationVariables = Exact<{
  input: OwnAccountUpdateInput;
}>;


export type UpdateOwnAccountMutation = { updateOwnAccount: { id: string | undefined | null, name: string | undefined | null, email: string | undefined | null } | undefined | null };

export type AllGendersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllGendersQuery = { allGenders: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type IssueEmployeeInviteMutationVariables = Exact<{
  input: EmployeeInviteInput;
}>;


export type IssueEmployeeInviteMutation = { issueEmployeeInvite: { employeeId: string | undefined | null, email: string | undefined | null, inviteUrl: string | undefined | null, expiresAt: string | undefined | null } | undefined | null };

export type LeadDetailViewFragment = { id: string | undefined | null, inquiryAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, channel: string | undefined | null, status: string | undefined | null, note: string | undefined | null, updatedAt: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type LeadListItemFragment = { id: string | undefined | null, inquiryAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, channel: string | undefined | null, status: string | undefined | null, updatedAt: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type LeadOptionFragment = { id: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null, status: string | undefined | null };

export type LeadByIdQueryVariables = Exact<{
  leadId: string;
}>;


export type LeadByIdQuery = { leadById: { id: string | undefined | null, inquiryAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, channel: string | undefined | null, status: string | undefined | null, note: string | undefined | null, updatedAt: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null } | undefined | null };

export type LeadPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: LeadFilterInput | null | undefined;
}>;


export type LeadPageQuery = { leadPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, inquiryAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, channel: string | undefined | null, status: string | undefined | null, updatedAt: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllLeadsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllLeadsQuery = { allLeads: Array<{ id: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null, status: string | undefined | null } | undefined | null> | undefined | null };

export type CreateLeadMutationVariables = Exact<{
  input: LeadInput;
}>;


export type CreateLeadMutation = { createLead: { id: string | undefined | null } | undefined | null };

export type UpdateLeadMutationVariables = Exact<{
  leadId: string;
  input: LeadInput;
}>;


export type UpdateLeadMutation = { updateLead: { id: string | undefined | null } | undefined | null };

export type DeleteLeadMutationVariables = Exact<{
  leadId: string;
}>;


export type DeleteLeadMutation = { deleteLead: boolean };

export type LessonPeriodListItemFragment = { id: string | undefined | null, name: string | undefined | null, dispOrder: number | undefined | null };

export type AllLessonPeriodsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllLessonPeriodsQuery = { allLessonPeriods: Array<{ id: string | undefined | null, name: string | undefined | null, dispOrder: number | undefined | null } | undefined | null> | undefined | null };

export type CreateLessonPeriodMutationVariables = Exact<{
  input: LessonPeriodInput;
}>;


export type CreateLessonPeriodMutation = { createLessonPeriod: { id: string | undefined | null } | undefined | null };

export type UpdateLessonPeriodMutationVariables = Exact<{
  lessonPeriodId: string;
  input: LessonPeriodInput;
}>;


export type UpdateLessonPeriodMutation = { updateLessonPeriod: { id: string | undefined | null } | undefined | null };

export type DeleteLessonPeriodMutationVariables = Exact<{
  lessonPeriodId: string;
}>;


export type DeleteLessonPeriodMutation = { deleteLessonPeriod: boolean };

export type PrefectureOptionFragment = { code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null };

export type AllPrefecturesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPrefecturesQuery = { allPrefectures: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type RelationshipOptionFragment = { code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null };

export type AllRelationshipsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllRelationshipsQuery = { allRelationships: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type ScheduleEventListItemFragment = { id: string | undefined | null, status: string | undefined | null, reason: string | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, updatedAt: string | undefined | null, leadId: string | undefined | null, activityType: string | undefined | null, activityAt: string | undefined | null, subject: { id: string | undefined | null, lead: { id: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null, status: string | undefined | null } | undefined | null } | undefined | null };

export type ScheduleEventByIdQueryVariables = Exact<{
  scheduleEventId: string;
}>;


export type ScheduleEventByIdQuery = { scheduleEventById: { id: string | undefined | null, status: string | undefined | null, reason: string | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, updatedAt: string | undefined | null, leadId: string | undefined | null, activityType: string | undefined | null, activityAt: string | undefined | null, subject: { id: string | undefined | null, lead: { id: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null, status: string | undefined | null } | undefined | null } | undefined | null } | undefined | null };

export type ScheduleEventPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: ScheduleEventFilterInput | null | undefined;
}>;


export type ScheduleEventPageQuery = { scheduleEventPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, status: string | undefined | null, reason: string | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, updatedAt: string | undefined | null, leadId: string | undefined | null, activityType: string | undefined | null, activityAt: string | undefined | null, subject: { id: string | undefined | null, lead: { id: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null, status: string | undefined | null } | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllScheduleEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllScheduleEventsQuery = { allScheduleEvents: Array<{ id: string | undefined | null, status: string | undefined | null, reason: string | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, updatedAt: string | undefined | null, leadId: string | undefined | null, activityType: string | undefined | null, activityAt: string | undefined | null, subject: { id: string | undefined | null, lead: { id: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null, status: string | undefined | null } | undefined | null } | undefined | null } | undefined | null> | undefined | null };

export type AllScheduleEventTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllScheduleEventTypesQuery = { allScheduleEventTypes: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type AllScheduleEventStatusesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllScheduleEventStatusesQuery = { allScheduleEventStatuses: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type CreateScheduleEventMutationVariables = Exact<{
  input: ScheduleEventInput;
}>;


export type CreateScheduleEventMutation = { createScheduleEvent: { id: string | undefined | null } | undefined | null };

export type UpdateScheduleEventMutationVariables = Exact<{
  scheduleEventId: string;
  input: ScheduleEventInput;
}>;


export type UpdateScheduleEventMutation = { updateScheduleEvent: { id: string | undefined | null } | undefined | null };

export type RescheduleScheduleEventMutationVariables = Exact<{
  scheduleEventId: string;
  input: ScheduleEventRescheduleInput;
}>;


export type RescheduleScheduleEventMutation = { rescheduleScheduleEvent: { id: string | undefined | null } | undefined | null };

export type CancelScheduleEventMutationVariables = Exact<{
  scheduleEventId: string;
  input: ScheduleEventStatusChangeInput;
}>;


export type CancelScheduleEventMutation = { cancelScheduleEvent: { id: string | undefined | null } | undefined | null };

export type CompleteScheduleEventMutationVariables = Exact<{
  scheduleEventId: string;
  input: ScheduleEventCompleteInput;
}>;


export type CompleteScheduleEventMutation = { completeScheduleEvent: { id: string | undefined | null } | undefined | null };

export type RecordScheduleEventOutcomeMutationVariables = Exact<{
  scheduleEventId: string;
  input: ScheduleEventOutcomeInput;
}>;


export type RecordScheduleEventOutcomeMutation = { recordScheduleEventOutcome: { id: string | undefined | null } | undefined | null };

export type DeleteScheduleEventMutationVariables = Exact<{
  scheduleEventId: string;
}>;


export type DeleteScheduleEventMutation = { deleteScheduleEvent: boolean };

export type CreateScheduleSubjectMutationVariables = Exact<{
  input: ScheduleSubjectInput;
}>;


export type CreateScheduleSubjectMutation = { createScheduleSubject: { id: string | undefined | null, leadId: string | undefined | null, studentId: string | undefined | null, teacherId: string | undefined | null, guardianId: string | undefined | null } | undefined | null };

export type UpdateScheduleSubjectMutationVariables = Exact<{
  scheduleSubjectId: string;
  input: ScheduleSubjectInput;
}>;


export type UpdateScheduleSubjectMutation = { updateScheduleSubject: { id: string | undefined | null, leadId: string | undefined | null, studentId: string | undefined | null, teacherId: string | undefined | null, guardianId: string | undefined | null } | undefined | null };

export type SchoolByCodeQueryVariables = Exact<{
  schoolCode: string;
}>;


export type SchoolByCodeQuery = { schoolByCode: { code: string | undefined | null, name: string | undefined | null, prefectureCode: string | undefined | null, schoolTypeCode: string | undefined | null } | undefined | null };

export type SchoolPaginationQueryVariables = Exact<{
  pagination: Pagination;
  filter?: SchoolFilterInput | null | undefined;
}>;


export type SchoolPaginationQuery = { schoolPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ code: string | undefined | null, name: string | undefined | null, prefectureCode: string | undefined | null, schoolTypeCode: string | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllSchoolGradesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSchoolGradesQuery = { allSchoolGrades: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type AllSchoolTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSchoolTypesQuery = { allSchoolTypes: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export type StudentFormInitialFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, branchId: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, schoolGradeName: string | undefined | null, status: string | undefined | null, note: string | undefined | null, branchLabels: Array<{ name: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null, primaryGuardian: { id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, relationshipCode: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null } | undefined | null, guardians: Array<{ id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, relationshipCode: string | undefined | null, relationshipName: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primaryContact: boolean | undefined | null } | undefined | null> | undefined | null, billingContacts: Array<{ id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null };

export type StudentListItemFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, branchId: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolTypeName: string | undefined | null, schoolGradeCode: string | undefined | null, schoolGradeName: string | undefined | null, status: string | undefined | null, branchLabels: Array<{ name: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null };

export type StudentOptionFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, branchId: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, schoolGradeName: string | undefined | null, status: string | undefined | null, branchLabels: Array<{ name: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null };

export type BillingContactOptionFragment = { id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null };

export type SubjectOptionFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null };

export type StudentContractListItemFragment = { id: string | undefined | null, courseType: string | undefined | null, coursePlanName: string | undefined | null, contractStartDate: string | undefined | null, contractEndDate: string | undefined | null, subjectId: string | undefined | null, weeklyLessons: number | undefined | null, preferredWeekday: number | undefined | null, preferredStartTime: string | undefined | null, preferredEndTime: string | undefined | null, monthlyFee: number | undefined | null, discountAmount: number | undefined | null, seatGenerationEligible: boolean | undefined | null, status: string | undefined | null, note: string | undefined | null };

export type StudentByIdQueryVariables = Exact<{
  studentId: string;
}>;


export type StudentByIdQuery = { studentById: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, branchId: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, schoolGradeName: string | undefined | null, status: string | undefined | null, note: string | undefined | null, branchLabels: Array<{ name: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null, primaryGuardian: { id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, relationshipCode: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null } | undefined | null, guardians: Array<{ id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, relationshipCode: string | undefined | null, relationshipName: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primaryContact: boolean | undefined | null } | undefined | null> | undefined | null, billingContacts: Array<{ id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type StudentPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: StudentFilterInput | null | undefined;
}>;


export type StudentPageQuery = { studentPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, branchId: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolTypeName: string | undefined | null, schoolGradeCode: string | undefined | null, schoolGradeName: string | undefined | null, status: string | undefined | null, branchLabels: Array<{ name: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllStudentsQuery = { allStudents: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, branchId: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, schoolGradeName: string | undefined | null, status: string | undefined | null, branchLabels: Array<{ name: string | undefined | null, primary: boolean | undefined | null } | undefined | null> | undefined | null } | undefined | null> | undefined | null };

export type BillingContactOptionsQueryVariables = Exact<{
  searchText?: string | null | undefined;
}>;


export type BillingContactOptionsQuery = { billingContactOptions: Array<{ id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null } | undefined | null> | undefined | null };

export type SubjectOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type SubjectOptionsQuery = { subjectOptions: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null } | undefined | null> | undefined | null };

export type StudentContractsQueryVariables = Exact<{
  studentId: string;
}>;


export type StudentContractsQuery = { contractsByStudentId: Array<{ id: string | undefined | null, courseType: string | undefined | null, coursePlanName: string | undefined | null, contractStartDate: string | undefined | null, contractEndDate: string | undefined | null, subjectId: string | undefined | null, weeklyLessons: number | undefined | null, preferredWeekday: number | undefined | null, preferredStartTime: string | undefined | null, preferredEndTime: string | undefined | null, monthlyFee: number | undefined | null, discountAmount: number | undefined | null, seatGenerationEligible: boolean | undefined | null, status: string | undefined | null, note: string | undefined | null } | undefined | null> | undefined | null };

export type CreateStudentMutationVariables = Exact<{
  input: StudentInput;
}>;


export type CreateStudentMutation = { createStudent: { id: string | undefined | null } | undefined | null };

export type EnrollLeadMutationVariables = Exact<{
  leadId: string;
  input: LeadEnrollmentInput;
}>;


export type EnrollLeadMutation = { enrollLead: { id: string | undefined | null } | undefined | null };

export type UpdateStudentMutationVariables = Exact<{
  studentId: string;
  input: StudentInput;
}>;


export type UpdateStudentMutation = { updateStudent: { id: string | undefined | null } | undefined | null };

export type SaveStudentGuardianMutationVariables = Exact<{
  studentId: string;
  input: GuardianInput;
}>;


export type SaveStudentGuardianMutation = { saveStudentGuardian: { id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, relationshipCode: string | undefined | null, relationshipName: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primaryContact: boolean | undefined | null } | undefined | null };

export type SetPrimaryStudentGuardianMutationVariables = Exact<{
  studentId: string;
  guardianId: string;
}>;


export type SetPrimaryStudentGuardianMutation = { setPrimaryStudentGuardian: { id: string | undefined | null, primaryContact: boolean | undefined | null } | undefined | null };

export type SaveStudentBillingContactMutationVariables = Exact<{
  studentId: string;
  input: BillingContactInput;
}>;


export type SaveStudentBillingContactMutation = { saveStudentBillingContact: { id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primary: boolean | undefined | null } | undefined | null };

export type LinkStudentBillingContactMutationVariables = Exact<{
  studentId: string;
  billingContactId: string;
}>;


export type LinkStudentBillingContactMutation = { linkStudentBillingContact: { id: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, prefectureCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, postalCode: string | undefined | null, address: string | undefined | null, note: string | undefined | null, primary: boolean | undefined | null } | undefined | null };

export type CreateStudentContractMutationVariables = Exact<{
  studentId: string;
  input: ContractInput;
}>;


export type CreateStudentContractMutation = { createStudentContract: { id: string | undefined | null, courseType: string | undefined | null, coursePlanName: string | undefined | null, contractStartDate: string | undefined | null, contractEndDate: string | undefined | null, subjectId: string | undefined | null, weeklyLessons: number | undefined | null, preferredWeekday: number | undefined | null, preferredStartTime: string | undefined | null, preferredEndTime: string | undefined | null, monthlyFee: number | undefined | null, discountAmount: number | undefined | null, seatGenerationEligible: boolean | undefined | null, status: string | undefined | null, note: string | undefined | null } | undefined | null };

export type UpdateStudentContractMutationVariables = Exact<{
  contractId: string;
  input: ContractInput;
}>;


export type UpdateStudentContractMutation = { updateStudentContract: { id: string | undefined | null, courseType: string | undefined | null, coursePlanName: string | undefined | null, contractStartDate: string | undefined | null, contractEndDate: string | undefined | null, subjectId: string | undefined | null, weeklyLessons: number | undefined | null, preferredWeekday: number | undefined | null, preferredStartTime: string | undefined | null, preferredEndTime: string | undefined | null, monthlyFee: number | undefined | null, discountAmount: number | undefined | null, seatGenerationEligible: boolean | undefined | null, status: string | undefined | null, note: string | undefined | null } | undefined | null };

export type DeleteStudentContractMutationVariables = Exact<{
  contractId: string;
}>;


export type DeleteStudentContractMutation = { deleteStudentContract: boolean };

export type DeleteStudentGuardianMutationVariables = Exact<{
  studentId: string;
  guardianId: string;
}>;


export type DeleteStudentGuardianMutation = { deleteStudentGuardian: boolean };

export type DeleteStudentMutationVariables = Exact<{
  studentId: string;
}>;


export type DeleteStudentMutation = { deleteStudent: boolean };

export type TeacherFormInitialFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null, note: string | undefined | null };

export type TeacherListItemFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null };

export type TeacherOptionFragment = { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null };

export type TeacherByIdQueryVariables = Exact<{
  teacherId: string;
}>;


export type TeacherByIdQuery = { teacherById: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null, note: string | undefined | null } | undefined | null };

export type TeacherPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: TeacherFilterInput | null | undefined;
}>;


export type TeacherPageQuery = { teacherPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, birthday: string | undefined | null, genderCode: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllTeachersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllTeachersQuery = { allTeachers: Array<{ id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, kana: string | undefined | null, schoolCode: string | undefined | null, schoolName: string | undefined | null, schoolGradeCode: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null } | undefined | null> | undefined | null };

export type CreateTeacherMutationVariables = Exact<{
  input: TeacherInput;
}>;


export type CreateTeacherMutation = { createTeacher: { id: string | undefined | null } | undefined | null };

export type UpdateTeacherMutationVariables = Exact<{
  teacherId: string;
  input: TeacherInput;
}>;


export type UpdateTeacherMutation = { updateTeacher: { id: string | undefined | null } | undefined | null };

export type DeleteTeacherMutationVariables = Exact<{
  teacherId: string;
}>;


export type DeleteTeacherMutation = { deleteTeacher: boolean };

export const AreaListItemFragmentDoc = gql`
    fragment AreaListItem on Area {
  id
  name
  dispOrder
}
    `;
export const BranchOpeningScheduleTemplateListItemFragmentDoc = gql`
    fragment BranchOpeningScheduleTemplateListItem on BranchOpeningScheduleTemplate {
  id
  name
  note
}
    `;
export const OpeningScheduleDayViewFragmentDoc = gql`
    fragment OpeningScheduleDayView on OpeningScheduleDay {
  weekday
  isOpen
  periods {
    lessonPeriodId
  }
}
    `;
export const BranchOpeningScheduleTemplateDetailViewFragmentDoc = gql`
    fragment BranchOpeningScheduleTemplateDetailView on BranchOpeningScheduleTemplateDetail {
  id
  name
  note
  days {
    ...OpeningScheduleDayView
  }
}
    ${OpeningScheduleDayViewFragmentDoc}`;
export const BranchLessonPeriodTimeSetListItemFragmentDoc = gql`
    fragment BranchLessonPeriodTimeSetListItem on BranchLessonPeriodTimeSet {
  id
  branchId
  name
  note
}
    `;
export const BranchLessonPeriodTimeSetDetailViewFragmentDoc = gql`
    fragment BranchLessonPeriodTimeSetDetailView on BranchLessonPeriodTimeSetDetail {
  id
  branchId
  name
  note
  times {
    id
    lessonPeriodId
    startTime
    endTime
  }
}
    `;
export const BranchOpeningScheduleListItemFragmentDoc = gql`
    fragment BranchOpeningScheduleListItem on BranchOpeningSchedule {
  id
  branchId
  effectiveFrom
  effectiveTo
  timeSetId
  note
}
    `;
export const BranchOpeningScheduleDetailViewFragmentDoc = gql`
    fragment BranchOpeningScheduleDetailView on BranchOpeningScheduleDetail {
  id
  branchId
  effectiveFrom
  effectiveTo
  timeSetId
  note
  days {
    ...OpeningScheduleDayView
  }
}
    ${OpeningScheduleDayViewFragmentDoc}`;
export const BranchDetailViewFragmentDoc = gql`
    fragment BranchDetailView on Branch {
  id
  areaId
  code
  name
  zipCode
  prefectureCode
  address
  prefecture {
    code
    name
  }
}
    `;
export const BranchListItemFragmentDoc = gql`
    fragment BranchListItem on Branch {
  id
  code
  name
  zipCode
  address
  area {
    id
    name
  }
  prefecture {
    code
    name
  }
}
    `;
export const BranchOptionFragmentDoc = gql`
    fragment BranchOption on Branch {
  id
  code
  name
  prefecture {
    code
    name
    sortOrder
  }
}
    `;
export const EmployeeFormInitialFragmentDoc = gql`
    fragment EmployeeFormInitial on Employee {
  id
  name
  email
  genderCode
  isAdmin
}
    `;
export const EmployeeListItemFragmentDoc = gql`
    fragment EmployeeListItem on Employee {
  id
  name
  email
  genderCode
  isAdmin
  status
}
    `;
export const LeadDetailViewFragmentDoc = gql`
    fragment LeadDetailView on Lead {
  id
  inquiryAt
  branchId
  branch {
    id
    code
    name
    prefecture {
      code
      name
    }
  }
  studentName
  studentKana
  guardianName
  guardianKana
  schoolName
  gradeName
  phone
  email
  channel
  status
  note
  updatedAt
}
    `;
export const LeadListItemFragmentDoc = gql`
    fragment LeadListItem on Lead {
  id
  inquiryAt
  branchId
  branch {
    id
    code
    name
    prefecture {
      code
      name
    }
  }
  studentName
  studentKana
  guardianName
  guardianKana
  schoolName
  gradeName
  phone
  email
  channel
  status
  updatedAt
}
    `;
export const LeadOptionFragmentDoc = gql`
    fragment LeadOption on Lead {
  id
  branchId
  studentName
  guardianName
  schoolName
  status
}
    `;
export const LessonPeriodListItemFragmentDoc = gql`
    fragment LessonPeriodListItem on LessonPeriod {
  id
  name
  dispOrder
}
    `;
export const PrefectureOptionFragmentDoc = gql`
    fragment PrefectureOption on Prefecture {
  code
  name
  sortOrder
}
    `;
export const RelationshipOptionFragmentDoc = gql`
    fragment RelationshipOption on Relationship {
  code
  name
  sortOrder
}
    `;
export const ScheduleEventListItemFragmentDoc = gql`
    fragment ScheduleEventListItem on ScheduleEvent {
  id
  leadId: scheduleSubjectId
  activityType: scheduleType
  activityAt: scheduledAt
  status
  reason
  note
  createdAt
  updatedAt
  subject {
    id
    lead {
      id
      studentName
      guardianName
      schoolName
      status
    }
  }
}
    `;
export const StudentFormInitialFragmentDoc = gql`
    fragment StudentFormInitial on Student {
  id
  code
  name
  kana
  birthday
  genderCode
  branchId
  schoolCode
  schoolName
  schoolGradeCode
  schoolGradeName
  branchLabels {
    name
    primary
  }
  status
  note
  primaryGuardian {
    id
    name
    kana
    relationshipCode
    prefectureCode
    phone
    email
    postalCode
    address
    note
  }
  guardians {
    id
    name
    kana
    relationshipCode
    relationshipName
    prefectureCode
    phone
    email
    postalCode
    address
    note
    primaryContact
  }
  billingContacts {
    id
    name
    kana
    prefectureCode
    phone
    email
    postalCode
    address
    note
    primary
  }
}
    `;
export const StudentListItemFragmentDoc = gql`
    fragment StudentListItem on Student {
  id
  code
  name
  kana
  birthday
  genderCode
  branchId
  schoolCode
  schoolName
  schoolTypeName
  schoolGradeCode
  schoolGradeName
  branchLabels {
    name
    primary
  }
  status
}
    `;
export const StudentOptionFragmentDoc = gql`
    fragment StudentOption on Student {
  id
  code
  name
  kana
  branchId
  schoolCode
  schoolName
  schoolGradeCode
  schoolGradeName
  branchLabels {
    name
    primary
  }
  status
}
    `;
export const BillingContactOptionFragmentDoc = gql`
    fragment BillingContactOption on BillingContact {
  id
  name
  kana
  phone
  email
  postalCode
  address
}
    `;
export const SubjectOptionFragmentDoc = gql`
    fragment SubjectOption on Subject {
  id
  code
  name
}
    `;
export const StudentContractListItemFragmentDoc = gql`
    fragment StudentContractListItem on Contract {
  id
  courseType
  coursePlanName
  contractStartDate
  contractEndDate
  subjectId
  weeklyLessons
  preferredWeekday
  preferredStartTime
  preferredEndTime
  monthlyFee
  discountAmount
  seatGenerationEligible
  status
  note
}
    `;
export const TeacherFormInitialFragmentDoc = gql`
    fragment TeacherFormInitial on Teacher {
  id
  code
  name
  kana
  birthday
  genderCode
  schoolCode
  schoolName
  schoolGradeCode
  phone
  email
  status
  note
}
    `;
export const TeacherListItemFragmentDoc = gql`
    fragment TeacherListItem on Teacher {
  id
  code
  name
  kana
  birthday
  genderCode
  schoolCode
  schoolName
  schoolGradeCode
  phone
  email
  status
}
    `;
export const TeacherOptionFragmentDoc = gql`
    fragment TeacherOption on Teacher {
  id
  code
  name
  kana
  schoolCode
  schoolName
  schoolGradeCode
  phone
  email
  status
}
    `;
export const AllAreasDocument = gql`
    query allAreas {
  allAreas {
    ...AreaListItem
  }
}
    ${AreaListItemFragmentDoc}`;
export const AreaByIdDocument = gql`
    query areaById($areaId: String!) {
  areaById(areaId: $areaId) {
    ...AreaListItem
  }
}
    ${AreaListItemFragmentDoc}`;
export const AreaPageDocument = gql`
    query areaPage($pagination: Pagination!, $filter: AreaFilterInput) {
  areaPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...AreaListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${AreaListItemFragmentDoc}`;
export const CreateAreaDocument = gql`
    mutation createArea($input: AreaInput!) {
  createArea(input: $input) {
    id
  }
}
    `;
export const UpdateAreaDocument = gql`
    mutation updateArea($areaId: String!, $input: AreaInput!) {
  updateArea(areaId: $areaId, input: $input) {
    id
  }
}
    `;
export const DeleteAreaDocument = gql`
    mutation deleteArea($areaId: String!) {
  deleteArea(areaId: $areaId)
}
    `;
export const UpdateAreaOrdersDocument = gql`
    mutation updateAreaOrders($inputs: [AreaOrderInput!]!) {
  updateAreaOrders(inputs: $inputs)
}
    `;
export const AllBranchOpeningScheduleTemplatesDocument = gql`
    query allBranchOpeningScheduleTemplates {
  allBranchOpeningScheduleTemplates {
    ...BranchOpeningScheduleTemplateListItem
  }
}
    ${BranchOpeningScheduleTemplateListItemFragmentDoc}`;
export const BranchOpeningScheduleTemplateByIdDocument = gql`
    query branchOpeningScheduleTemplateById($templateId: String!) {
  branchOpeningScheduleTemplateById(templateId: $templateId) {
    ...BranchOpeningScheduleTemplateDetailView
  }
}
    ${BranchOpeningScheduleTemplateDetailViewFragmentDoc}`;
export const CreateBranchOpeningScheduleTemplateDocument = gql`
    mutation createBranchOpeningScheduleTemplate($input: BranchOpeningScheduleTemplateInput!) {
  createBranchOpeningScheduleTemplate(input: $input) {
    id
  }
}
    `;
export const UpdateBranchOpeningScheduleTemplateDocument = gql`
    mutation updateBranchOpeningScheduleTemplate($templateId: String!, $input: BranchOpeningScheduleTemplateInput!) {
  updateBranchOpeningScheduleTemplate(templateId: $templateId, input: $input) {
    id
  }
}
    `;
export const DeleteBranchOpeningScheduleTemplateDocument = gql`
    mutation deleteBranchOpeningScheduleTemplate($templateId: String!) {
  deleteBranchOpeningScheduleTemplate(templateId: $templateId)
}
    `;
export const BranchLessonPeriodTimeSetsDocument = gql`
    query branchLessonPeriodTimeSets($branchId: String!) {
  branchLessonPeriodTimeSets(branchId: $branchId) {
    ...BranchLessonPeriodTimeSetListItem
  }
}
    ${BranchLessonPeriodTimeSetListItemFragmentDoc}`;
export const BranchLessonPeriodTimeSetByIdDocument = gql`
    query branchLessonPeriodTimeSetById($timeSetId: String!) {
  branchLessonPeriodTimeSetById(timeSetId: $timeSetId) {
    ...BranchLessonPeriodTimeSetDetailView
  }
}
    ${BranchLessonPeriodTimeSetDetailViewFragmentDoc}`;
export const CreateBranchLessonPeriodTimeSetDocument = gql`
    mutation createBranchLessonPeriodTimeSet($input: BranchLessonPeriodTimeSetInput!) {
  createBranchLessonPeriodTimeSet(input: $input) {
    id
  }
}
    `;
export const UpdateBranchLessonPeriodTimeSetDocument = gql`
    mutation updateBranchLessonPeriodTimeSet($timeSetId: String!, $input: BranchLessonPeriodTimeSetInput!) {
  updateBranchLessonPeriodTimeSet(timeSetId: $timeSetId, input: $input) {
    id
  }
}
    `;
export const DeleteBranchLessonPeriodTimeSetDocument = gql`
    mutation deleteBranchLessonPeriodTimeSet($timeSetId: String!) {
  deleteBranchLessonPeriodTimeSet(timeSetId: $timeSetId)
}
    `;
export const BranchOpeningSchedulesDocument = gql`
    query branchOpeningSchedules($branchId: String!) {
  branchOpeningSchedules(branchId: $branchId) {
    ...BranchOpeningScheduleListItem
  }
}
    ${BranchOpeningScheduleListItemFragmentDoc}`;
export const BranchOpeningScheduleByIdDocument = gql`
    query branchOpeningScheduleById($scheduleId: String!) {
  branchOpeningScheduleById(scheduleId: $scheduleId) {
    ...BranchOpeningScheduleDetailView
  }
}
    ${BranchOpeningScheduleDetailViewFragmentDoc}`;
export const CreateBranchOpeningScheduleDocument = gql`
    mutation createBranchOpeningSchedule($input: BranchOpeningScheduleInput!) {
  createBranchOpeningSchedule(input: $input) {
    id
  }
}
    `;
export const UpdateBranchOpeningScheduleDocument = gql`
    mutation updateBranchOpeningSchedule($scheduleId: String!, $input: BranchOpeningScheduleInput!) {
  updateBranchOpeningSchedule(scheduleId: $scheduleId, input: $input) {
    id
  }
}
    `;
export const DeleteBranchOpeningScheduleDocument = gql`
    mutation deleteBranchOpeningSchedule($scheduleId: String!) {
  deleteBranchOpeningSchedule(scheduleId: $scheduleId)
}
    `;
export const BranchByIdDocument = gql`
    query branchById($branchId: String!) {
  branchById(branchId: $branchId) {
    ...BranchDetailView
  }
}
    ${BranchDetailViewFragmentDoc}`;
export const BranchPageDocument = gql`
    query branchPage($pagination: Pagination!, $filter: BranchFilterInput) {
  branchPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...BranchListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${BranchListItemFragmentDoc}`;
export const AllBranchesDocument = gql`
    query allBranches {
  allBranches {
    ...BranchOption
  }
}
    ${BranchOptionFragmentDoc}`;
export const CreateBranchDocument = gql`
    mutation createBranch($input: BranchInput!) {
  createBranch(input: $input) {
    id
  }
}
    `;
export const UpdateBranchDocument = gql`
    mutation updateBranch($branchId: String!, $input: BranchInput!) {
  updateBranch(branchId: $branchId, input: $input) {
    id
  }
}
    `;
export const DeleteBranchDocument = gql`
    mutation deleteBranch($branchId: String!) {
  deleteBranch(branchId: $branchId)
}
    `;
export const AllEmployeesDocument = gql`
    query allEmployees {
  allEmployees {
    ...EmployeeFormInitial
  }
}
    ${EmployeeFormInitialFragmentDoc}`;
export const EmployeeByIdDocument = gql`
    query employeeById($employeeId: String!) {
  employeeById(employeeId: $employeeId) {
    ...EmployeeFormInitial
  }
}
    ${EmployeeFormInitialFragmentDoc}`;
export const EmployeePageDocument = gql`
    query employeePage($pagination: Pagination!, $filter: EmployeeFilterInput) {
  employeePagination(pagination: $pagination, filter: $filter) {
    contents {
      ...EmployeeListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${EmployeeListItemFragmentDoc}`;
export const CreateEmployeeDocument = gql`
    mutation createEmployee($input: EmployeeInput!) {
  createEmployee(input: $input) {
    id
  }
}
    `;
export const UpdateEmployeeDocument = gql`
    mutation updateEmployee($employeeId: String!, $input: EmployeeInput!) {
  updateEmployee(employeeId: $employeeId, input: $input) {
    id
  }
}
    `;
export const DeleteEmployeeDocument = gql`
    mutation deleteEmployee($employeeId: String!) {
  deleteEmployee(employeeId: $employeeId)
}
    `;
export const UpdateOwnAccountDocument = gql`
    mutation updateOwnAccount($input: OwnAccountUpdateInput!) {
  updateOwnAccount(input: $input) {
    id
    name
    email
  }
}
    `;
export const AllGendersDocument = gql`
    query allGenders {
  allGenders {
    code
    name
    sortOrder
  }
}
    `;
export const IssueEmployeeInviteDocument = gql`
    mutation issueEmployeeInvite($input: EmployeeInviteInput!) {
  issueEmployeeInvite(input: $input) {
    employeeId
    email
    inviteUrl
    expiresAt
  }
}
    `;
export const LeadByIdDocument = gql`
    query leadById($leadId: String!) {
  leadById(leadId: $leadId) {
    ...LeadDetailView
  }
}
    ${LeadDetailViewFragmentDoc}`;
export const LeadPageDocument = gql`
    query leadPage($pagination: Pagination!, $filter: LeadFilterInput) {
  leadPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...LeadListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${LeadListItemFragmentDoc}`;
export const AllLeadsDocument = gql`
    query allLeads {
  allLeads {
    ...LeadOption
  }
}
    ${LeadOptionFragmentDoc}`;
export const CreateLeadDocument = gql`
    mutation createLead($input: LeadInput!) {
  createLead(input: $input) {
    id
  }
}
    `;
export const UpdateLeadDocument = gql`
    mutation updateLead($leadId: String!, $input: LeadInput!) {
  updateLead(leadId: $leadId, input: $input) {
    id
  }
}
    `;
export const DeleteLeadDocument = gql`
    mutation deleteLead($leadId: String!) {
  deleteLead(leadId: $leadId)
}
    `;
export const AllLessonPeriodsDocument = gql`
    query allLessonPeriods {
  allLessonPeriods {
    ...LessonPeriodListItem
  }
}
    ${LessonPeriodListItemFragmentDoc}`;
export const CreateLessonPeriodDocument = gql`
    mutation createLessonPeriod($input: LessonPeriodInput!) {
  createLessonPeriod(input: $input) {
    id
  }
}
    `;
export const UpdateLessonPeriodDocument = gql`
    mutation updateLessonPeriod($lessonPeriodId: String!, $input: LessonPeriodInput!) {
  updateLessonPeriod(lessonPeriodId: $lessonPeriodId, input: $input) {
    id
  }
}
    `;
export const DeleteLessonPeriodDocument = gql`
    mutation deleteLessonPeriod($lessonPeriodId: String!) {
  deleteLessonPeriod(lessonPeriodId: $lessonPeriodId)
}
    `;
export const AllPrefecturesDocument = gql`
    query allPrefectures {
  allPrefectures {
    ...PrefectureOption
  }
}
    ${PrefectureOptionFragmentDoc}`;
export const AllRelationshipsDocument = gql`
    query allRelationships {
  allRelationships {
    ...RelationshipOption
  }
}
    ${RelationshipOptionFragmentDoc}`;
export const ScheduleEventByIdDocument = gql`
    query scheduleEventById($scheduleEventId: String!) {
  scheduleEventById(scheduleEventId: $scheduleEventId) {
    ...ScheduleEventListItem
  }
}
    ${ScheduleEventListItemFragmentDoc}`;
export const ScheduleEventPageDocument = gql`
    query scheduleEventPage($pagination: Pagination!, $filter: ScheduleEventFilterInput) {
  scheduleEventPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...ScheduleEventListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${ScheduleEventListItemFragmentDoc}`;
export const AllScheduleEventsDocument = gql`
    query allScheduleEvents {
  allScheduleEvents {
    ...ScheduleEventListItem
  }
}
    ${ScheduleEventListItemFragmentDoc}`;
export const AllScheduleEventTypesDocument = gql`
    query allScheduleEventTypes {
  allScheduleEventTypes: allScheduleEventTypes {
    code
    name
    sortOrder
  }
}
    `;
export const AllScheduleEventStatusesDocument = gql`
    query allScheduleEventStatuses {
  allScheduleEventStatuses: allScheduleEventStatuses {
    code
    name
    sortOrder
  }
}
    `;
export const CreateScheduleEventDocument = gql`
    mutation createScheduleEvent($input: ScheduleEventInput!) {
  createScheduleEvent(input: $input) {
    id
  }
}
    `;
export const UpdateScheduleEventDocument = gql`
    mutation updateScheduleEvent($scheduleEventId: String!, $input: ScheduleEventInput!) {
  updateScheduleEvent(scheduleEventId: $scheduleEventId, input: $input) {
    id
  }
}
    `;
export const RescheduleScheduleEventDocument = gql`
    mutation rescheduleScheduleEvent($scheduleEventId: String!, $input: ScheduleEventRescheduleInput!) {
  rescheduleScheduleEvent(scheduleEventId: $scheduleEventId, input: $input) {
    id
  }
}
    `;
export const CancelScheduleEventDocument = gql`
    mutation cancelScheduleEvent($scheduleEventId: String!, $input: ScheduleEventStatusChangeInput!) {
  cancelScheduleEvent(scheduleEventId: $scheduleEventId, input: $input) {
    id
  }
}
    `;
export const CompleteScheduleEventDocument = gql`
    mutation completeScheduleEvent($scheduleEventId: String!, $input: ScheduleEventCompleteInput!) {
  completeScheduleEvent(scheduleEventId: $scheduleEventId, input: $input) {
    id
  }
}
    `;
export const RecordScheduleEventOutcomeDocument = gql`
    mutation recordScheduleEventOutcome($scheduleEventId: String!, $input: ScheduleEventOutcomeInput!) {
  recordScheduleEventOutcome(scheduleEventId: $scheduleEventId, input: $input) {
    id
  }
}
    `;
export const DeleteScheduleEventDocument = gql`
    mutation deleteScheduleEvent($scheduleEventId: String!) {
  deleteScheduleEvent(scheduleEventId: $scheduleEventId)
}
    `;
export const CreateScheduleSubjectDocument = gql`
    mutation createScheduleSubject($input: ScheduleSubjectInput!) {
  createScheduleSubject(input: $input) {
    id
    leadId
    studentId
    teacherId
    guardianId
  }
}
    `;
export const UpdateScheduleSubjectDocument = gql`
    mutation updateScheduleSubject($scheduleSubjectId: String!, $input: ScheduleSubjectInput!) {
  updateScheduleSubject(scheduleSubjectId: $scheduleSubjectId, input: $input) {
    id
    leadId
    studentId
    teacherId
    guardianId
  }
}
    `;
export const SchoolByCodeDocument = gql`
    query schoolByCode($schoolCode: String!) {
  schoolByCode(schoolCode: $schoolCode) {
    code
    name
    prefectureCode
    schoolTypeCode
  }
}
    `;
export const SchoolPaginationDocument = gql`
    query schoolPagination($pagination: Pagination!, $filter: SchoolFilterInput) {
  schoolPagination(pagination: $pagination, filter: $filter) {
    contents {
      code
      name
      prefectureCode
      schoolTypeCode
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    `;
export const AllSchoolGradesDocument = gql`
    query allSchoolGrades {
  allSchoolGrades {
    code
    name
    sortOrder
  }
}
    `;
export const AllSchoolTypesDocument = gql`
    query allSchoolTypes {
  allSchoolTypes {
    code
    name
    sortOrder
  }
}
    `;
export const StudentByIdDocument = gql`
    query studentById($studentId: String!) {
  studentById(studentId: $studentId) {
    ...StudentFormInitial
  }
}
    ${StudentFormInitialFragmentDoc}`;
export const StudentPageDocument = gql`
    query studentPage($pagination: Pagination!, $filter: StudentFilterInput) {
  studentPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...StudentListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${StudentListItemFragmentDoc}`;
export const AllStudentsDocument = gql`
    query allStudents {
  allStudents {
    ...StudentOption
  }
}
    ${StudentOptionFragmentDoc}`;
export const BillingContactOptionsDocument = gql`
    query billingContactOptions($searchText: String) {
  billingContactOptions(searchText: $searchText) {
    ...BillingContactOption
  }
}
    ${BillingContactOptionFragmentDoc}`;
export const SubjectOptionsDocument = gql`
    query subjectOptions {
  subjectOptions {
    ...SubjectOption
  }
}
    ${SubjectOptionFragmentDoc}`;
export const StudentContractsDocument = gql`
    query studentContracts($studentId: String!) {
  contractsByStudentId(studentId: $studentId) {
    ...StudentContractListItem
  }
}
    ${StudentContractListItemFragmentDoc}`;
export const CreateStudentDocument = gql`
    mutation createStudent($input: StudentInput!) {
  createStudent(input: $input) {
    id
  }
}
    `;
export const EnrollLeadDocument = gql`
    mutation enrollLead($leadId: String!, $input: LeadEnrollmentInput!) {
  enrollLead(leadId: $leadId, input: $input) {
    id
  }
}
    `;
export const UpdateStudentDocument = gql`
    mutation updateStudent($studentId: String!, $input: StudentInput!) {
  updateStudent(studentId: $studentId, input: $input) {
    id
  }
}
    `;
export const SaveStudentGuardianDocument = gql`
    mutation saveStudentGuardian($studentId: String!, $input: GuardianInput!) {
  saveStudentGuardian(studentId: $studentId, input: $input) {
    id
    name
    kana
    relationshipCode
    relationshipName
    prefectureCode
    phone
    email
    postalCode
    address
    note
    primaryContact
  }
}
    `;
export const SetPrimaryStudentGuardianDocument = gql`
    mutation setPrimaryStudentGuardian($studentId: String!, $guardianId: String!) {
  setPrimaryStudentGuardian(studentId: $studentId, guardianId: $guardianId) {
    id
    primaryContact
  }
}
    `;
export const SaveStudentBillingContactDocument = gql`
    mutation saveStudentBillingContact($studentId: String!, $input: BillingContactInput!) {
  saveStudentBillingContact(studentId: $studentId, input: $input) {
    id
    name
    kana
    prefectureCode
    phone
    email
    postalCode
    address
    note
    primary
  }
}
    `;
export const LinkStudentBillingContactDocument = gql`
    mutation linkStudentBillingContact($studentId: String!, $billingContactId: String!) {
  linkStudentBillingContact(
    studentId: $studentId
    billingContactId: $billingContactId
  ) {
    id
    name
    kana
    prefectureCode
    phone
    email
    postalCode
    address
    note
    primary
  }
}
    `;
export const CreateStudentContractDocument = gql`
    mutation createStudentContract($studentId: String!, $input: ContractInput!) {
  createStudentContract(studentId: $studentId, input: $input) {
    ...StudentContractListItem
  }
}
    ${StudentContractListItemFragmentDoc}`;
export const UpdateStudentContractDocument = gql`
    mutation updateStudentContract($contractId: String!, $input: ContractInput!) {
  updateStudentContract(contractId: $contractId, input: $input) {
    ...StudentContractListItem
  }
}
    ${StudentContractListItemFragmentDoc}`;
export const DeleteStudentContractDocument = gql`
    mutation deleteStudentContract($contractId: String!) {
  deleteStudentContract(contractId: $contractId)
}
    `;
export const DeleteStudentGuardianDocument = gql`
    mutation deleteStudentGuardian($studentId: String!, $guardianId: String!) {
  deleteStudentGuardian(studentId: $studentId, guardianId: $guardianId)
}
    `;
export const DeleteStudentDocument = gql`
    mutation deleteStudent($studentId: String!) {
  deleteStudent(studentId: $studentId)
}
    `;
export const TeacherByIdDocument = gql`
    query teacherById($teacherId: String!) {
  teacherById(teacherId: $teacherId) {
    ...TeacherFormInitial
  }
}
    ${TeacherFormInitialFragmentDoc}`;
export const TeacherPageDocument = gql`
    query teacherPage($pagination: Pagination!, $filter: TeacherFilterInput) {
  teacherPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...TeacherListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${TeacherListItemFragmentDoc}`;
export const AllTeachersDocument = gql`
    query allTeachers {
  allTeachers {
    ...TeacherOption
  }
}
    ${TeacherOptionFragmentDoc}`;
export const CreateTeacherDocument = gql`
    mutation createTeacher($input: TeacherInput!) {
  createTeacher(input: $input) {
    id
  }
}
    `;
export const UpdateTeacherDocument = gql`
    mutation updateTeacher($teacherId: String!, $input: TeacherInput!) {
  updateTeacher(teacherId: $teacherId, input: $input) {
    id
  }
}
    `;
export const DeleteTeacherDocument = gql`
    mutation deleteTeacher($teacherId: String!) {
  deleteTeacher(teacherId: $teacherId)
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    allAreas(variables?: AllAreasQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllAreasQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllAreasQuery>({ document: AllAreasDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allAreas', 'query', variables);
    },
    areaById(variables: AreaByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AreaByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AreaByIdQuery>({ document: AreaByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'areaById', 'query', variables);
    },
    areaPage(variables: AreaPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AreaPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AreaPageQuery>({ document: AreaPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'areaPage', 'query', variables);
    },
    createArea(variables: CreateAreaMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateAreaMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateAreaMutation>({ document: CreateAreaDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createArea', 'mutation', variables);
    },
    updateArea(variables: UpdateAreaMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateAreaMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAreaMutation>({ document: UpdateAreaDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateArea', 'mutation', variables);
    },
    deleteArea(variables: DeleteAreaMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteAreaMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteAreaMutation>({ document: DeleteAreaDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteArea', 'mutation', variables);
    },
    updateAreaOrders(variables: UpdateAreaOrdersMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateAreaOrdersMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAreaOrdersMutation>({ document: UpdateAreaOrdersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAreaOrders', 'mutation', variables);
    },
    allBranchOpeningScheduleTemplates(variables?: AllBranchOpeningScheduleTemplatesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllBranchOpeningScheduleTemplatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllBranchOpeningScheduleTemplatesQuery>({ document: AllBranchOpeningScheduleTemplatesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allBranchOpeningScheduleTemplates', 'query', variables);
    },
    branchOpeningScheduleTemplateById(variables: BranchOpeningScheduleTemplateByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchOpeningScheduleTemplateByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchOpeningScheduleTemplateByIdQuery>({ document: BranchOpeningScheduleTemplateByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchOpeningScheduleTemplateById', 'query', variables);
    },
    createBranchOpeningScheduleTemplate(variables: CreateBranchOpeningScheduleTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateBranchOpeningScheduleTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateBranchOpeningScheduleTemplateMutation>({ document: CreateBranchOpeningScheduleTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createBranchOpeningScheduleTemplate', 'mutation', variables);
    },
    updateBranchOpeningScheduleTemplate(variables: UpdateBranchOpeningScheduleTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateBranchOpeningScheduleTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateBranchOpeningScheduleTemplateMutation>({ document: UpdateBranchOpeningScheduleTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateBranchOpeningScheduleTemplate', 'mutation', variables);
    },
    deleteBranchOpeningScheduleTemplate(variables: DeleteBranchOpeningScheduleTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteBranchOpeningScheduleTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteBranchOpeningScheduleTemplateMutation>({ document: DeleteBranchOpeningScheduleTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteBranchOpeningScheduleTemplate', 'mutation', variables);
    },
    branchLessonPeriodTimeSets(variables: BranchLessonPeriodTimeSetsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchLessonPeriodTimeSetsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchLessonPeriodTimeSetsQuery>({ document: BranchLessonPeriodTimeSetsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchLessonPeriodTimeSets', 'query', variables);
    },
    branchLessonPeriodTimeSetById(variables: BranchLessonPeriodTimeSetByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchLessonPeriodTimeSetByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchLessonPeriodTimeSetByIdQuery>({ document: BranchLessonPeriodTimeSetByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchLessonPeriodTimeSetById', 'query', variables);
    },
    createBranchLessonPeriodTimeSet(variables: CreateBranchLessonPeriodTimeSetMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateBranchLessonPeriodTimeSetMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateBranchLessonPeriodTimeSetMutation>({ document: CreateBranchLessonPeriodTimeSetDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createBranchLessonPeriodTimeSet', 'mutation', variables);
    },
    updateBranchLessonPeriodTimeSet(variables: UpdateBranchLessonPeriodTimeSetMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateBranchLessonPeriodTimeSetMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateBranchLessonPeriodTimeSetMutation>({ document: UpdateBranchLessonPeriodTimeSetDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateBranchLessonPeriodTimeSet', 'mutation', variables);
    },
    deleteBranchLessonPeriodTimeSet(variables: DeleteBranchLessonPeriodTimeSetMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteBranchLessonPeriodTimeSetMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteBranchLessonPeriodTimeSetMutation>({ document: DeleteBranchLessonPeriodTimeSetDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteBranchLessonPeriodTimeSet', 'mutation', variables);
    },
    branchOpeningSchedules(variables: BranchOpeningSchedulesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchOpeningSchedulesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchOpeningSchedulesQuery>({ document: BranchOpeningSchedulesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchOpeningSchedules', 'query', variables);
    },
    branchOpeningScheduleById(variables: BranchOpeningScheduleByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchOpeningScheduleByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchOpeningScheduleByIdQuery>({ document: BranchOpeningScheduleByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchOpeningScheduleById', 'query', variables);
    },
    createBranchOpeningSchedule(variables: CreateBranchOpeningScheduleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateBranchOpeningScheduleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateBranchOpeningScheduleMutation>({ document: CreateBranchOpeningScheduleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createBranchOpeningSchedule', 'mutation', variables);
    },
    updateBranchOpeningSchedule(variables: UpdateBranchOpeningScheduleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateBranchOpeningScheduleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateBranchOpeningScheduleMutation>({ document: UpdateBranchOpeningScheduleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateBranchOpeningSchedule', 'mutation', variables);
    },
    deleteBranchOpeningSchedule(variables: DeleteBranchOpeningScheduleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteBranchOpeningScheduleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteBranchOpeningScheduleMutation>({ document: DeleteBranchOpeningScheduleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteBranchOpeningSchedule', 'mutation', variables);
    },
    branchById(variables: BranchByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchByIdQuery>({ document: BranchByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchById', 'query', variables);
    },
    branchPage(variables: BranchPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BranchPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BranchPageQuery>({ document: BranchPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'branchPage', 'query', variables);
    },
    allBranches(variables?: AllBranchesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllBranchesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllBranchesQuery>({ document: AllBranchesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allBranches', 'query', variables);
    },
    createBranch(variables: CreateBranchMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateBranchMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateBranchMutation>({ document: CreateBranchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createBranch', 'mutation', variables);
    },
    updateBranch(variables: UpdateBranchMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateBranchMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateBranchMutation>({ document: UpdateBranchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateBranch', 'mutation', variables);
    },
    deleteBranch(variables: DeleteBranchMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteBranchMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteBranchMutation>({ document: DeleteBranchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteBranch', 'mutation', variables);
    },
    allEmployees(variables?: AllEmployeesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllEmployeesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllEmployeesQuery>({ document: AllEmployeesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allEmployees', 'query', variables);
    },
    employeeById(variables: EmployeeByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EmployeeByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<EmployeeByIdQuery>({ document: EmployeeByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'employeeById', 'query', variables);
    },
    employeePage(variables: EmployeePageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EmployeePageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<EmployeePageQuery>({ document: EmployeePageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'employeePage', 'query', variables);
    },
    createEmployee(variables: CreateEmployeeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateEmployeeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateEmployeeMutation>({ document: CreateEmployeeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createEmployee', 'mutation', variables);
    },
    updateEmployee(variables: UpdateEmployeeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateEmployeeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateEmployeeMutation>({ document: UpdateEmployeeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateEmployee', 'mutation', variables);
    },
    deleteEmployee(variables: DeleteEmployeeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteEmployeeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteEmployeeMutation>({ document: DeleteEmployeeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteEmployee', 'mutation', variables);
    },
    updateOwnAccount(variables: UpdateOwnAccountMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateOwnAccountMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateOwnAccountMutation>({ document: UpdateOwnAccountDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateOwnAccount', 'mutation', variables);
    },
    allGenders(variables?: AllGendersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllGendersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllGendersQuery>({ document: AllGendersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allGenders', 'query', variables);
    },
    issueEmployeeInvite(variables: IssueEmployeeInviteMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<IssueEmployeeInviteMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<IssueEmployeeInviteMutation>({ document: IssueEmployeeInviteDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'issueEmployeeInvite', 'mutation', variables);
    },
    leadById(variables: LeadByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LeadByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<LeadByIdQuery>({ document: LeadByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'leadById', 'query', variables);
    },
    leadPage(variables: LeadPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LeadPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<LeadPageQuery>({ document: LeadPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'leadPage', 'query', variables);
    },
    allLeads(variables?: AllLeadsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllLeadsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllLeadsQuery>({ document: AllLeadsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allLeads', 'query', variables);
    },
    createLead(variables: CreateLeadMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateLeadMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateLeadMutation>({ document: CreateLeadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createLead', 'mutation', variables);
    },
    updateLead(variables: UpdateLeadMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateLeadMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateLeadMutation>({ document: UpdateLeadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateLead', 'mutation', variables);
    },
    deleteLead(variables: DeleteLeadMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteLeadMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteLeadMutation>({ document: DeleteLeadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteLead', 'mutation', variables);
    },
    allLessonPeriods(variables?: AllLessonPeriodsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllLessonPeriodsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllLessonPeriodsQuery>({ document: AllLessonPeriodsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allLessonPeriods', 'query', variables);
    },
    createLessonPeriod(variables: CreateLessonPeriodMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateLessonPeriodMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateLessonPeriodMutation>({ document: CreateLessonPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createLessonPeriod', 'mutation', variables);
    },
    updateLessonPeriod(variables: UpdateLessonPeriodMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateLessonPeriodMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateLessonPeriodMutation>({ document: UpdateLessonPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateLessonPeriod', 'mutation', variables);
    },
    deleteLessonPeriod(variables: DeleteLessonPeriodMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteLessonPeriodMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteLessonPeriodMutation>({ document: DeleteLessonPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteLessonPeriod', 'mutation', variables);
    },
    allPrefectures(variables?: AllPrefecturesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllPrefecturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllPrefecturesQuery>({ document: AllPrefecturesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allPrefectures', 'query', variables);
    },
    allRelationships(variables?: AllRelationshipsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllRelationshipsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllRelationshipsQuery>({ document: AllRelationshipsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allRelationships', 'query', variables);
    },
    scheduleEventById(variables: ScheduleEventByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ScheduleEventByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ScheduleEventByIdQuery>({ document: ScheduleEventByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'scheduleEventById', 'query', variables);
    },
    scheduleEventPage(variables: ScheduleEventPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ScheduleEventPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ScheduleEventPageQuery>({ document: ScheduleEventPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'scheduleEventPage', 'query', variables);
    },
    allScheduleEvents(variables?: AllScheduleEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllScheduleEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllScheduleEventsQuery>({ document: AllScheduleEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allScheduleEvents', 'query', variables);
    },
    allScheduleEventTypes(variables?: AllScheduleEventTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllScheduleEventTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllScheduleEventTypesQuery>({ document: AllScheduleEventTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allScheduleEventTypes', 'query', variables);
    },
    allScheduleEventStatuses(variables?: AllScheduleEventStatusesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllScheduleEventStatusesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllScheduleEventStatusesQuery>({ document: AllScheduleEventStatusesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allScheduleEventStatuses', 'query', variables);
    },
    createScheduleEvent(variables: CreateScheduleEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateScheduleEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateScheduleEventMutation>({ document: CreateScheduleEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createScheduleEvent', 'mutation', variables);
    },
    updateScheduleEvent(variables: UpdateScheduleEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateScheduleEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateScheduleEventMutation>({ document: UpdateScheduleEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateScheduleEvent', 'mutation', variables);
    },
    rescheduleScheduleEvent(variables: RescheduleScheduleEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RescheduleScheduleEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RescheduleScheduleEventMutation>({ document: RescheduleScheduleEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'rescheduleScheduleEvent', 'mutation', variables);
    },
    cancelScheduleEvent(variables: CancelScheduleEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CancelScheduleEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CancelScheduleEventMutation>({ document: CancelScheduleEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'cancelScheduleEvent', 'mutation', variables);
    },
    completeScheduleEvent(variables: CompleteScheduleEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CompleteScheduleEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CompleteScheduleEventMutation>({ document: CompleteScheduleEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'completeScheduleEvent', 'mutation', variables);
    },
    recordScheduleEventOutcome(variables: RecordScheduleEventOutcomeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordScheduleEventOutcomeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordScheduleEventOutcomeMutation>({ document: RecordScheduleEventOutcomeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'recordScheduleEventOutcome', 'mutation', variables);
    },
    deleteScheduleEvent(variables: DeleteScheduleEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteScheduleEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteScheduleEventMutation>({ document: DeleteScheduleEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteScheduleEvent', 'mutation', variables);
    },
    createScheduleSubject(variables: CreateScheduleSubjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateScheduleSubjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateScheduleSubjectMutation>({ document: CreateScheduleSubjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createScheduleSubject', 'mutation', variables);
    },
    updateScheduleSubject(variables: UpdateScheduleSubjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateScheduleSubjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateScheduleSubjectMutation>({ document: UpdateScheduleSubjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateScheduleSubject', 'mutation', variables);
    },
    schoolByCode(variables: SchoolByCodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SchoolByCodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SchoolByCodeQuery>({ document: SchoolByCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'schoolByCode', 'query', variables);
    },
    schoolPagination(variables: SchoolPaginationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SchoolPaginationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SchoolPaginationQuery>({ document: SchoolPaginationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'schoolPagination', 'query', variables);
    },
    allSchoolGrades(variables?: AllSchoolGradesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllSchoolGradesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllSchoolGradesQuery>({ document: AllSchoolGradesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allSchoolGrades', 'query', variables);
    },
    allSchoolTypes(variables?: AllSchoolTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllSchoolTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllSchoolTypesQuery>({ document: AllSchoolTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allSchoolTypes', 'query', variables);
    },
    studentById(variables: StudentByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StudentByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<StudentByIdQuery>({ document: StudentByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'studentById', 'query', variables);
    },
    studentPage(variables: StudentPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StudentPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<StudentPageQuery>({ document: StudentPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'studentPage', 'query', variables);
    },
    allStudents(variables?: AllStudentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllStudentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllStudentsQuery>({ document: AllStudentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allStudents', 'query', variables);
    },
    billingContactOptions(variables?: BillingContactOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<BillingContactOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<BillingContactOptionsQuery>({ document: BillingContactOptionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'billingContactOptions', 'query', variables);
    },
    subjectOptions(variables?: SubjectOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SubjectOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubjectOptionsQuery>({ document: SubjectOptionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'subjectOptions', 'query', variables);
    },
    studentContracts(variables: StudentContractsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StudentContractsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<StudentContractsQuery>({ document: StudentContractsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'studentContracts', 'query', variables);
    },
    createStudent(variables: CreateStudentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateStudentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateStudentMutation>({ document: CreateStudentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createStudent', 'mutation', variables);
    },
    enrollLead(variables: EnrollLeadMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EnrollLeadMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EnrollLeadMutation>({ document: EnrollLeadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'enrollLead', 'mutation', variables);
    },
    updateStudent(variables: UpdateStudentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateStudentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateStudentMutation>({ document: UpdateStudentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateStudent', 'mutation', variables);
    },
    saveStudentGuardian(variables: SaveStudentGuardianMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveStudentGuardianMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveStudentGuardianMutation>({ document: SaveStudentGuardianDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'saveStudentGuardian', 'mutation', variables);
    },
    setPrimaryStudentGuardian(variables: SetPrimaryStudentGuardianMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetPrimaryStudentGuardianMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetPrimaryStudentGuardianMutation>({ document: SetPrimaryStudentGuardianDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'setPrimaryStudentGuardian', 'mutation', variables);
    },
    saveStudentBillingContact(variables: SaveStudentBillingContactMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveStudentBillingContactMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveStudentBillingContactMutation>({ document: SaveStudentBillingContactDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'saveStudentBillingContact', 'mutation', variables);
    },
    linkStudentBillingContact(variables: LinkStudentBillingContactMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LinkStudentBillingContactMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LinkStudentBillingContactMutation>({ document: LinkStudentBillingContactDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'linkStudentBillingContact', 'mutation', variables);
    },
    createStudentContract(variables: CreateStudentContractMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateStudentContractMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateStudentContractMutation>({ document: CreateStudentContractDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createStudentContract', 'mutation', variables);
    },
    updateStudentContract(variables: UpdateStudentContractMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateStudentContractMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateStudentContractMutation>({ document: UpdateStudentContractDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateStudentContract', 'mutation', variables);
    },
    deleteStudentContract(variables: DeleteStudentContractMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteStudentContractMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteStudentContractMutation>({ document: DeleteStudentContractDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteStudentContract', 'mutation', variables);
    },
    deleteStudentGuardian(variables: DeleteStudentGuardianMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteStudentGuardianMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteStudentGuardianMutation>({ document: DeleteStudentGuardianDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteStudentGuardian', 'mutation', variables);
    },
    deleteStudent(variables: DeleteStudentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteStudentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteStudentMutation>({ document: DeleteStudentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteStudent', 'mutation', variables);
    },
    teacherById(variables: TeacherByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TeacherByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<TeacherByIdQuery>({ document: TeacherByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'teacherById', 'query', variables);
    },
    teacherPage(variables: TeacherPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TeacherPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<TeacherPageQuery>({ document: TeacherPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'teacherPage', 'query', variables);
    },
    allTeachers(variables?: AllTeachersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllTeachersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllTeachersQuery>({ document: AllTeachersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allTeachers', 'query', variables);
    },
    createTeacher(variables: CreateTeacherMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateTeacherMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateTeacherMutation>({ document: CreateTeacherDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createTeacher', 'mutation', variables);
    },
    updateTeacher(variables: UpdateTeacherMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateTeacherMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateTeacherMutation>({ document: UpdateTeacherDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateTeacher', 'mutation', variables);
    },
    deleteTeacher(variables: DeleteTeacherMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteTeacherMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteTeacherMutation>({ document: DeleteTeacherDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteTeacher', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;