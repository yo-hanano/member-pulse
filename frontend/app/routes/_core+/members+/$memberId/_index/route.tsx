import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";

import { formatDateYmd } from "~/lib/date";
import {
  formatMemberStatus,
  memberStatusBadgeColor,
} from "~/routes/_core+/members+/_index/member-status";
import type { MemberDetailContext } from "~/routes/_core+/members+/$memberId/route";

// 会員詳細の概要タブ。
export default function MemberDetailOverviewRoute() {
  const { member } = useOutletContext<MemberDetailContext>();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="default"
          onClick={() => navigate("/members")}
        >
          一覧へ戻る
        </Button>
      </Group>

      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Field label="入会日" value={formatDateYmd(member.joinedAt)} />
          <Field label="拠点" value={member.location?.name ?? "-"} />
          <Field label="氏名" value={member.name ?? "-"} />
          <Stack gap={4}>
            <Text c="dimmed" size="xs">
              状態
            </Text>
            <Badge color={memberStatusBadgeColor(member.status)} radius="sm" variant="light">
              {formatMemberStatus(member.status)}
            </Badge>
          </Stack>
          <Field label="電話番号" value={member.phone ?? "-"} />
          <Field label="メールアドレス" value={member.email ?? "-"} />
          <Field label="LINE表示名" value={member.lineDisplayName ?? "-"} />
          <Field label="流入元" value={member.source ?? "-"} />
          <Field label="生年月日" value={formatDateYmd(member.birthDate)} />
          <Field label="退会日" value={formatDateYmd(member.resignedAt)} />
          <Field label="退会理由コード" value={member.resignationReasonCode ?? "-"} />
          <Field label="変換元リード" value={member.lead?.name ?? member.leadId ?? "-"} />
          <Field className="md:col-span-2" label="住所" value={member.address ?? "-"} />
          <Field
            className="md:col-span-2"
            label="退会理由メモ"
            value={member.resignationNote ?? "-"}
          />
          <Field className="md:col-span-2" label="メモ" value={member.note ?? "-"} />
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}

function Field({ className, label, value }: { className?: string; label: string; value: string }) {
  return (
    <Stack className={className} gap={4}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Text fw={500} size="sm" style={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Text>
    </Stack>
  );
}
