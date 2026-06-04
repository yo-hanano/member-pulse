import {
  ActionIcon,
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
import { CalendarCheck, CalendarPlus, Check, PencilLine, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import { z } from "zod";

import type { TrialSessionListItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateTimeYmdHm, toDateTimeLocalValue } from "~/lib/date";
import type {
  LeadDetailContext,
  clientAction as leadDetailAction,
} from "~/routes/_core+/leads+/$leadId/route";
import {
  formatTrialSessionStatus,
  trialSessionStatusBadgeColor,
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

interface Props {
  lead: LeadDetailContext["lead"];
  trialSessions: TrialSessionListItemFragment[];
}

// リード詳細の関連情報として体験セッション一覧と操作を描画する。
export function TrialSessionSection({ lead, trialSessions }: Props) {
  const revalidator = useRevalidator();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editSession, setEditSession] = useState<TrialSessionListItemFragment | null>(null);
  const [deleteSession, setDeleteSession] = useState<TrialSessionListItemFragment | null>(null);

  const mutation = useActionFetcher<LeadDetailActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      setCreateOpen(false);
      setEditSession(null);
      setDeleteSession(null);
      revalidator.revalidate();
    },
  });

  // 削除確認から体験セッション削除 intent を送信する。
  const submitDelete = () => {
    if (!lead.id || !deleteSession?.id) return;
    mutation.submit({ intent: "deleteTrialSession", trialSessionId: deleteSession.id }, [
      { leadId: lead.id },
    ]);
  };

  return (
    <Paper p="lg" radius="sm" shadow="xs" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon color="brand" radius="sm" variant="light">
              <CalendarCheck size={18} />
            </ThemeIcon>
            <Stack gap={0}>
              <Title order={3} size="h4">
                体験セッション
              </Title>
              <Text c="dimmed" size="sm">
                リードに紐づく体験予定と実施結果
              </Text>
            </Stack>
          </Group>
          <Button
            leftSection={<CalendarPlus size={16} />}
            loading={mutation.submitting && isCreateOpen}
            onClick={() => setCreateOpen(true)}
          >
            体験履歴を追加
          </Button>
        </Group>

        {trialSessions.length === 0 ? (
          <Text c="dimmed" size="sm">
            体験セッションはまだ登録されていません。
          </Text>
        ) : (
          <Timeline active={trialSessions.length - 1} bulletSize={28} lineWidth={2}>
            {trialSessions.map((trialSession) => (
              <Timeline.Item
                key={trialSession.id}
                bullet={trialSessionBullet(trialSession.status)}
                color={trialSessionStatusBadgeColor(trialSession.status)}
                title={
                  <Group align="flex-start" justify="space-between" gap="sm">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={600} size="sm">
                          {formatTrialSessionStatus(trialSession.status)}
                        </Text>
                        <Text c="dimmed" size="sm">
                          {formatDateTimeYmdHm(trialSession.scheduledAt)}
                        </Text>
                      </Group>
                      <Text c="dimmed" size="xs">
                        {trialSession.location?.name ?? "拠点未設定"}
                      </Text>
                    </Stack>
                    <Group gap="xs" wrap="nowrap">
                      <Tooltip label="編集">
                        <ActionIcon
                          aria-label="体験セッションを編集"
                          variant="subtle"
                          onClick={() => setEditSession(trialSession)}
                        >
                          <PencilLine size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="削除">
                        <ActionIcon
                          aria-label="体験セッションを削除"
                          color="red"
                          variant="subtle"
                          onClick={() => setDeleteSession(trialSession)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                }
              >
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {trialSession.note || "メモなし"}
                </Text>
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
        onClose={() => setCreateOpen(false)}
      />
      <TrialSessionFormModal
        lead={lead}
        mutation={mutation}
        opened={editSession != null}
        session={editSession}
        title="体験を編集"
        onClose={() => setEditSession(null)}
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
}

// 体験セッションの登録・編集フォームを描画するモーダル。
function TrialSessionFormModal({
  lead,
  mutation,
  opened,
  session,
  title,
  onClose,
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

function dateTimeValueForSubmit(
  data: TrialSessionForm,
  session?: TrialSessionListItemFragment | null,
) {
  if (data.status === "scheduled" || session?.scheduledAt) return data.scheduledAt;
  return toDateTimeLocalValue(new Date());
}
