import { Anchor, Breadcrumbs, Stack, Tabs, Text, Title } from "@mantine/core";
import {
  type ActionFunctionArgs,
  Link,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useNavigate,
} from "react-router";

import { getSdk, type LeadDetailViewFragment, type LeadInput } from "~/generated/graphql";
import { leadStatusValues } from "~/routes/_core+/leads+/_index/lead-status";
import { getGraphQLClient } from "~/services/graphql-client";

export type LeadDetailContext = {
  lead: LeadDetailViewFragment;
};

// リード詳細に必要なデータを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { leadById } = await sdk.leadById({ leadId });

  return {
    lead: leadById,
  };
};

type LeadStatusNoteForm = {
  status?: string;
  note?: string;
};

// リード詳細の概要タブから、状態とメモだけを更新する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const form = (await request.json()) as LeadStatusNoteForm;
  if (
    !form.status ||
    !leadStatusValues.includes(form.status as (typeof leadStatusValues)[number])
  ) {
    throw new Response("status is invalid", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { leadById } = await sdk.leadById({ leadId });
  if (!leadById?.name) {
    throw new Response("lead not found", { status: 404 });
  }

  const input: LeadInput = {
    inquiryAt: leadById.inquiryAt || undefined,
    locationId: leadById.locationId || undefined,
    name: leadById.name,
    phone: leadById.phone || undefined,
    email: leadById.email || undefined,
    source: leadById.source || undefined,
    status: form.status,
    lostAt: leadById.lostAt || undefined,
    lostReason: leadById.lostReason || undefined,
    note: form.note || undefined,
  };
  const { updateLead } = await sdk.updateLead({ leadId, input });

  return {
    message: updateLead ? "ok" : "ng",
    lead: updateLead ?? undefined,
    notify: updateLead
      ? { type: "success" as const, message: "リードの状態とメモを更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};

export function meta() {
  return [{ title: "リード詳細" }, { name: "description", content: "リード詳細" }];
}

// リード詳細レイアウト。タブの選択状態と子ルート描画をまとめる。
export default function LeadDetailRoute() {
  const { lead: leadData } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  if (!leadData) {
    throw new Response("lead not found", { status: 404 });
  }
  const lead = leadData;

  const selectedKey = "overview";
  const basePath = `/leads/${lead.id}`;

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Breadcrumbs>
          <Anchor component={Link} c="dimmed" size="sm" to="/">
            ホーム
          </Anchor>
          <Anchor component={Link} c="dimmed" size="sm" to="/leads">
            リード
          </Anchor>
          <Text c="dimmed" size="sm">
            {lead.name ?? "リード詳細"}
          </Text>
        </Breadcrumbs>

        <Stack gap={4}>
          <Title order={2}>{lead.name ?? "リード詳細"}</Title>
          <Text c="dimmed" size="sm">
            見込み客の基本情報を管理します。
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

      <Outlet context={{ lead }} />
    </Stack>
  );
}
