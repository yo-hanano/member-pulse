import {
  Badge,
  Button,
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

import { useMasterPrefectures } from "~/hooks/useMasterData";
import { formatDateYmd } from "~/lib/date";
import { MemberEditModal } from "~/routes/_core+/members+/_index/components/member-edit-modal";
import {
  formatMemberStatus,
  memberStatusBadgeColor,
} from "~/routes/_core+/members+/_index/member-status";
import type { MemberDetailContext } from "~/routes/_core+/members+/$memberId/route";

// 会員詳細の概要タブ。リード詳細とトンマナを揃える。
export default function MemberDetailOverviewRoute() {
  const { member } = useOutletContext<MemberDetailContext>();
  const navigate = useNavigate();
  // 基本情報の編集は一覧と同じ編集モーダルを使う。
  const [isEditOpen, setEditOpen] = useState(false);
  // 都道府県コードを表示名へ変換する。
  const { data: prefectures = [] } = useMasterPrefectures();
  const prefectureName =
    prefectures.find((prefecture) => prefecture.code === member.prefectureCode)?.name ??
    member.prefectureCode ??
    "-";

  return (
    <Stack gap="md">
      <Group>
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="default"
          onClick={() => navigate("/members")}
        >
          一覧へ戻る
        </Button>
      </Group>

      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          {/* リード詳細と同じ構成のヘッダー。更新ボタンもカード内に置く。 */}
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
                  会員の連絡先と在籍状況
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
            <Field label="入会日" value={formatDateYmd(member.joinedAt)} />
            <Field label="拠点" value={member.location?.name ?? "-"} />
            <Field label="氏名" value={member.name ?? "-"} />
            <Stack gap={4}>
              <Text fw={600} size="sm">
                状態
              </Text>
              <Badge
                color={memberStatusBadgeColor(member.status)}
                radius="sm"
                size="lg"
                variant="light"
              >
                {formatMemberStatus(member.status)}
              </Badge>
            </Stack>
            <Field label="電話番号" value={member.phone ?? "-"} />
            <Field label="メールアドレス" value={member.email ?? "-"} />
            <Field label="LINE表示名" value={member.lineDisplayName ?? "-"} />
            <Field label="流入元" value={member.source ?? "-"} />
            <Field label="生年月日" value={formatDateYmd(member.birthDate)} />
            <Field label="変換元リード" value={member.lead?.name ?? member.leadId ?? "-"} />
            <Field label="郵便番号" value={member.zipCode ?? "-"} />
            <Field label="都道府県" value={prefectureName} />
            <Field className="md:col-span-2" label="住所" value={member.address ?? "-"} />
            <Field label="退会日" value={formatDateYmd(member.resignedAt)} />
            <Field label="退会理由コード" value={member.resignationReasonCode ?? "-"} />
            <Field
              className="md:col-span-2"
              label="退会理由メモ"
              value={member.resignationNote ?? "-"}
            />
            <Field className="md:col-span-2" label="メモ" value={member.note ?? "-"} />
          </SimpleGrid>
        </Stack>
      </Paper>

      <MemberEditModal
        isOpen={isEditOpen}
        memberId={member.id ? String(member.id) : null}
        onOpenChange={setEditOpen}
      />
    </Stack>
  );
}

function Field({ className, label, value }: { className?: string; label: string; value: string }) {
  return (
    <Stack className={className} gap={4}>
      {/* 項目名は読み飛ばされないよう、はっきりした濃さ・大きさで見せる（リード詳細と同じ）。 */}
      <Text fw={600} size="sm">
        {label}
      </Text>
      <Text fw={500} size="md" style={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Text>
    </Stack>
  );
}
