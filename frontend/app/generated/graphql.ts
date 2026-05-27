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

export type LeadDetailViewFragment = { id: string | undefined | null, inquiryAt: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null, note: string | undefined | null, updatedAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, channel: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type LeadListItemFragment = { id: string | undefined | null, inquiryAt: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null, updatedAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, channel: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null };

export type LeadOptionFragment = { id: string | undefined | null, status: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null };

export type LeadByIdQueryVariables = Exact<{
  leadId: string;
}>;


export type LeadByIdQuery = { leadById: { id: string | undefined | null, inquiryAt: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null, note: string | undefined | null, updatedAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, channel: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null } | undefined | null };

export type LeadPageQueryVariables = Exact<{
  pagination: Pagination;
  filter?: LeadFilterInput | null | undefined;
}>;


export type LeadPageQuery = { leadPagination: { totalCount: number, totalPages: number, limit: number, offset: number, contents: Array<{ id: string | undefined | null, inquiryAt: string | undefined | null, phone: string | undefined | null, email: string | undefined | null, status: string | undefined | null, updatedAt: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, studentKana: string | undefined | null, guardianName: string | undefined | null, guardianKana: string | undefined | null, schoolName: string | undefined | null, gradeName: string | undefined | null, channel: string | undefined | null, branch: { id: string | undefined | null, code: string | undefined | null, name: string | undefined | null, prefecture: { code: string | undefined | null, name: string | undefined | null } | undefined | null } | undefined | null } | undefined | null> | undefined | null } | undefined | null };

export type AllLeadsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllLeadsQuery = { allLeads: Array<{ id: string | undefined | null, status: string | undefined | null, branchId: string | undefined | null, studentName: string | undefined | null, guardianName: string | undefined | null, schoolName: string | undefined | null } | undefined | null> | undefined | null };

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
  inquiryAt
  branchId: locationId
  branch {
    id
    code
    name
    prefecture {
      code
      name
    }
  }
  studentName: name
  studentKana: name
  guardianName: name
  guardianKana: name
  schoolName: name
  gradeName: source
  phone
  email
  channel: source
  status
  note
  updatedAt
}
    `;
export const LeadListItemFragmentDoc = gql`
    fragment LeadListItem on Lead {
  id
  inquiryAt
  branchId: locationId
  branch {
    id
    code
    name
    prefecture {
      code
      name
    }
  }
  studentName: name
  studentKana: name
  guardianName: name
  guardianKana: name
  schoolName: name
  gradeName: source
  phone
  email
  channel: source
  status
  updatedAt
}
    `;
export const LeadOptionFragmentDoc = gql`
    fragment LeadOption on Lead {
  id
  branchId: locationId
  studentName: name
  guardianName: name
  schoolName: name
  status
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
    allPrefectures(variables?: AllPrefecturesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AllPrefecturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllPrefecturesQuery>({ document: AllPrefecturesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'allPrefectures', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;