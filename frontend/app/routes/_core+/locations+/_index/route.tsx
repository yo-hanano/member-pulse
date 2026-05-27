import { Anchor, Breadcrumbs, Button, Group, Stack, Text, Title } from "@mantine/core";
import { MapPinPlus } from "lucide-react";
import { useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useNavigation } from "react-router";

import { type LocationListItemFragment, getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { LocationCreateModal } from "~/routes/_core+/locations+/_index/components/location-create-modal";
import { LocationFiltersPanel } from "~/routes/_core+/locations+/_index/components/location-filters-panel";
import { LocationListTable } from "~/routes/_core+/locations+/_index/components/location-list-table";
import { getGraphQLClient } from "~/services/graphql-client";

export function meta() {
  return [{ title: "Locations | MemberPulse" }, { name: "description", content: "拠点管理画面" }];
}

// 一覧取得に必要な URL クエリだけを読み取り、ページデータを返す。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const pageNo = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const name = url.searchParams.get("name") || undefined;
  const areaId = url.searchParams.get("areaId") || undefined;
  const prefectureCode = url.searchParams.get("prefectureCode") || undefined;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { locationPagination: locationPage } = await sdk.locationPage({
    pagination: {
      offset: (pageNo - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: {
      name,
      areaId,
      prefectureCode,
    },
  });

  return { locationPage };
};

// 拠点一覧画面。route は一覧取得と画面の組み立てに集中させる。
export default function LocationsIndexRoute() {
  const { locationPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";
  const {
    contents: locations,
    totalPages,
    totalCount,
  } = usePageData<LocationListItemFragment>(locationPage);
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
              拠点
            </Text>
          </Breadcrumbs>
          <Title order={2}>拠点一覧</Title>
          <Text c="dimmed" size="sm">
            店舗やスタジオなど、会員・見込み客に紐づく拠点を管理します。
          </Text>
        </Stack>
        <Button
          leftSection={<MapPinPlus size={18} />}
          loading={isLoading}
          onClick={() => setIsCreateOpen(true)}
        >
          拠点を追加
        </Button>
      </Group>

      <LocationFiltersPanel />

      <LocationListTable
        data={locations}
        isProcessing={isLoading}
        totalCount={totalCount}
        totalPages={totalPages}
      />

      <LocationCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </Stack>
  );
}
