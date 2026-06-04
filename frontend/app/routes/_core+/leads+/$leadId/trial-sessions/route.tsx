import { Button, Group, Stack } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";

import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";
import { TrialSessionSection } from "~/routes/_core+/leads+/$leadId/trial-sessions/trial-session-section";

// リード詳細配下の体験セッションタブ。
export default function LeadTrialSessionsRoute() {
  const { lead, trialSessions } = useOutletContext<LeadDetailContext>();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="default"
          onClick={() => navigate("/leads")}
        >
          一覧へ戻る
        </Button>
      </Group>

      <TrialSessionSection lead={lead} trialSessions={trialSessions} />
    </Stack>
  );
}
