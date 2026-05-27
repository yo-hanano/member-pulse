import { Anchor, Breadcrumbs, Button, Group, Stack, Text, Title } from "@mantine/core";
import { UserPlus2 } from "lucide-react";
import { useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useNavigation } from "react-router";

import { type EmployeeListItemFragment, getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { EmployeeCreateModal } from "~/routes/_core+/employees+/_index/components/employee-create-modal";
import { EmployeeFiltersPanel } from "~/routes/_core+/employees+/_index/components/employee-filters-panel";
import { EmployeeListTable } from "~/routes/_core+/employees+/_index/components/employee-list-table";
import { getGraphQLClient } from "~/services/graphql-client";

export function meta() {
  return [{ title: "Employees | MemberPulse" }, { name: "description", content: "従業員管理画面" }];
}

// 一覧取得に必要な URL クエリだけを読み取り、ページデータを返す。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const pageNo = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const name = url.searchParams.get("name") || undefined;
  const email = url.searchParams.get("email") || undefined;
  const isAdminParam = url.searchParams.get("is_admin");
  const isAdmin = isAdminParam === "true" ? true : isAdminParam === "false" ? false : undefined;
  const status = url.searchParams.get("status") || undefined;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { employeePagination: employeePage } = await sdk.employeePage({
    pagination: {
      offset: (pageNo - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: {
      name,
      email,
      isAdmin,
      status,
    },
  });

  return { employeePage };
};

// 従業員一覧画面。route は一覧取得と画面の組み立てに集中させる。
export default function EmployeesIndexRoute() {
  const { employeePage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";
  const {
    contents: employees,
    totalPages,
    totalCount,
  } = usePageData<EmployeeListItemFragment>(employeePage);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <Stack gap="lg">
      <Group align="flex-end" justify="space-between">
        <Stack gap={4}>
          <Breadcrumbs>
            <Anchor component={Link} c="dimmed" size="sm" to="/">
              ホーム
            </Anchor>
            <Text c="dimmed" size="sm">
              従業員
            </Text>
          </Breadcrumbs>
          <Title order={2}>従業員一覧</Title>
          <Text c="dimmed" size="sm">
            従業員アカウントと権限を管理します。
          </Text>
        </Stack>
        <Button
          leftSection={<UserPlus2 size={18} />}
          loading={isLoading}
          onClick={() => setIsCreateOpen(true)}
        >
          従業員を追加
        </Button>
      </Group>

      <EmployeeFiltersPanel />

      <EmployeeListTable
        data={employees}
        isProcessing={isLoading}
        totalCount={totalCount}
        totalPages={totalPages}
      />

      <EmployeeCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </Stack>
  );
}
