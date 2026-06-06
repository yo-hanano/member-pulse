import { Alert, Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CircleCheck,
  CircleSlash,
  Clock,
  Handshake,
  Phone,
  PhoneOff,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useNavigate, useRevalidator } from "react-router";
import { z } from "zod";

import type { TrialSessionListItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateTimeYmdHmWithWeekday, toDateTimeLocalValue } from "~/lib/date";
import { LeadHoldModal } from "~/routes/_core+/leads+/$leadId/components/lead-hold-modal";
import type {
  LeadDetailContext,
  clientAction as leadDetailAction,
} from "~/routes/_core+/leads+/$leadId/route";

const lostFormSchema = z.object({
  lostReason: z.string().max(500).optional().or(z.literal("")),
});

type LostForm = z.infer<typeof lostFormSchema>;
type LeadDetailActionData = Awaited<ReturnType<typeof leadDetailAction>>;

interface Props {
  lead: LeadDetailContext["lead"];
  trialSessions: TrialSessionListItemFragment[];
  /** 体験の予約・再予約で体験追加モーダルを開く（概要ページが state を持つ）。 */
  onRebookTrial?: () => void;
  /** 予定日時超過時に、対象の体験を結果記録モーダルで開く。 */
  onRecordTrialResult?: (session: TrialSessionListItemFragment) => void;
}

