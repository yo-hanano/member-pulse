import { Breadcrumbs, Button } from "@heroui/react";
import { UserPlus2 } from "lucide-react";
import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData, useNavigation } from "react-router";

import { type EmployeeListItemFragment, getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { EmployeeCreateModal } from "~/routes/_core+/employees+/_index/components/employee-create-modal";
import { EmployeeFiltersPanel } from "~/routes/_core+/employees+/_index/components/employee-filters-panel";
import { EmployeeListTable } from "~/routes/_core+/employees+/_index/components/employee-list-table";
import { getGraphQLClient } from "~/services/graphql-client";

export function meta() {
  return [{ title: "Employees | Alcos" }, { name: "description", content: "従業員管理画面" }];
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
  const { contents: employees, totalPages, totalCount } = usePageData<EmployeeListItemFragment>(employeePage);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">従業員</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold tracking-tight">従業員一覧</h1>
          <p className="text-muted-foreground mt-1 text-xs">従業員アカウントを管理します。</p>
        </div>
        <Button className="app-primary-button" isDisabled={isLoading} onPress={() => setIsCreateOpen(true)}>
          <UserPlus2 className="size-4" />
          従業員を追加
        </Button>
      </div>

      <EmployeeFiltersPanel />

      <EmployeeListTable data={employees} isProcessing={isLoading} totalCount={totalCount} totalPages={totalPages} />

      <EmployeeCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </section>
  );
}
