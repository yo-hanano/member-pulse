import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { schemaResolver, useForm } from "@mantine/form";
import {
  CalendarCheck,
  CalendarPlus,
  Check,
  CircleSlash,
  Clock,
  Handshake,
  History,
  MessageCircle,
  PencilLine,
  Trash2,
  UserRoundPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRevalidator } from "react-router";
import { z } from "zod";

import type { TrialSessionListItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateTimeYmdHmWithWeekday, toDateTimeLocalValue } from "~/lib/date";
import { LeadHoldModal } from "~/routes/_core+/leads+/$leadId/components/lead-hold-modal";
import { LeadLostModal } from "~/routes/_core+/leads+/$leadId/components/lead-next-action";
import {
  type TrialFollowUpKind,
  TrialFollowUpModal,
} from "~/routes/_core+/leads+/$leadId/components/trial-follow-up-modal";
import type {
  LeadDetailContext,
  clientAction as leadDetailAction,
} from "~/routes/_core+/leads+/$leadId/route";
import {
  buildLeadActivityEntries,
  type LeadActivityEntry,
} from "~/routes/_core+/leads+/lead-activity";
import {
  trialSessionStatusOptions,
  trialSessionStatusValues,
} from "~/routes/_core+/leads+/trial-session-status";

const dateTimeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "日時を入力してください" });

const trialSessionFormSchema = z.object({
  status: z.enum(trialSessionStatusValues),
  scheduledAt: dateTimeSchema,
  note: z.string().max(1000).optional().or(z.literal("")),
});

type TrialSessionForm = z.infer<typeof trialSessionFormSchema>;
type LeadDetailActionData = Awaited<ReturnType<typeof leadDetailAction>>;

// 判断確定後のリードでは、結果記録後のチェーン導線を出さない。
const decidedLeadStatuses = ["contracted", "enrolled", "lost"];

interface Props {
  lead: LeadDetailContext["lead"];
  trialSessions: TrialSessionListItemFragment[];
  /** 親のカード内へ組み込む場合は true。外枠の Paper を描画しない。 */
  embedded?: boolean;
  /** 体験追加モーダルの開閉状態。次のアクションパネル等からも開くため親が持つ。 */
  isCreateOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  /** 編集対象の体験セッション。予定超過の「結果を記録」からも開くため親が持つ。 */
  editSession: TrialSessionListItemFragment | null;
  onEditSessionChange: (session: TrialSessionListItemFragment | null) => void;
}

