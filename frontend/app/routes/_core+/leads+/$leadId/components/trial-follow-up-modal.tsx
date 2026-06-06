import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { CalendarPlus, CalendarX, CircleCheck, CircleSlash, Clock, Handshake } from "lucide-react";

import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";

export type TrialFollowUpKind = "completed" | "canceled";

interface Props {
  lead: LeadDetailContext["lead"];
  /** 直前に記録した体験結果の種別。null のときは閉じる。 */
  kind: TrialFollowUpKind | null;
  /** 成約確定の送信中フラグ（親の statusMutation と連動）。 */
  contractSubmitting: boolean;
  onClose: () => void;
  /** 成約を確定する。 */
  onContract: () => void;
  /** 保留モーダル（次回連絡日設定）を開く。 */
  onHold: () => void;
  /** 失注モーダルを開く。 */
  onLost: () => void;
  /** 次回体験の追加モーダルを開く（キャンセル時のみ）。 */
  onRebook: () => void;
}

// 体験結果を記録した直後に、次の判断（成約・保留・失注・再予約）へその場で繋ぐモーダル。
export function TrialFollowUpModal({
  kind,
  contractSubmitting,
  onClose,
  onContract,
  onHold,
  onLost,
  onRebook,
}: Props) {
  const isCompleted = kind === "completed";

  return (
    <Modal
      centered
      opened={kind != null}
      size="sm"
      title={
        <Group gap="sm">
          <ThemeIcon color={isCompleted ? "teal" : "yellow"} radius="sm" variant="light">
            {isCompleted ? <Handshake size={18} /> : <CalendarX size={18} />}
          </ThemeIcon>
          <Title order={3} size="h4">
            {isCompleted ? "体験を実施済みにしました" : "体験をキャンセルにしました"}
          </Title>
        </Group>
      }
      onClose={onClose}
    >
      <Stack gap="md">
        <Text size="sm">
          {isCompleted
            ? "体験の結果をふまえて、続けて次の対応を選べます。"
            : "リードはキャンセル（体験前の取り止め）になりました。再予約か追客を選べます。"}
        </Text>
        <Stack gap="xs">
          {isCompleted ? (
            <Button
              fullWidth
              leftSection={<CircleCheck size={16} />}
              loading={contractSubmitting}
              onClick={onContract}
            >
              成約にする
            </Button>
          ) : (
            <Button fullWidth leftSection={<CalendarPlus size={16} />} onClick={onRebook}>
              次回体験を予約
            </Button>
          )}
          <Button fullWidth leftSection={<Clock size={16} />} variant="default" onClick={onHold}>
            {isCompleted ? "保留にする（次回連絡日を設定）" : "次回連絡日を設定"}
          </Button>
          {/* 不成約は体験後の判断。キャンセル時は状態が既にキャンセルなので失敗系の追加操作は出さない。 */}
          {isCompleted ? (
            <Button
              color="red"
              fullWidth
              leftSection={<CircleSlash size={16} />}
              variant="light"
              onClick={onLost}
            >
              不成約にする
            </Button>
          ) : null}
          <Button fullWidth variant="subtle" onClick={onClose}>
            あとで判断する
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