// リードの状態と体験実績から、次にやるべき対応を促すパネル。状態遷移はすべてここの CTA か体験の記録から行う。
export function LeadNextActionPanel({
  lead,
  trialSessions,
  onRebookTrial,
  onRecordTrialResult,
}: Props) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isContractOpen, setContractOpen] = useState(false);
  const [isLostOpen, setLostOpen] = useState(false);
  // 状態を維持したまま次回連絡日だけ設定・更新する（保留・追客）。
  const [isHoldOpen, setHoldOpen] = useState(false);
  // 不通にする（状態遷移＋次回連絡日の設定）。
  const [isUnreachableOpen, setUnreachableOpen] = useState(false);
  // キャンセル（体験前の失敗）の確認。
  const [isCancelOpen, setCancelOpen] = useState(false);

  const mutation = useActionFetcher<LeadDetailActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: (data) => {
      setContractOpen(false);
      setLostOpen(false);
      setCancelOpen(false);
      revalidator.revalidate();
      // 成約になったら、そのまま入会処理タブへ誘導する。
      if ("lead" in data && data.lead?.status === "contracted") {
        navigate(`/leads/${lead.id}/enrollment`);
      }
    },
  });

  // 成約確定を送信する。メモは action 側で既存値が維持される。
  const submitContract = () => {
    if (!lead.id) return;
    mutation.submit({ intent: "updateStatusNote", status: "contracted" }, [{ leadId: lead.id }]);
  };

  // 体験前の失敗としてキャンセルを記録する。再予約すれば体験予定へ復帰できる。
  const submitCanceled = () => {
    if (!lead.id) return;
    mutation.submit({ intent: "updateStatusNote", status: "canceled" }, [{ leadId: lead.id }]);
  };

  const latestTrialSession = trialSessions[0];
  const nextContactOverdue = lead.nextContactAt
    ? new Date(lead.nextContactAt) <= new Date()
    : false;

  // 状態と体験実績の組み合わせから、表示するガイドを決める。
  let panel: ReactNode = null;

  if (lead.status === "trial_completed" && lead.nextContactAt) {
    // 保留中: 次回連絡日が来たら成約・不成約の判断か連絡日の更新を促す。期日超過は強調する。
    panel = (
      <Alert
        color={nextContactOverdue ? "red" : "yellow"}
        icon={<Clock size={18} />}
        title={
          nextContactOverdue
            ? `次回連絡日を過ぎています（${formatDateTimeYmdHmWithWeekday(lead.nextContactAt)}）`
            : `保留中です（次回連絡日: ${formatDateTimeYmdHmWithWeekday(lead.nextContactAt)}）`
        }
        variant="light"
      >
        <Stack gap="sm">
          <Text size="sm">連絡が取れたら、成約・不成約へ進めるか次回連絡日を更新しましょう。</Text>
          <Group gap="sm">
            <Button
              leftSection={<CircleCheck size={16} />}
              loading={mutation.submitting && isContractOpen}
              onClick={() => setContractOpen(true)}
            >
              成約にする
            </Button>
            <Button
              leftSection={<Clock size={16} />}
              variant="default"
              onClick={() => setHoldOpen(true)}
            >
              次回連絡日を変更
            </Button>
            <Button
              color="red"
              leftSection={<CircleSlash size={16} />}
              variant="light"
              onClick={() => setLostOpen(true)}
            >
              不成約にする
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "trial_completed") {
    panel = (
      <Alert color="teal" icon={<Handshake size={18} />} title="体験実施済みです" variant="light">
        <Stack gap="sm">
          <Text size="sm">体験の結果をふまえて、リードを次の状態へ進めましょう。</Text>
          <Group gap="sm">
            <Button
              leftSection={<CircleCheck size={16} />}
              loading={mutation.submitting && isContractOpen}
              onClick={() => setContractOpen(true)}
            >
              成約にする
            </Button>
            <Button
              leftSection={<Clock size={16} />}
              variant="default"
              onClick={() => setHoldOpen(true)}
            >
              保留にする
            </Button>
            <Button
              color="red"
              leftSection={<CircleSlash size={16} />}
              variant="light"
              onClick={() => setLostOpen(true)}
            >
              不成約にする
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "contracted") {
    return (
      <Alert color="teal" icon={<UserRoundPlus size={18} />} title="成約済みです" variant="light">
        <Stack gap="sm">
          <Text size="sm">入会処理を行うと、リードの情報を引き継いで会員を作成できます。</Text>
          <Group gap="sm">
            <Button
              leftSection={<UserRoundPlus size={16} />}
              onClick={() => navigate(`/leads/${lead.id}/enrollment`)}
            >
              入会処理へ進む
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (
    lead.status === "trial_scheduled" &&
    latestTrialSession?.status === "scheduled" &&
    latestTrialSession.scheduledAt &&
    new Date(latestTrialSession.scheduledAt) < new Date()
  ) {
    // 予定日時を過ぎた体験予約: 結果の記録を促す。
    panel = (
      <Alert
        color="yellow"
        icon={<CalendarClock size={18} />}
        title={`体験予定日時を過ぎています（${formatDateTimeYmdHmWithWeekday(latestTrialSession.scheduledAt)}）`}
        variant="light"
      >
        <Stack gap="sm">
          <Text size="sm">体験の結果（実施済み / キャンセル）を記録しましょう。</Text>
          <Group gap="sm">
            <Button
              leftSection={<CalendarClock size={16} />}
              onClick={() => onRecordTrialResult?.(latestTrialSession)}
            >
              結果を記録
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "trial_scheduled" && latestTrialSession) {
    // 体験予定（期日前）: 予定を確認し、変更・キャンセルは体験の編集から記録できることを示す。
    panel = (
      <Alert
        color="blue"
        icon={<CalendarCheck size={18} />}
        title={`体験予定があります（${formatDateTimeYmdHmWithWeekday(latestTrialSession.scheduledAt)}）`}
        variant="light"
      >
        <Stack gap="sm">
          <Text size="sm">
            実施後に結果を記録しましょう。日程変更やキャンセルも体験の編集から記録できます。
          </Text>
          <Group gap="sm">
            <Button
              leftSection={<CalendarClock size={16} />}
              variant="default"
              onClick={() => onRecordTrialResult?.(latestTrialSession)}
            >
              体験を編集
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "enrolled") {
    // 入会済み: リードとしての対応は完了。会員台帳での管理へ誘導する。
    return (
      <Alert color="green" icon={<Users size={18} />} title="入会済みです" variant="light">
        <Stack gap="sm">
          <Text size="sm">このリードは入会済みです。以降は会員として管理します。</Text>
          <Group gap="sm">
            <Button leftSection={<Users size={16} />} onClick={() => navigate("/members")}>
              会員一覧へ
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "lost") {
    // 不成約: 判断済みの終端。記録内容を確認できるようにする。
    return (
      <Alert
        color="red"
        icon={<CircleSlash size={18} />}
        title={
          lead.lostAt
            ? `不成約です（${formatDateTimeYmdHmWithWeekday(lead.lostAt)}）`
            : "不成約です"
        }
        variant="light"
      >
        <Text size="sm">
          {lead.lostReason ? `理由: ${lead.lostReason}` : "不成約理由は未記録です。"}
        </Text>
      </Alert>
    );
  } else if (lead.status === "canceled") {
    // キャンセル（体験前の失敗）: 再予約か次回連絡日での追客へ誘導する。
    panel = (
      <Alert
        color={nextContactOverdue ? "red" : "gray"}
        icon={<CalendarX size={18} />}
        title={
          nextContactOverdue
            ? `次回連絡日を過ぎています（${formatDateTimeYmdHmWithWeekday(lead.nextContactAt)}）`
            : "キャンセルになっています"
        }
        variant="light"
      >
        <Stack gap="sm">
          <Text size="sm">再予約するか、次回連絡日を決めて追客しましょう。</Text>
          <Group gap="sm">
            <Button leftSection={<CalendarPlus size={16} />} onClick={() => onRebookTrial?.()}>
              次回体験を予約
            </Button>
            <Button
              leftSection={<Clock size={16} />}
              variant="default"
              onClick={() => setHoldOpen(true)}
            >
              次回連絡日を設定
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "unreachable") {
    // 不通: 次回連絡日に再アタックし、つながったら体験予約かキャンセルを記録する。
    panel = (
      <Alert
        color={nextContactOverdue ? "red" : "orange"}
        icon={<PhoneOff size={18} />}
        title={
          lead.nextContactAt
            ? nextContactOverdue
              ? `次回連絡日を過ぎています（${formatDateTimeYmdHmWithWeekday(lead.nextContactAt)}）`
              : `不通です（次回連絡: ${formatDateTimeYmdHmWithWeekday(lead.nextContactAt)}）`
            : "不通です"
        }
        variant="light"
      >
        <Stack gap="sm">
          <Text size="sm">
            再度連絡しましょう。つながったら体験を予約、見込みがなければキャンセルにします。
          </Text>
          <Group gap="sm">
            <Button leftSection={<CalendarPlus size={16} />} onClick={() => onRebookTrial?.()}>
              体験を予約
            </Button>
            <Button
              leftSection={<Clock size={16} />}
              variant="default"
              onClick={() => setHoldOpen(true)}
            >
              連絡日を更新
            </Button>
            <Button
              color="gray"
              leftSection={<X size={16} />}
              variant="light"
              onClick={() => setCancelOpen(true)}
            >
              キャンセルにする
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  } else if (lead.status === "new") {
    // 新規: 連絡して体験日を決める。つながらなければ不通、話が流れたらキャンセルを記録する。
    panel = (
      <Alert color="indigo" icon={<Phone size={18} />} title="新規の問い合わせです" variant="light">
        <Stack gap="sm">
          <Text size="sm">
            連絡を取り、体験の予約を取りましょう。つながらなければ不通を記録します。
          </Text>
          <Group gap="sm">
            <Button leftSection={<CalendarPlus size={16} />} onClick={() => onRebookTrial?.()}>
              体験を予約
            </Button>
            <Button
              leftSection={<PhoneOff size={16} />}
              variant="default"
              onClick={() => setUnreachableOpen(true)}
            >
              不通にする
            </Button>
            <Button
              color="gray"
              leftSection={<X size={16} />}
              variant="light"
              onClick={() => setCancelOpen(true)}
            >
              キャンセルにする
            </Button>
          </Group>
        </Stack>
      </Alert>
    );
  }

  if (!panel) {
    return null;
  }

  return (
    <>
      {panel}

      <Modal
        centered
        opened={isContractOpen}
        size="sm"
        title="成約にする"
        onClose={() => setContractOpen(false)}
      >
        <Stack gap="md">
          <Text size="sm">
            このリードを成約にします。続けて入会処理タブで会員への変換ができます。
          </Text>
          <Group justify="flex-end">
            <Button
              disabled={mutation.submitting}
              variant="default"
              onClick={() => setContractOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              leftSection={<CircleCheck size={16} />}
              loading={mutation.submitting}
              onClick={submitContract}
            >
              成約を確定
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        centered
        opened={isCancelOpen}
        size="sm"
        title="キャンセルにする"
        onClose={() => setCancelOpen(false)}
      >
        <Stack gap="md">
          <Text size="sm">
            このリードをキャンセル（体験前の取り止め）として記録します。再予約すれば復帰できます。
          </Text>
          <Group justify="flex-end">
            <Button
              disabled={mutation.submitting}
              variant="default"
              onClick={() => setCancelOpen(false)}
            >
              戻る
            </Button>
            <Button
              color="gray"
              leftSection={<X size={16} />}
              loading={mutation.submitting}
              onClick={submitCanceled}
            >
              キャンセルを確定
            </Button>
          </Group>
        </Stack>
      </Modal>

      <LeadLostModal
        lead={lead}
        mutation={mutation}
        opened={isLostOpen}
        onClose={() => setLostOpen(false)}
      />
      {/* 状態維持の連絡日設定。保留（体験済み）とキャンセル・不通の追客で文言を変える。 */}
      <LeadHoldModal
        description={
          lead.status === "trial_completed"
            ? "判断を保留し、次に連絡する日時を決めておきます。"
            : "次に連絡する日時を決めておきます。"
        }
        lead={lead}
        opened={isHoldOpen}
        title={lead.status === "trial_completed" ? "保留にする" : "次回連絡日を設定"}
        onClose={() => setHoldOpen(false)}
      />
      {/* 不通への遷移＋次回連絡日の設定。 */}
      <LeadHoldModal
        description="連絡がつきませんでした。次に連絡する日時を決めておきます。"
        lead={lead}
        opened={isUnreachableOpen}
        targetStatus="unreachable"
        title="不通にする"
        onClose={() => setUnreachableOpen(false)}
      />
    </>
  );
}

interface LeadLostModalProps {
  lead: LeadDetailContext["lead"];
  mutation: ReturnType<typeof useActionFetcher<LeadDetailActionData>>;
  opened: boolean;
  onClose: () => void;
}

// 体験後の失敗（不成約）を理由付きで記録するモーダル。
export function LeadLostModal({ lead, mutation, opened, onClose }: LeadLostModalProps) {
  const form = useForm<LostForm>({
    mode: "uncontrolled",
    initialValues: { lostReason: "" },
    validate: schemaResolver(lostFormSchema, { sync: true }),
  });

  // モーダルを開くたびに、現在の不成約理由から入力をやり直せるようにする。
  useEffect(() => {
    if (!opened) return;
    form.setValues({ lostReason: lead.lostReason ?? "" });
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened, lead.lostReason]);

  const handleSubmit = form.onSubmit((data) => {
    if (!lead.id) return;
    mutation.submit(
      {
        intent: "updateStatusNote",
        status: "lost",
        lostAt: toDateTimeLocalValue(new Date()),
        lostReason: data.lostReason || undefined,
      },
      [{ leadId: lead.id }],
    );
  });

  return (
    <Modal centered opened={opened} size="lg" title="不成約にする" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm">このリードを不成約として記録します。</Text>
          <Textarea
            key={form.key("lostReason")}
            {...form.getInputProps("lostReason")}
            label="不成約理由"
            minRows={4}
            placeholder="例: 料金が合わなかった、他スタジオへ入会した など"
          />
          <Group justify="flex-end">
            <Button disabled={mutation.submitting} variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button color="red" loading={mutation.submitting} type="submit">
              不成約を確定
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
