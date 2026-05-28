import { Anchor, Breadcrumbs, Stack, Tabs, Text, Title } from "@mantine/core";
import { Link, type LoaderFunctionArgs, Outlet, useLoaderData, useNavigate } from "react-router";

import { getSdk, type MemberDetailViewFragment } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

export type MemberDetailContext = {
  member: MemberDetailViewFragment;
};

// 会員詳細に必要なデータを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { memberById } = await sdk.memberById({ memberId });

  return {
    member: memberById,
  };
};

export function meta() {
  return [{ title: "会員詳細" }, { name: "description", content: "会員詳細" }];
}

// 会員詳細レイアウト。タブの選択状態と子ルート描画をまとめる。
export default function MemberDetailRoute() {
  const { member: memberData } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  if (!memberData) {
    throw new Response("member not found", { status: 404 });
  }
  const member = memberData;

  const selectedKey = "overview";
  const basePath = `/members/${member.id}`;

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Breadcrumbs>
          <Anchor component={Link} c="dimmed" size="sm" to="/">
            ホーム
          </Anchor>
          <Anchor component={Link} c="dimmed" size="sm" to="/members">
            会員
          </Anchor>
          <Text c="dimmed" size="sm">
            {member.name ?? "会員詳細"}
          </Text>
        </Breadcrumbs>

        <Stack gap={4}>
          <Title order={2}>{member.name ?? "会員詳細"}</Title>
          <Text c="dimmed" size="sm">
            会員の基本情報を確認します。
          </Text>
        </Stack>

        <Tabs
          value={selectedKey}
          onChange={(value) => {
            if (value === "overview") {
              navigate(basePath);
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="overview">概要</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Stack>

      <Outlet context={{ member }} />
    </Stack>
  );
}
