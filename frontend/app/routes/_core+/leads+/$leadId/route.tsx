import { Breadcrumbs, Tabs } from "@heroui/react";
import { Outlet, type ActionFunctionArgs, type LoaderFunctionArgs, useLoaderData, useLocation, useNavigate } from "react-router";

import { type LeadDetailViewFragment, type LeadInput, getSdk } from "~/generated/graphql";
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
  if (!form.status || !leadStatusValues.includes(form.status as (typeof leadStatusValues)[number])) {
    throw new Response("status is invalid", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { leadById } = await sdk.leadById({ leadId });
  if (!leadById?.inquiryAt || !leadById.studentName) {
    throw new Response("lead not found", { status: 404 });
  }

  const input: LeadInput = {
    inquiryAt: leadById.inquiryAt,
    branchId: leadById.branchId ?? "",
    studentName: leadById.studentName,
    studentKana: leadById.studentKana || undefined,
    guardianName: leadById.guardianName || undefined,
    guardianKana: leadById.guardianKana || undefined,
    schoolName: leadById.schoolName || undefined,
    gradeName: leadById.gradeName || undefined,
    phone: leadById.phone || undefined,
    email: leadById.email || undefined,
    channel: leadById.channel || undefined,
    status: form.status,
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
  const location = useLocation();
  const lead = leadData!;

  const selectedKey = "overview";
  const basePath = `/leads/${lead.id}`;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Breadcrumbs className="text-sm text-muted-foreground">
          <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/leads">リード</Breadcrumbs.Item>
          <Breadcrumbs.Item className="text-foreground">{lead.studentName ?? "リード詳細"}</Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{lead.studentName ?? "リード詳細"}</h1>
            <p className="text-muted-foreground mt-1 text-xs">リードの基本情報を管理します。</p>
          </div>
        </div>

        <Tabs
          className="w-full"
          selectedKey={selectedKey}
          variant="secondary"
          onSelectionChange={(key) => {
            if (key === "overview") {
              navigate(basePath);
            }
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="リード詳細タブ" className="w-fit min-w-max">
              <Tabs.Tab id="overview" className="whitespace-nowrap">
                概要
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      <Outlet context={{ lead }} />
    </section>
  );
}
