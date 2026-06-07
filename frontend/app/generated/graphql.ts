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

export type LeadFilterInput = {
  /** ISO-8601 */
  inquiryAtFrom?: string | null | undefined;
  /** ISO-8601 */
  inquiryAtTo?: string | null | undefined;
  locationId?: string | null | undefined;
  name?: string | null | undefined;
  source?: string | null | undefined;
  status?: string | null | undefined;
};

export type LeadInput = {
  email?: string | null | undefined;
  /** ISO-8601 */
  inquiryAt?: string | null | undefined;
  locationId?: string | null | undefined;
  /** ISO-8601 */
  lostAt?: string | null | undefined;
  lostReason?: string | null | undefined;
  name: string;
  /** ISO-8601 */
  nextContactAt?: string | null | undefined;
  note?: string | null | undefined;
  phone?: string | null | undefined;
  source?: string | null | undefined;
  status: string;
};

export type LocationFilterInput = {
  areaId?: string | null | undefined;
  name?: string | null | undefined;
  prefectureCode?: string | null | undefined;
};

export type LocationInput = {
  address?: string | null | undefined;
  areaId?: string | null | undefined;
  displayOrder?: number | null | undefined;
  isDefault?: boolean | null | undefined;
  name: string;
  prefectureCode?: string | null | undefined;
  zipCode?: string | null | undefined;
};

export type MemberFilterInput = {
  /** ISO-8601 */
  joinedAtFrom?: string | null | undefined;
  /** ISO-8601 */
  joinedAtTo?: string | null | undefined;
  locationId?: string | null | undefined;
  name?: string | null | undefined;
  source?: string | null | undefined;
  status?: string | null | undefined;
};

export type MemberInput = {
  address?: string | null | undefined;
  /** ISO-8601 */
  birthDate?: string | null | undefined;
  email?: string | null | undefined;
  /** ISO-8601 */
  joinedAt: string;
  leadId?: string | null | undefined;
  lineDisplayName?: string | null | undefined;
  locationId: string;
  name: string;
  note?: string | null | undefined;
  phone?: string | null | undefined;
  prefectureCode?: string | null | undefined;
  resignationNote?: string | null | undefined;
  resignationReasonCode?: string | null | undefined;
  /** ISO-8601 */
  resignedAt?: string | null | undefined;
  source?: string | null | undefined;
  status: string;
  zipCode?: string | null | undefined;
};

export type MembershipPlanInput = {
  active?: boolean | null | undefined;
  displayOrder?: number | null | undefined;
  locationId?: string | null | undefined;
  monthlyFee: number;
  name: string;
  note?: string | null | undefined;
};

export type MembershipSubscriptionInput = {
  membershipPlanId: string;
  monthlyFee?: number | null | undefined;
  note?: string | null | undefined;
  /** ISO-8601 */
  startDate: string;
};

export type MembershipSubscriptionUpdateInput = {
  monthlyFee: number;
  note?: string | null | undefined;
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

export type TrialSessionInput = {
  /** ISO-8601 */
  completedAt?: string | null | undefined;
  leadId: string;
  locationId?: string | null | undefined;
  note?: string | null | undefined;
  /** ISO-8601 */
  scheduledAt: string;
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

export type LeadDetailViewFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, status: string | undefined | null, inquiryAt: string | undefined | null, nextContactAt: string | undefined | null, lostAt: string | undefined | null, lostReason: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null };

export type LeadListItemFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, status: string | undefined | null, inquiryAt: string | undefined | null, nextContactAt: string | undefined | null, lostAt: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null };

export type LeadOptionFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, status: string | undefined | null };

export type LeadByIdQueryVariables = Exact<{
  leadId: string;
}>;


