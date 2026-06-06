import { Anchor, Breadcrumbs, Stack, Tabs, Text, Title } from "@mantine/core";
import {
  type ActionFunctionArgs,
  Link,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router";

import {
  getSdk,
  type LeadDetailViewFragment,
  type LeadInput,
  type TrialSessionInput,
  type TrialSessionListItemFragment,
} from "~/generated/graphql";
import { toDateTimeLocalValue } from "~/lib/date";
import { leadStatusValues } from "~/routes/_core+/leads+/_index/lead-status";
import { LeadPipelineStepper } from "~/routes/_core+/leads+/$leadId/components/lead-pipeline-stepper";
import { trialSessionStatusValues } from "~/routes/_core+/leads+/trial-session-status";
import { getGraphQLClient } from "~/services/graphql-client";

export type LeadDetailContext = {
  lead: LeadDetailViewFragment;
  trialSessions: TrialSessionListItemFragment[];
};

// リード詳細に必要な基本情報と関連する体験セッションを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const [{ leadById }, { trialSessionsByLeadId }] = await Promise.all([
    sdk.leadById({ leadId }),
    sdk.trialSessionsByLeadId({ leadId }),
  ]);

  return {
    lead: leadById,
    trialSessions: (trialSessionsByLeadId ?? []).filter(Boolean),
  };
};

type LeadStatusNoteForm = {
  intent?: "updateStatusNote";
  status?: string;
  note?: string;
  nextContactAt?: string;
  lostAt?: string;
  lostReason?: string;
};

type TrialSessionActionForm = {
  intent: "createTrialSession" | "updateTrialSession" | "deleteTrialSession";
  trialSessionId?: string;
  locationId?: string;
  scheduledAt?: string;
  status?: string;
  note?: string;
};

type LeadDetailActionForm = LeadStatusNoteForm | TrialSessionActionForm;

// リード詳細の概要タブから、状態・メモ更新と体験セッション操作を受け付ける。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const form = (await request.json()) as LeadDetailActionForm;
  const client = getGraphQLClient();
  const sdk = getSdk(client);

  if (form.intent === "createTrialSession" || form.intent === "updateTrialSession") {
    if (
      !form.scheduledAt ||
      !form.status ||
      !trialSessionStatusValues.includes(form.status as (typeof trialSessionStatusValues)[number])
    ) {
      throw new Response("trial session input is invalid", { status: 400 });
    }

    const input: TrialSessionInput = {
      leadId,
      locationId: form.locationId || undefined,
      scheduledAt: form.scheduledAt,
      status: form.status,
      note: form.note || undefined,
    };

    if (form.intent === "createTrialSession") {
      const { createTrialSession } = await sdk.createTrialSession({ input });
      return {
        message: createTrialSession ? "ok" : "ng",
        trialSession: createTrialSession ?? undefined,
        notify: createTrialSession
          ? { type: "success" as const, message: "体験セッションを登録しました" }
          : { type: "error" as const, message: "登録に失敗しました" },
      };
    }

    if (!form.trialSessionId) {
      throw new Response("trialSessionId is required", { status: 400 });
    }
    const { updateTrialSession } = await sdk.updateTrialSession({
      trialSessionId: form.trialSessionId,
      input,
    });
    return {
      message: updateTrialSession ? "ok" : "ng",
      trialSession: updateTrialSession ?? undefined,
      notify: updateTrialSession
        ? { type: "success" as const, message: "体験セッションを更新しました" }
        : { type: "error" as const, message: "更新に失敗しました" },
    };
  }

  if (form.intent === "deleteTrialSession") {
    if (!form.trialSessionId) {
      throw new Response("trialSessionId is required", { status: 400 });
    }
    const { deleteTrialSession } = await sdk.deleteTrialSession({
      trialSessionId: form.trialSessionId,
    });
    return {
      message: deleteTrialSession ? "ok" : "ng",
      notify: deleteTrialSession
        ? { type: "success" as const, message: "体験セッションを削除しました" }
        : { type: "error" as const, message: "削除に失敗しました" },
    };
  }

  // 体験セッション系 intent は処理済みのため、ここからは状態・メモ更新として扱う。
  const statusForm = form as LeadStatusNoteForm;
  if (
    !statusForm.status ||
    !leadStatusValues.includes(statusForm.status as (typeof leadStatusValues)[number])
  ) {
    throw new Response("status is invalid", { status: 400 });
  }

  const { leadById } = await sdk.leadById({ leadId });
  if (!leadById?.name) {
    throw new Response("lead not found", { status: 404 });
  }

  // 不成約にする場合は日時・理由を記録し、不成約以外へ進める場合はクリアする。
  const isLost = statusForm.status === "lost";
  // 成約・入会・不成約で判断が確定したら追客は終わるため、次回連絡日をクリアする。
  const isDecided =
    isLost || statusForm.status === "contracted" || statusForm.status === "enrolled";
  const input: LeadInput = {
    inquiryAt: leadById.inquiryAt || undefined,
    locationId: leadById.locationId || undefined,
    name: leadById.name,
    phone: leadById.phone || undefined,
    email: leadById.email || undefined,
    source: leadById.source || undefined,
    status: statusForm.status,
    // nextContactAt 未指定の更新では既存の次回連絡日を維持する。
    nextContactAt: isDecided
      ? undefined
      : statusForm.nextContactAt !== undefined
        ? statusForm.nextContactAt || undefined
        : leadById.nextContactAt || undefined,
    lostAt: isLost
      ? statusForm.lostAt || leadById.lostAt || toDateTimeLocalValue(new Date())
      : undefined,
    lostReason: isLost ? statusForm.lostReason || leadById.lostReason || undefined : undefined,
    // note 未指定の更新(成約/失注 CTA など)では既存メモを維持する。
    note: statusForm.note !== undefined ? statusForm.note || undefined : leadById.note || undefined,
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
  const { lead: leadData, trialSessions } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const location = useLocation();
  if (!leadData) {
    throw new Response("lead not found", { status: 404 });
  }
  const lead = leadData;

  const basePath = `/leads/${lead.id}`;
  const selectedKey = location.pathname.endsWith("/enrollment") ? "enrollment" : "overview";
  const showEnrollmentTab = lead.status === "contracted" || selectedKey === "enrollment";

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
            見込み客の基本情報と対応履歴を管理します。
          </Text>
        </Stack>

        <LeadPipelineStepper lead={lead} />

        <Tabs
          value={selectedKey}
          onChange={(value) => {
            if (value === "overview") {
              navigate(basePath);
            }
            if (value === "enrollment") {
              navigate(`${basePath}/enrollment`);
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="overview">概要</Tabs.Tab>
            {showEnrollmentTab ? <Tabs.Tab value="enrollment">入会処理</Tabs.Tab> : null}
          </Tabs.List>
        </Tabs>
      </Stack>

      <Outlet context={{ lead, trialSessions }} />
    </Stack>
  );
}
