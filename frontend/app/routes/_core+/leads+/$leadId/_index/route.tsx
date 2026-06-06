import {
  Badge,
  Button,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ArrowLeft, PencilLine, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

import type { TrialSessionListItemFragment } from "~/generated/graphql";
import { formatDateTimeYmdHm, formatDateTimeYmdHmWithWeekday } from "~/lib/date";
import { LeadEditModal } from "~/routes/_core+/leads+/_index/components/lead-edit-modal";
import { formatLeadStatus, leadStatusBadgeColor } from "~/routes/_core+/leads+/_index/lead-status";
import { LeadNextActionPanel } from "~/routes/_core+/leads+/$leadId/components/lead-next-action";
import { TrialSessionSection } from "~/routes/_core+/leads+/$leadId/components/trial-session-section";
import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";

// リード詳細の概要タブ。
export default function LeadDetailOverviewRoute() {
  const { lead, trialSessions } = useOutletContext<LeadDetailContext>();
  const navigate = useNavigate();
  // 基本情報の編集は一覧と同じ編集モーダルを使う。状態は対応履歴から導出されるため編集対象に含まれない。
  const [isEditOpen, setEditOpen] = useState(false);
  // 体験の追加・編集モーダルは次のアクションパネルからも開くため、ここで状態を持つ。
  const [isTrialCreateOpen, setTrialCreateOpen] = useState(false);
  const [trialEditSession, setTrialEditSession] = useState<TrialSessionListItemFragment | null>(
    null,
  );

  return (
    <Stack gap="md">
      <Group>
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="default"
          onClick={() => navigate("/leads")}
        >
          一覧へ戻る
        </Button>
      </Group>

      <LeadNextActionPanel
        lead={lead}
        trialSessions={trialSessions}
        onRebookTrial={() => setTrialCreateOpen(true)}
        onRecordTrialResult={(session) => setTrialEditSession(session)}
      />

      {/* 基本情報と対応履歴を 6:4 で1枚のカードに併載し、同じ画面で確認・記録できるようにする。 */}
      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Grid columns={10} gap="xl">
          <Grid.Col span={{ base: 10, lg: 6 }}>
            <Stack gap="md">
              {/* 対応履歴側と同じ構成のヘッダー。更新ボタンもカード内に置く。 */}
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon color="brand" radius="sm" variant="light">
                    <UserRound size={18} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Title order={3} size="h4">
                      基本情報
                    </Title>
                    <Text c="dimmed" size="sm">
                      リードの連絡先と対応状況
                    </Text>
                  </Stack>
                </Group>
                <Button
                  leftSection={<PencilLine size={16} />}
                  variant="default"
                  onClick={() => setEditOpen(true)}
                >
                  基本情報を更新
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Field label="問合せ日" value={formatDateTimeYmdHm(lead.inquiryAt)} />
                <Field label="拠点" value={lead.location?.name ?? "-"} />
                <Field label="氏名" value={lead.name ?? "-"} />
                <Stack gap={4}>
                  <Text fw={600} size="sm">
                    状態
                  </Text>
                  <Badge
                    color={leadStatusBadgeColor(lead.status)}
                    radius="sm"
                    size="lg"
                    variant="light"
                  >
                    {formatLeadStatus(lead.status)}
                  </Badge>
                </Stack>
                {/* 体験の日時は右の対応履歴タイムラインに任せ、ここでは追客の予定だけ示す。 */}
                <Field
                  label="次回連絡日"
                  value={formatDateTimeYmdHmWithWeekday(lead.nextContactAt)}
                />
                <Field label="電話番号" value={lead.phone ?? "-"} />
                <Field label="メールアドレス" value={lead.email ?? "-"} />
                <Field label="流入元" value={lead.source ?? "-"} />
                <Field label="不成約日時" value={formatDateTimeYmdHm(lead.lostAt)} />
                <Field
                  className="md:col-span-2"
                  label="不成約理由"
                  value={lead.lostReason ?? "-"}
                />
                <Field className="md:col-span-2" label="メモ" value={lead.note ?? "-"} />
              </SimpleGrid>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 10, lg: 4 }}>
            <TrialSessionSection
              embedded
              editSession={trialEditSession}
              isCreateOpen={isTrialCreateOpen}
              lead={lead}
              trialSessions={trialSessions}
              onCreateOpenChange={setTrialCreateOpen}
              onEditSessionChange={setTrialEditSession}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <LeadEditModal
        isOpen={isEditOpen}
        leadId={lead.id ? String(lead.id) : null}
        onOpenChange={setEditOpen}
      />
    </Stack>
  );
}

function Field({ className, label, value }: { className?: string; label: string; value: string }) {
  return (
    <Stack className={className} gap={4}>
      {/* 項目名は読み飛ばされないよう、はっきりした濃さ・大きさで見せる。 */}
      <Text fw={600} size="sm">
        {label}
      </Text>
      {/* 値は対応履歴側の日時表示と同じサイズに揃える。 */}
      <Text fw={500} size="md" style={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Text>
    </Stack>
  );
}