export type LeadByIdQuery = { leadById: { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, status: string | undefined | null, inquiryAt: string | undefined | null, nextContactAt: string | undefined | null, lostAt: string | undefined | null, lostReason: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type LeadPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: LeadFilterInput | null | undefined;
}>;


export type LeadPageQuery = { leadPagination: { offset: number, limit: number, totalCount: number, totalPages: number, contents: Array<{ id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, status: string | undefined | null, inquiryAt: string | undefined | null, nextContactAt: string | undefined | null, lostAt: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllLeadsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllLeadsQuery = { allLeads: Array<{ id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, status: string | undefined | null } | undefined | null> | undefined | null };

export type CreateLeadMutationVariables = Exact<{
  input: LeadInput;
}>;


export type CreateLeadMutation = { createLead: { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, status: string | undefined | null, inquiryAt: string | undefined | null, nextContactAt: string | undefined | null, lostAt: string | undefined | null, lostReason: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type UpdateLeadMutationVariables = Exact<{
  leadId: string;
  input: LeadInput;
}>;


export type UpdateLeadMutation = { updateLead: { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, status: string | undefined | null, inquiryAt: string | undefined | null, nextContactAt: string | undefined | null, lostAt: string | undefined | null, lostReason: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type DeleteLeadMutationVariables = Exact<{
  leadId: string;
}>;


export type DeleteLeadMutation = { deleteLead: boolean };

export type TrialSessionListItemFragment = { id: string | undefined | null, leadId: string | undefined | null, locationId: string | undefined | null, scheduledAt: string | undefined | null, completedAt: string | undefined | null, status: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null };

export type TrialSessionsByLeadIdQueryVariables = Exact<{
  leadId: string;
}>;


export type TrialSessionsByLeadIdQuery = { trialSessionsByLeadId: Array<{ id: string | undefined | null, leadId: string | undefined | null, locationId: string | undefined | null, scheduledAt: string | undefined | null, completedAt: string | undefined | null, status: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null> | undefined | null };

export type TrialSessionByIdQueryVariables = Exact<{
  trialSessionId: string;
}>;


export type TrialSessionByIdQuery = { trialSessionById: { id: string | undefined | null, leadId: string | undefined | null, locationId: string | undefined | null, scheduledAt: string | undefined | null, completedAt: string | undefined | null, status: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type CreateTrialSessionMutationVariables = Exact<{
  input: TrialSessionInput;
}>;


export type CreateTrialSessionMutation = { createTrialSession: { id: string | undefined | null, leadId: string | undefined | null, locationId: string | undefined | null, scheduledAt: string | undefined | null, completedAt: string | undefined | null, status: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type UpdateTrialSessionMutationVariables = Exact<{
  trialSessionId: string;
  input: TrialSessionInput;
}>;


export type UpdateTrialSessionMutation = { updateTrialSession: { id: string | undefined | null, leadId: string | undefined | null, locationId: string | undefined | null, scheduledAt: string | undefined | null, completedAt: string | undefined | null, status: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type DeleteTrialSessionMutationVariables = Exact<{
  trialSessionId: string;
}>;


export type DeleteTrialSessionMutation = { deleteTrialSession: boolean };

export type LocationFormInitialFragment = { id: string | undefined | null, areaId: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, isDefault: boolean | undefined | null, displayOrder: number | undefined | null };

export type LocationListItemFragment = { id: string | undefined | null, areaId: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, isDefault: boolean | undefined | null, displayOrder: number | undefined | null, area: { id: string | undefined | null, name: string | undefined | null } | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null };

export type AllLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllLocationsQuery = { allLocations: Array<{ id: string | undefined | null, areaId: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, isDefault: boolean | undefined | null, displayOrder: number | undefined | null } | undefined | null> | undefined | null };

export type LocationByIdQueryVariables = Exact<{
  locationId: string;
}>;


export type LocationByIdQuery = { locationById: { id: string | undefined | null, areaId: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, isDefault: boolean | undefined | null, displayOrder: number | undefined | null } | undefined | null };

export type LocationPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: LocationFilterInput | null | undefined;
}>;


export type LocationPageQuery = { locationPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, areaId: string | undefined | null, name: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, isDefault: boolean | undefined | null, displayOrder: number | undefined | null, area: { id: string | undefined | null, name: string | undefined | null } | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type CreateLocationMutationVariables = Exact<{
  input: LocationInput;
}>;


export type CreateLocationMutation = { createLocation: { id: string | undefined | null } | undefined | null };

export type UpdateLocationMutationVariables = Exact<{
  locationId: string;
  input: LocationInput;
}>;


export type UpdateLocationMutation = { updateLocation: { id: string | undefined | null } | undefined | null };

export type DeleteLocationMutationVariables = Exact<{
  locationId: string;
}>;


export type DeleteLocationMutation = { deleteLocation: boolean };

export type MemberDetailViewFragment = { id: string | undefined | null, locationId: string | undefined | null, leadId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, resignationReasonCode: string | undefined | null, resignationNote: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, lineDisplayName: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, birthDate: string | undefined | null, source: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null, lead: { id: string | undefined | null, name: string | undefined | null } | undefined | null };

export type MemberListItemFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null };

export type MemberOptionFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, status: string | undefined | null };

export type MemberByIdQueryVariables = Exact<{
  memberId: string;
}>;


export type MemberByIdQuery = { memberById: { id: string | undefined | null, locationId: string | undefined | null, leadId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, resignationReasonCode: string | undefined | null, resignationNote: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, lineDisplayName: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, birthDate: string | undefined | null, source: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null, lead: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type MemberPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: MemberFilterInput | null | undefined;
}>;


export type MemberPageQuery = { memberPagination: { offset: number, limit: number, totalCount: number, totalPages: number, contents: Array<{ id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, source: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllMembersQuery = { allMembers: Array<{ id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, status: string | undefined | null } | undefined | null> | undefined | null };

export type CreateMemberMutationVariables = Exact<{
  input: MemberInput;
}>;


export type CreateMemberMutation = { createMember: { id: string | undefined | null, locationId: string | undefined | null, leadId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, resignationReasonCode: string | undefined | null, resignationNote: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, lineDisplayName: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, birthDate: string | undefined | null, source: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null, lead: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type UpdateMemberMutationVariables = Exact<{
  memberId: string;
  input: MemberInput;
}>;


export type UpdateMemberMutation = { updateMember: { id: string | undefined | null, locationId: string | undefined | null, leadId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, resignationReasonCode: string | undefined | null, resignationNote: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, lineDisplayName: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, birthDate: string | undefined | null, source: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null, lead: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type DeleteMemberMutationVariables = Exact<{
  memberId: string;
}>;


export type DeleteMemberMutation = { deleteMember: boolean };

export type EnrollLeadMutationVariables = Exact<{
  leadId: string;
  input: MemberInput;
  subscription: MembershipSubscriptionInput;
}>;


export type EnrollLeadMutation = { enrollLead: { id: string | undefined | null, locationId: string | undefined | null, leadId: string | undefined | null, name: string | undefined | null, status: string | undefined | null, joinedAt: string | undefined | null, resignedAt: string | undefined | null, resignationReasonCode: string | undefined | null, resignationNote: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, lineDisplayName: string | undefined | null, zipCode: string | undefined | null, prefectureCode: string | undefined | null, address: string | undefined | null, birthDate: string | undefined | null, source: string | undefined | null, note: string | undefined | null, location: { id: string | undefined | null, name: string | undefined | null } | undefined | null, lead: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type MembershipPlanOptionFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, monthlyFee: number | undefined | null, displayOrder: number | undefined | null };

export type MembershipPlanItemFragment = { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, monthlyFee: number | undefined | null, active: boolean | undefined | null, displayOrder: number | undefined | null, note: string | undefined | null };

export type ActiveMembershipPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveMembershipPlansQuery = { activeMembershipPlans: Array<{ id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, monthlyFee: number | undefined | null, displayOrder: number | undefined | null } | undefined | null> | undefined | null };

export type AllMembershipPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type AllMembershipPlansQuery = { allMembershipPlans: Array<{ id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, monthlyFee: number | undefined | null, active: boolean | undefined | null, displayOrder: number | undefined | null, note: string | undefined | null } | undefined | null> | undefined | null };

export type CreateMembershipPlanMutationVariables = Exact<{
  input: MembershipPlanInput;
}>;


export type CreateMembershipPlanMutation = { createMembershipPlan: { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, monthlyFee: number | undefined | null, active: boolean | undefined | null, displayOrder: number | undefined | null, note: string | undefined | null } | undefined | null };

export type UpdateMembershipPlanMutationVariables = Exact<{
  membershipPlanId: string;
  input: MembershipPlanInput;
}>;


export type UpdateMembershipPlanMutation = { updateMembershipPlan: { id: string | undefined | null, locationId: string | undefined | null, name: string | undefined | null, monthlyFee: number | undefined | null, active: boolean | undefined | null, displayOrder: number | undefined | null, note: string | undefined | null } | undefined | null };

export type DeleteMembershipPlanMutationVariables = Exact<{
  membershipPlanId: string;
}>;


export type DeleteMembershipPlanMutation = { deleteMembershipPlan: boolean };

export type MembershipSubscriptionItemFragment = { id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null };

export type MembershipSubscriptionsByMemberIdQueryVariables = Exact<{
  memberId: string;
}>;


export type MembershipSubscriptionsByMemberIdQuery = { membershipSubscriptionsByMemberId: Array<{ id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null> | undefined | null };

export type ChangeMembershipPlanMutationVariables = Exact<{
  memberId: string;
  input: MembershipSubscriptionInput;
}>;


export type ChangeMembershipPlanMutation = { changeMembershipPlan: { id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type PauseMembershipSubscriptionMutationVariables = Exact<{
  membershipSubscriptionId: string;
}>;


export type PauseMembershipSubscriptionMutation = { pauseMembershipSubscription: { id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type ResumeMembershipSubscriptionMutationVariables = Exact<{
  membershipSubscriptionId: string;
}>;


export type ResumeMembershipSubscriptionMutation = { resumeMembershipSubscription: { id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type EndMembershipSubscriptionMutationVariables = Exact<{
  membershipSubscriptionId: string;
  endDate: string;
}>;


export type EndMembershipSubscriptionMutation = { endMembershipSubscription: { id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type UpdateMembershipSubscriptionMutationVariables = Exact<{
  membershipSubscriptionId: string;
  input: MembershipSubscriptionUpdateInput;
}>;


export type UpdateMembershipSubscriptionMutation = { updateMembershipSubscription: { id: string | undefined | null, memberId: string | undefined | null, membershipPlanId: string | undefined | null, startDate: string | undefined | null, endDate: string | undefined | null, status: string | undefined | null, monthlyFee: number | undefined | null, note: string | undefined | null, createdAt: string | undefined | null, membershipPlan: { id: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type PrefectureOptionFragment = { code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null };

export type AllPrefecturesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPrefecturesQuery = { allPrefectures: Array<{ code: string | undefined | null, name: string | undefined | null, sortOrder: number | undefined | null } | undefined | null> | undefined | null };

export const AreaListItemFragmentDoc = gql`
    fragment AreaListItem on Area {
  id
  name
  dispOrder: displayOrder
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
  locationId
  location {
    id
    name
  }
  name
  phone
  email
  source
  status
  inquiryAt
  nextContactAt
  lostAt
  lostReason
  note
}
    `;
export const LeadListItemFragmentDoc = gql`
    fragment LeadListItem on Lead {
  id
  locationId
  location {
    id
    name
  }
  name
  phone
  email
  source
  status
  inquiryAt
  nextContactAt
  lostAt
}
    `;
export const LeadOptionFragmentDoc = gql`
    fragment LeadOption on Lead {
  id
  locationId
  name
  status
}
    `;
export const TrialSessionListItemFragmentDoc = gql`
    fragment TrialSessionListItem on TrialSession {
  id
  leadId
  locationId
  location {
    id
    name
  }
  scheduledAt
  completedAt
  status
  note
}
    `;
export const LocationFormInitialFragmentDoc = gql`
    fragment LocationFormInitial on Location {
  id
  areaId
  name
  zipCode
  prefectureCode
  address
  isDefault
  displayOrder
}
    `;
export const LocationListItemFragmentDoc = gql`
    fragment LocationListItem on Location {
  id
  areaId
  name
  zipCode
  prefectureCode
  address
  isDefault
  displayOrder
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
export const MemberDetailViewFragmentDoc = gql`
    fragment MemberDetailView on Member {
  id
  locationId
  location {
    id
    name
  }
  leadId
  lead {
    id
    name
  }
  name
  status
  joinedAt
  resignedAt
  resignationReasonCode
  resignationNote
  phone
  email
  lineDisplayName
  zipCode
  prefectureCode
  address
  birthDate
  source
  note
}
    `;
export const MemberListItemFragmentDoc = gql`
    fragment MemberListItem on Member {
  id
  locationId
  location {
    id
    name
  }
  name
  status
  joinedAt
  resignedAt
  phone
  email
  source
}
    `;
export const MemberOptionFragmentDoc = gql`
    fragment MemberOption on Member {
  id
  locationId
  name
  status
}
    `;
export const MembershipPlanOptionFragmentDoc = gql`
    fragment MembershipPlanOption on MembershipPlan {
  id
  locationId
  name
  monthlyFee
  displayOrder
}
    `;
export const MembershipPlanItemFragmentDoc = gql`
    fragment MembershipPlanItem on MembershipPlan {
  id
  locationId
  name
  monthlyFee
  active
  displayOrder
  note
}
    `;
export const MembershipSubscriptionItemFragmentDoc = gql`
    fragment MembershipSubscriptionItem on MembershipSubscription {
  id
  memberId
  membershipPlanId
  startDate
  endDate
  status
  monthlyFee
  note
  createdAt
  membershipPlan {
    id
    name
  }
}
    `;
export const PrefectureOptionFragmentDoc = gql`
    fragment PrefectureOption on Prefecture {
  code
  name
  sortOrder
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
    offset
    limit
    totalCount
    totalPages
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
    ...LeadDetailView
  }
}
    ${LeadDetailViewFragmentDoc}`;
export const UpdateLeadDocument = gql`
    mutation updateLead($leadId: String!, $input: LeadInput!) {
  updateLead(leadId: $leadId, input: $input) {
    ...LeadDetailView
  }
}
    ${LeadDetailViewFragmentDoc}`;
export const DeleteLeadDocument = gql`
    mutation deleteLead($leadId: String!) {
  deleteLead(leadId: $leadId)
}
    `;
export const TrialSessionsByLeadIdDocument = gql`
    query trialSessionsByLeadId($leadId: String!) {
  trialSessionsByLeadId(leadId: $leadId) {
    ...TrialSessionListItem
  }
}
    ${TrialSessionListItemFragmentDoc}`;
export const TrialSessionByIdDocument = gql`
    query trialSessionById($trialSessionId: String!) {
  trialSessionById(trialSessionId: $trialSessionId) {
    ...TrialSessionListItem
  }
}
    ${TrialSessionListItemFragmentDoc}`;
export const CreateTrialSessionDocument = gql`
    mutation createTrialSession($input: TrialSessionInput!) {
  createTrialSession(input: $input) {
    ...TrialSessionListItem
  }
}
    ${TrialSessionListItemFragmentDoc}`;
export const UpdateTrialSessionDocument = gql`
    mutation updateTrialSession($trialSessionId: String!, $input: TrialSessionInput!) {
  updateTrialSession(trialSessionId: $trialSessionId, input: $input) {
    ...TrialSessionListItem
  }
}
    ${TrialSessionListItemFragmentDoc}`;
export const DeleteTrialSessionDocument = gql`
    mutation deleteTrialSession($trialSessionId: String!) {
  deleteTrialSession(trialSessionId: $trialSessionId)
}
    `;
export const AllLocationsDocument = gql`
    query allLocations {
  allLocations {
    ...LocationFormInitial
  }
}
    ${LocationFormInitialFragmentDoc}`;
export const LocationByIdDocument = gql`
    query locationById($locationId: String!) {
  locationById(locationId: $locationId) {
    ...LocationFormInitial
  }
}
    ${LocationFormInitialFragmentDoc}`;
export const LocationPageDocument = gql`
    query locationPage($pagination: Pagination!, $filter: LocationFilterInput) {
  locationPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...LocationListItem
    }
    totalCount
    totalPages
    limit
    offset
  }
}
    ${LocationListItemFragmentDoc}`;
export const CreateLocationDocument = gql`
    mutation createLocation($input: LocationInput!) {
  createLocation(input: $input) {
    id
  }
}
    `;
export const UpdateLocationDocument = gql`
    mutation updateLocation($locationId: String!, $input: LocationInput!) {
  updateLocation(locationId: $locationId, input: $input) {
    id
  }
}
    `;
export const DeleteLocationDocument = gql`
    mutation deleteLocation($locationId: String!) {
  deleteLocation(locationId: $locationId)
}
    `;
export const MemberByIdDocument = gql`
    query memberById($memberId: String!) {
  memberById(memberId: $memberId) {
    ...MemberDetailView
  }
}
    ${MemberDetailViewFragmentDoc}`;
export const MemberPageDocument = gql`
    query memberPage($pagination: Pagination!, $filter: MemberFilterInput) {
  memberPagination(pagination: $pagination, filter: $filter) {
    contents {
      ...MemberListItem
    }
    offset
    limit
    totalCount
    totalPages
  }
}
    ${MemberListItemFragmentDoc}`;
export const AllMembersDocument = gql`
    query allMembers {
  allMembers {
    ...MemberOption
  }
}
    ${MemberOptionFragmentDoc}`;
export const CreateMemberDocument = gql`
    mutation createMember($input: MemberInput!) {
  createMember(input: $input) {
    ...MemberDetailView
  }
}
    ${MemberDetailViewFragmentDoc}`;
export const UpdateMemberDocument = gql`
    mutation updateMember($memberId: String!, $input: MemberInput!) {
  updateMember(memberId: $memberId, input: $input) {
    ...MemberDetailView
  }
}
    ${MemberDetailViewFragmentDoc}`;
export const DeleteMemberDocument = gql`
    mutation deleteMember($memberId: String!) {
  deleteMember(memberId: $memberId)
}
    `;
export const EnrollLeadDocument = gql`
    mutation enrollLead($leadId: String!, $input: MemberInput!, $subscription: MembershipSubscriptionInput!) {
  enrollLead(leadId: $leadId, input: $input, subscription: $subscription) {
    ...MemberDetailView
  }
}
    ${MemberDetailViewFragmentDoc}`;
export const ActiveMembershipPlansDocument = gql`
    query activeMembershipPlans {
  activeMembershipPlans {
    ...MembershipPlanOption
  }
}
    ${MembershipPlanOptionFragmentDoc}`;
export const AllMembershipPlansDocument = gql`
    query allMembershipPlans {
  allMembershipPlans {
    ...MembershipPlanItem
  }
}
    ${MembershipPlanItemFragmentDoc}`;
export const CreateMembershipPlanDocument = gql`
    mutation createMembershipPlan($input: MembershipPlanInput!) {
  createMembershipPlan(input: $input) {
    ...MembershipPlanItem
  }
}
    ${MembershipPlanItemFragmentDoc}`;
export const UpdateMembershipPlanDocument = gql`
    mutation updateMembershipPlan($membershipPlanId: String!, $input: MembershipPlanInput!) {
  updateMembershipPlan(membershipPlanId: $membershipPlanId, input: $input) {
    ...MembershipPlanItem
  }
}
    ${MembershipPlanItemFragmentDoc}`;
export const DeleteMembershipPlanDocument = gql`
    mutation deleteMembershipPlan($membershipPlanId: String!) {
  deleteMembershipPlan(membershipPlanId: $membershipPlanId)
}
    `;
export const MembershipSubscriptionsByMemberIdDocument = gql`
    query membershipSubscriptionsByMemberId($memberId: String!) {
  membershipSubscriptionsByMemberId(memberId: $memberId) {
    ...MembershipSubscriptionItem
  }
}
    ${MembershipSubscriptionItemFragmentDoc}`;
export const ChangeMembershipPlanDocument = gql`
    mutation changeMembershipPlan($memberId: String!, $input: MembershipSubscriptionInput!) {
  changeMembershipPlan(memberId: $memberId, input: $input) {
    ...MembershipSubscriptionItem
  }
}
    ${MembershipSubscriptionItemFragmentDoc}`;
export const PauseMembershipSubscriptionDocument = gql`
    mutation pauseMembershipSubscription($membershipSubscriptionId: String!) {
  pauseMembershipSubscription(membershipSubscriptionId: $membershipSubscriptionId) {
    ...MembershipSubscriptionItem
  }
}
    ${MembershipSubscriptionItemFragmentDoc}`;
export const ResumeMembershipSubscriptionDocument = gql`
    mutation resumeMembershipSubscription($membershipSubscriptionId: String!) {
  resumeMembershipSubscription(
    membershipSubscriptionId: $membershipSubscriptionId
  ) {
    ...MembershipSubscriptionItem
  }
}
    ${MembershipSubscriptionItemFragmentDoc}`;
export const EndMembershipSubscriptionDocument = gql`
    mutation endMembershipSubscription($membershipSubscriptionId: String!, $endDate: Date!) {
  endMembershipSubscription(
    membershipSubscriptionId: $membershipSubscriptionId
    endDate: $endDate
  ) {
    ...MembershipSubscriptionItem
  }
}
    ${MembershipSubscriptionItemFragmentDoc}`;
export const UpdateMembershipSubscriptionDocument = gql`
    mutation updateMembershipSubscription($membershipSubscriptionId: String!, $input: MembershipSubscriptionUpdateInput!) {
  updateMembershipSubscription(
    membershipSubscriptionId: $membershipSubscriptionId
    input: $input
  ) {
    ...MembershipSubscriptionItem
  }
}
    ${MembershipSubscriptionItemFragmentDoc}`;
export const AllPrefecturesDocument = gql`
    query allPrefectures {
  allPrefectures {
    ...PrefectureOption
  }
}
    ${PrefectureOptionFragmentDoc}`;

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
    trialSessionsByLeadId(variables: TrialSessionsByLeadIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TrialSessionsByLeadIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<TrialSessionsByLeadIdQuery>({ document: TrialSessionsByLeadIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'trialSessionsByLeadId', 'query', variables);
    },
    trialSessionById(variables: TrialSessionByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TrialSessionByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<TrialSessionByIdQuery>({ document: TrialSessionByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'trialSessionById', 'query', variables);
    },
    createTrialSession(variables: CreateTrialSessionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateTrialSessionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateTrialSessionMutation>({ document: CreateTrialSessionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createTrialSession', 'mutation', variables);
    },
    updateTrialSession(variables: UpdateTrialSessionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateTrialSessionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateTrialSessionMutation>({ document: UpdateTrialSessionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateTrialSession', 'mutation', variables);
    },
    deleteTrialSession(variables: DeleteTrialSessionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteTrialSessionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteTrialSessionMutation>({ document: DeleteTrialSessionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteTrialSession', 'mutation', variables);
    },
    allLocations(variables?: AllLocationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllLocationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllLocationsQuery>({ document: AllLocationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allLocations', 'query', variables);
    },
    locationById(variables: LocationByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LocationByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<LocationByIdQuery>({ document: LocationByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'locationById', 'query', variables);
    },
    locationPage(variables: LocationPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LocationPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<LocationPageQuery>({ document: LocationPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'locationPage', 'query', variables);
    },
    createLocation(variables: CreateLocationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateLocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateLocationMutation>({ document: CreateLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createLocation', 'mutation', variables);
    },
    updateLocation(variables: UpdateLocationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateLocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateLocationMutation>({ document: UpdateLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateLocation', 'mutation', variables);
    },
    deleteLocation(variables: DeleteLocationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteLocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteLocationMutation>({ document: DeleteLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteLocation', 'mutation', variables);
    },
    memberById(variables: MemberByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MemberByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MemberByIdQuery>({ document: MemberByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'memberById', 'query', variables);
    },
    memberPage(variables: MemberPageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MemberPageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MemberPageQuery>({ document: MemberPageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'memberPage', 'query', variables);
    },
    allMembers(variables?: AllMembersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllMembersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllMembersQuery>({ document: AllMembersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allMembers', 'query', variables);
    },
    createMember(variables: CreateMemberMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateMemberMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateMemberMutation>({ document: CreateMemberDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createMember', 'mutation', variables);
    },
    updateMember(variables: UpdateMemberMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateMemberMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateMemberMutation>({ document: UpdateMemberDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateMember', 'mutation', variables);
    },
    deleteMember(variables: DeleteMemberMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteMemberMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteMemberMutation>({ document: DeleteMemberDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteMember', 'mutation', variables);
    },
    enrollLead(variables: EnrollLeadMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EnrollLeadMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EnrollLeadMutation>({ document: EnrollLeadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'enrollLead', 'mutation', variables);
    },
    activeMembershipPlans(variables?: ActiveMembershipPlansQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ActiveMembershipPlansQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ActiveMembershipPlansQuery>({ document: ActiveMembershipPlansDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'activeMembershipPlans', 'query', variables);
    },
    allMembershipPlans(variables?: AllMembershipPlansQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllMembershipPlansQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllMembershipPlansQuery>({ document: AllMembershipPlansDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allMembershipPlans', 'query', variables);
    },
    createMembershipPlan(variables: CreateMembershipPlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateMembershipPlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateMembershipPlanMutation>({ document: CreateMembershipPlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'createMembershipPlan', 'mutation', variables);
    },
    updateMembershipPlan(variables: UpdateMembershipPlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateMembershipPlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateMembershipPlanMutation>({ document: UpdateMembershipPlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateMembershipPlan', 'mutation', variables);
    },
    deleteMembershipPlan(variables: DeleteMembershipPlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteMembershipPlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteMembershipPlanMutation>({ document: DeleteMembershipPlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteMembershipPlan', 'mutation', variables);
    },
    membershipSubscriptionsByMemberId(variables: MembershipSubscriptionsByMemberIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MembershipSubscriptionsByMemberIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MembershipSubscriptionsByMemberIdQuery>({ document: MembershipSubscriptionsByMemberIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'membershipSubscriptionsByMemberId', 'query', variables);
    },
    changeMembershipPlan(variables: ChangeMembershipPlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ChangeMembershipPlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ChangeMembershipPlanMutation>({ document: ChangeMembershipPlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'changeMembershipPlan', 'mutation', variables);
    },
    pauseMembershipSubscription(variables: PauseMembershipSubscriptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PauseMembershipSubscriptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PauseMembershipSubscriptionMutation>({ document: PauseMembershipSubscriptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'pauseMembershipSubscription', 'mutation', variables);
    },
    resumeMembershipSubscription(variables: ResumeMembershipSubscriptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ResumeMembershipSubscriptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResumeMembershipSubscriptionMutation>({ document: ResumeMembershipSubscriptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'resumeMembershipSubscription', 'mutation', variables);
    },
    endMembershipSubscription(variables: EndMembershipSubscriptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EndMembershipSubscriptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EndMembershipSubscriptionMutation>({ document: EndMembershipSubscriptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'endMembershipSubscription', 'mutation', variables);
    },
    updateMembershipSubscription(variables: UpdateMembershipSubscriptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateMembershipSubscriptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateMembershipSubscriptionMutation>({ document: UpdateMembershipSubscriptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateMembershipSubscription', 'mutation', variables);
    },
    allPrefectures(variables?: AllPrefecturesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllPrefecturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllPrefecturesQuery>({ document: AllPrefecturesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allPrefectures', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;