// リード詳細の概要に埋め込む、体験セッション一覧と操作のセクション。
export function TrialSessionSection({
  lead,
  trialSessions,
  embedded = false,
  isCreateOpen,
  onCreateOpenChange,
  editSession,
  onEditSessionChange,
}: Props) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [deleteSession, setDeleteSession] = useState<TrialSessionListItemFragment | null>(null);
  // 体験結果の保存直後に出す、次アクション選択（チェーン）モーダルの種別。
  const [followUpKind, setFollowUpKind] = useState<TrialFollowUpKind | null>(null);
  const [isHoldOpen, setHoldOpen] = useState(false);
  const [isLostOpen, setLostOpen] = useState(false);
  // 直前にフォームから送信した体験ステータス。保存成功時のチェーン発火判定に使う。
  const submittedStatusRef = useRef<string | null>(null);

  const mutation = useActionFetcher<LeadDetailActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      const submittedStatus = submittedStatusRef.current;
      submittedStatusRef.current = null;
      onCreateOpenChange(false);
      onEditSessionChange(null);
      setDeleteSession(null);
      revalidator.revalidate();
      // 実施済・キャンセルを記録した直後は、その場で次の判断へ繋ぐ。
      if (!decidedLeadStatuses.includes(lead.status ?? "")) {
        if (submittedStatus === "completed") {
          setFollowUpKind("completed");
        } else if (submittedStatus === "canceled" || submittedStatus === "no_show") {
          setFollowUpKind("canceled");
        }
      }
    },
  });

  // チェーンモーダルの「成約にする」や失注モーダルから、リード状態の更新を送信する。
  const statusMutation = useActionFetcher<LeadDetailActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: (data) => {
      setFollowUpKind(null);
      setLostOpen(false);
      revalidator.revalidate();
      // 成約になったら、そのまま入会処理タブへ誘導する。
      if ("lead" in data && data.lead?.status === "contracted") {
        navigate(`/leads/${lead.id}/enrollment`);
      }
    },
  });

  // チェーンモーダルから成約を確定する。
  const submitContract = () => {
    if (!lead.id) return;
    statusMutation.submit({ intent: "updateStatusNote", status: "contracted" }, [
      { leadId: lead.id },
    ]);
  };

  // リード本体と体験セッションから対応履歴タイムラインを合成する。
  const activityEntries = useMemo(
    () => buildLeadActivityEntries(lead, trialSessions),
    [lead, trialSessions],
  );

  // 削除確認から体験セッション削除 intent を送信する。
  const submitDelete = () => {
    if (!lead.id || !deleteSession?.id) return;
    mutation.submit({ intent: "deleteTrialSession", trialSessionId: deleteSession.id }, [
      { leadId: lead.id },
    ]);
  };

  // 一覧・モーダルの本体。embedded 時は外枠なしでそのまま描画する。
  const body = (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon color="brand" radius="sm" variant="light">
              <History size={18} />
            </ThemeIcon>
            <Stack gap={0}>
              <Title order={3} size="h4">
                対応履歴
              </Title>
              <Text c="dimmed" size="sm">
                問い合わせから入会までの対応の記録
              </Text>
            </Stack>
          </Group>
          <Button
            leftSection={<CalendarPlus size={16} />}
            loading={mutation.submitting && isCreateOpen}
            onClick={() => onCreateOpenChange(true)}
          >
            体験を追加
          </Button>
        </Group>

        {activityEntries.length === 0 ? (
          <Text c="dimmed" size="sm">
            対応履歴はまだありません。
          </Text>
        ) : (
          <Timeline active={activityEntries.length - 1} bulletSize={28} lineWidth={2}>
            {activityEntries.map((entry) => (
              <Timeline.Item
                key={entry.key}
                bullet={activityBullet(entry)}
                color={entry.color}
                title={
                  <Group align="flex-start" justify="space-between" gap="sm">
                    <Stack gap={2}>
                      {/* 日時と対応内容は判断の起点になる大切な情報なので、1行目に並べて主役として見せる。 */}
                      <Group gap="xs">
                        {entry.at ? (
                          <Text fw={700} size="md">
                            {formatDateTimeYmdHmWithWeekday(entry.at)}
                          </Text>
                        ) : null}
                        <Badge color={entry.color} radius="sm" size="lg" variant="filled">
                          {entry.label}
                        </Badge>
                      </Group>
                      {entry.kind === "trial" ? (
                        <Text c="dimmed" size="xs">
                          {entry.trialSession?.location?.name ?? "拠点未設定"}
                        </Text>
                      ) : null}
                    </Stack>
                    {entry.trialSession ? (
                      <Group gap="xs" wrap="nowrap">
                        <Tooltip label="編集">
                          <ActionIcon
                            aria-label="体験を編集"
                            variant="subtle"
                            onClick={() =>
                              entry.trialSession && onEditSessionChange(entry.trialSession)
                            }
                          >
                            <PencilLine size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="削除">
                          <ActionIcon
                            aria-label="体験を削除"
                            color="red"
                            variant="subtle"
                            onClick={() =>
                              entry.trialSession && setDeleteSession(entry.trialSession)
                            }
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    ) : null}
                  </Group>
                }
              >
                {entry.note ? (
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {entry.note}
                  </Text>
                ) : null}
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Stack>

      <TrialSessionFormModal
        lead={lead}
        mutation={mutation}
        opened={isCreateOpen}
        title="体験履歴を追加"
        onClose={() => onCreateOpenChange(false)}
        onSubmitted={(status) => {
          submittedStatusRef.current = status;
        }}
      />
      <TrialSessionFormModal
        lead={lead}
        mutation={mutation}
        opened={editSession != null}
        session={editSession}
        title="体験を編集"
        onClose={() => onEditSessionChange(null)}
        onSubmitted={(status) => {
          submittedStatusRef.current = status;
        }}
      />
      <Modal
        centered
        opened={deleteSession != null}
        size="sm"
        title="体験セッションを削除"
        onClose={() => setDeleteSession(null)}
      >
        <Stack gap="md">
          <Text size="sm">この体験セッションを削除します。</Text>
          <Group justify="flex-end">
            <Button
              disabled={mutation.submitting}
              variant="default"
              onClick={() => setDeleteSession(null)}
            >
              キャンセル
            </Button>
            <Button color="red" loading={mutation.submitting} onClick={submitDelete}>
              削除
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 体験結果の保存直後に、その場で次の判断（成約・保留・失注・再予約）へ繋ぐ。 */}
      <TrialFollowUpModal
        contractSubmitting={statusMutation.submitting}
        kind={followUpKind}
        lead={lead}
        onClose={() => setFollowUpKind(null)}
        onContract={submitContract}
        onHold={() => {
          setFollowUpKind(null);
          setHoldOpen(true);
        }}
        onLost={() => {
          setFollowUpKind(null);
          setLostOpen(true);
        }}
        onRebook={() => {
          setFollowUpKind(null);
          onCreateOpenChange(true);
        }}
      />
      {/* 体験済みからは保留、キャンセル後は追客として次回連絡日を設定する。 */}
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
      <LeadLostModal
        lead={lead}
        mutation={statusMutation}
        opened={isLostOpen}
        onClose={() => setLostOpen(false)}
      />
    </>
  );

  if (embedded) {
    return body;
  }

  return (
    <Paper p="lg" radius="sm" shadow="xs" withBorder>
      {body}
    </Paper>
  );
}

interface TrialSessionFormModalProps {
  lead: LeadDetailContext["lead"];
  mutation: ReturnType<typeof useActionFetcher<LeadDetailActionData>>;
  opened: boolean;
  session?: TrialSessionListItemFragment | null;
  title: string;
  onClose: () => void;
  /** 送信した体験ステータスを親へ伝える。保存成功時のチェーン導線判定に使う。 */
  onSubmitted?: (status: string) => void;
}

// 体験セッションの登録・編集フォームを描画するモーダル。
function TrialSessionFormModal({
  lead,
  mutation,
  opened,
  session,
  title,
  onClose,
  onSubmitted,
}: TrialSessionFormModalProps) {
  const form = useForm<TrialSessionForm>({
    initialValues: buildInitialValues(),
    validate: schemaResolver(trialSessionFormSchema, { sync: true }),
  });

  // モーダルを開くたびに、作成または編集対象の値へフォームを戻す。
  useEffect(() => {
    if (!opened) return;
    form.setValues(buildInitialValues(session));
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened, session]);

  const handleSubmit = form.onSubmit((data) => {
    if (!lead.id) return;
    onSubmitted?.(data.status);
    mutation.submit(
      {
        intent: session?.id ? "updateTrialSession" : "createTrialSession",
        trialSessionId: session?.id,
        locationId: lead.locationId || session?.locationId || undefined,
        scheduledAt: dateTimeValueForSubmit(data, session),
        status: data.status,
        note: data.note || undefined,
      },
      [{ leadId: lead.id }],
    );
  });

  return (
    <Modal centered opened={opened} size="lg" title={title} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            {...form.getInputProps("status")}
            data={trialSessionStatusOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            label="イベント"
            withAsterisk
          />
          {form.values.status === "scheduled" ? (
            <DateTimePicker
              label="予約日時"
              placeholder="日時を選択"
              value={toDateTimePickerValue(form.values.scheduledAt)}
              valueFormat="YYYY/MM/DD HH:mm"
              withAsterisk
              onChange={(value) =>
                form.setFieldValue("scheduledAt", fromDateTimePickerValue(value))
              }
            />
          ) : null}
          <Textarea {...form.getInputProps("note")} label="メモ" minRows={4} />
          <Group justify="flex-end">
            <Button disabled={mutation.submitting} variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button loading={mutation.submitting} type="submit">
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function buildInitialValues(session?: TrialSessionListItemFragment | null): TrialSessionForm {
  return {
    status: (session?.status ?? "scheduled") as TrialSessionForm["status"],
    scheduledAt: toDateTimeLocalValue(session?.scheduledAt ?? new Date()),
    note: session?.note ?? "",
  };
}

function toDateTimePickerValue(value: string | null | undefined) {
  if (!value) return null;
  return value.replace("T", " ");
}

function fromDateTimePickerValue(value: string | Date | null | undefined) {
  if (!value) return "";
  return toDateTimeLocalValue(value).slice(0, 16);
}

function trialSessionBullet(status: string | null | undefined) {
  if (status === "completed") return <Check size={14} />;
  if (status === "canceled" || status === "no_show") return <X size={14} />;
  return <CalendarCheck size={14} />;
}

// 対応履歴エントリの種別ごとにタイムラインの bullet アイコンを返す。
function activityBullet(entry: LeadActivityEntry) {
  if (entry.kind === "trial") return trialSessionBullet(entry.trialSession?.status);
  if (entry.kind === "inquiry") return <MessageCircle size={14} />;
  if (entry.kind === "next_contact") return <Clock size={14} />;
  if (entry.kind === "contracted") return <Handshake size={14} />;
  if (entry.kind === "enrolled") return <UserRoundPlus size={14} />;
  return <CircleSlash size={14} />;
}

function dateTimeValueForSubmit(
  data: TrialSessionForm,
  session?: TrialSessionListItemFragment | null,
) {
  if (data.status === "scheduled" || session?.scheduledAt) return data.scheduledAt;
  return toDateTimeLocalValue(new Date());
}
