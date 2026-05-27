import { Button, Group, Loader, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFetcher, useRevalidator } from "react-router";

import { toDateTimeLocalValue } from "~/lib/date";
import { modalSizes } from "~/lib/modal-sizes";
import { LeadFormFields } from "~/routes/_core+/leads+/_index/components/lead-form-fields";
import { useLeadEdit } from "~/routes/_core+/leads+/_index/hooks/useLeadEdit";
import {
  emptyLeadForm,
  type LeadForm,
  leadFormSchema,
  toLeadInput,
} from "~/routes/_core+/leads+/_index/lead-form-schema";
import type { clientLoader as leadEditLoader } from "~/routes/_core+/leads+/$leadId.edit/route";

interface Props {
  leadId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// リード編集モーダル。詳細取得、フォーム、送信処理を内包する。
export function LeadEditModal({ leadId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof leadEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const lastAppliedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<LeadForm>({
    mode: "uncontrolled",
    initialValues: emptyLeadForm,
    validate: schemaResolver(leadFormSchema, { sync: true }),
  });

  // オープン時に対象リードを取得する。
  useEffect(() => {
    if (!isOpen || !leadId) {
      lastLoadedIdRef.current = null;
      lastAppliedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === leadId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = leadId;
    fetcher.load(`/leads/${leadId}/edit`);
  }, [leadId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const lead = fetcher.data?.lead;
    const loadedLeadId = lead?.id ? String(lead.id) : null;
    if (!isOpen || !lead || !loadedLeadId) return;
    if (lastAppliedIdRef.current === loadedLeadId) return;

    lastAppliedIdRef.current = loadedLeadId;
    form.setValues({
      inquiryAt: toDateTimeLocalValue(lead.inquiryAt ?? ""),
      locationId: lead.locationId ?? "",
      name: lead.name ?? "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      source: lead.source ?? "",
      status: (lead.status ?? "new") as LeadForm["status"],
      lostAt: toDateTimeLocalValue(lead.lostAt ?? ""),
      lostReason: lead.lostReason ?? "",
      note: lead.note ?? "",
    });
  }, [fetcher.data?.lead, form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useLeadEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  const handleSubmit = form.onSubmit((data) => {
    if (!leadId) return;
    editMutation.submit(toLeadInput(data), [{ leadId }]);
  });

  const isPending = editMutation.submitting || isLoading;

  return (
    <Modal
      centered
      opened={isOpen}
      size={modalSizes.cover}
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <PencilLine size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            リードを編集
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyLeadForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            必要な情報を入力して編集します。完了したら更新をクリックしてください。
          </Text>
          {isLoading && !fetcher.data?.lead ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <LeadFormFields form={form} />
          )}
          <Group justify="flex-end" mt="sm">
            <Button disabled={isPending} variant="default" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button loading={isPending} type="submit">
              更新
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
