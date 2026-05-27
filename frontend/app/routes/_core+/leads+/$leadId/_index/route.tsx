import {
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { ArrowLeft, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useRevalidator } from "react-router";
import { z } from "zod";

import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateTimeYmdHm } from "~/lib/date";
import {
  formatLeadStatus,
  leadStatusBadgeColor,
  leadStatusOptions,
  leadStatusValues,
} from "~/routes/_core+/leads+/_index/lead-status";
import type {
  LeadDetailContext,
  clientAction as updateLeadStatusNoteAction,
} from "~/routes/_core+/leads+/$leadId/route";

const statusNoteSchema = z.object({
  status: z.enum(leadStatusValues),
  note: z.string().max(1000).optional().or(z.literal("")),
});

type StatusNoteForm = z.infer<typeof statusNoteSchema>;
type UpdateLeadStatusNoteActionData = Awaited<ReturnType<typeof updateLeadStatusNoteAction>>;

// リード詳細の概要タブ。
export default function LeadDetailOverviewRoute() {
  const { lead } = useOutletContext<LeadDetailContext>();
  const navigate = useNavigate();
  const [isStatusNoteOpen, setStatusNoteOpen] = useState(false);

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
        <Button
          leftSection={<PencilLine size={16} />}
          variant="default"
          onClick={() => setStatusNoteOpen(true)}
        >
          状態・メモを更新
        </Button>
      </Group>

      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Field label="問合せ日" value={formatDateTimeYmdHm(lead.inquiryAt)} />
          <Field label="拠点" value={lead.location?.name ?? "-"} />
          <Field label="氏名" value={lead.name ?? "-"} />
          <Stack gap={4}>
            <Text c="dimmed" size="xs">
              状態
            </Text>
            <Badge color={leadStatusBadgeColor(lead.status)} radius="sm" variant="light">
              {formatLeadStatus(lead.status)}
            </Badge>
          </Stack>
          <Field label="電話番号" value={lead.phone ?? "-"} />
          <Field label="メールアドレス" value={lead.email ?? "-"} />
          <Field label="流入元" value={lead.source ?? "-"} />
          <Field label="失注日時" value={formatDateTimeYmdHm(lead.lostAt)} />
          <Field className="md:col-span-2" label="失注理由" value={lead.lostReason ?? "-"} />
          <Field className="md:col-span-2" label="メモ" value={lead.note ?? "-"} />
        </SimpleGrid>
      </Paper>

      <LeadStatusNoteModal isOpen={isStatusNoteOpen} lead={lead} onOpenChange={setStatusNoteOpen} />
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

interface LeadStatusNoteModalProps {
  isOpen: boolean;
  lead: LeadDetailContext["lead"];
  onOpenChange: (open: boolean) => void;
}

// リードの営業判断に関わる状態とメモだけを更新するモーダル。
function LeadStatusNoteModal({ isOpen, lead, onOpenChange }: LeadStatusNoteModalProps) {
  const form = useForm<StatusNoteForm>({
    mode: "uncontrolled",
    initialValues: {
      status: (lead.status ?? "new") as StatusNoteForm["status"],
      note: lead.note ?? "",
    },
    validate: schemaResolver(statusNoteSchema, { sync: true }),
  });
  const revalidator = useRevalidator();
  const mutation = useActionFetcher<UpdateLeadStatusNoteActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });

  // モーダルを開くたびに、現在表示中の lead の値へ戻す。
  useEffect(() => {
    if (!isOpen) return;
    form.setValues({
      status: (lead.status ?? "new") as StatusNoteForm["status"],
      note: lead.note ?? "",
    });
  }, [form.setValues, isOpen, lead.note, lead.status]);

  const handleSubmit = form.onSubmit((data) => {
    if (!lead.id) return;
    mutation.submit(data, [{ leadId: lead.id }]);
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size="lg"
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <PencilLine size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            状態・メモを更新
          </Title>
        </Group>
      }
      onClose={() => onOpenChange(false)}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            key={form.key("status")}
            {...form.getInputProps("status")}
            data={leadStatusOptions.map((option) => ({ value: option.value, label: option.label }))}
            label="状態"
            withAsterisk
          />
          <Textarea
            key={form.key("note")}
            {...form.getInputProps("note")}
            label="メモ"
            minRows={6}
          />
          <Group justify="flex-end">
            <Button
              disabled={mutation.submitting}
              variant="default"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button loading={mutation.submitting} type="submit">
              更新
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
