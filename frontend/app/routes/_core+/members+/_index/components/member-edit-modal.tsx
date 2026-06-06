import { Button, Group, Loader, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFetcher, useRevalidator } from "react-router";

import { modalSizes } from "~/lib/modal-sizes";
import { MemberFormFields } from "~/routes/_core+/members+/_index/components/member-form-fields";
import { useMemberEdit } from "~/routes/_core+/members+/_index/hooks/useMemberEdit";
import {
  emptyMemberForm,
  type MemberForm,
  memberFormSchema,
  toMemberInput,
} from "~/routes/_core+/members+/_index/member-form-schema";
import type { clientLoader as memberEditLoader } from "~/routes/_core+/members+/$memberId.edit/route";

interface Props {
  memberId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 会員編集モーダル。詳細取得、フォーム、送信処理を内包する。
export function MemberEditModal({ memberId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof memberEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const lastAppliedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<MemberForm>({
    mode: "uncontrolled",
    initialValues: emptyMemberForm,
    validate: schemaResolver(memberFormSchema, { sync: true }),
  });

  // オープン時に対象会員を取得する。
  useEffect(() => {
    if (!isOpen || !memberId) {
      lastLoadedIdRef.current = null;
      lastAppliedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === memberId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = memberId;
    fetcher.load(`/members/${memberId}/edit`);
  }, [memberId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const member = fetcher.data?.member;
    const loadedMemberId = member?.id ? String(member.id) : null;
    if (!isOpen || !member || !loadedMemberId) return;
    if (lastAppliedIdRef.current === loadedMemberId) return;

    lastAppliedIdRef.current = loadedMemberId;
    form.setValues({
      locationId: member.locationId ?? "",
      leadId: member.leadId ?? "",
      name: member.name ?? "",
      status: (member.status ?? "active") as MemberForm["status"],
      joinedAt: member.joinedAt ?? "",
      resignedAt: member.resignedAt ?? "",
      resignationReasonCode: member.resignationReasonCode ?? "",
      resignationNote: member.resignationNote ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      lineDisplayName: member.lineDisplayName ?? "",
      zipCode: member.zipCode ?? "",
      prefectureCode: member.prefectureCode ?? "",
      address: member.address ?? "",
      birthDate: member.birthDate ?? "",
      source: member.source ?? "",
      note: member.note ?? "",
    });
  }, [fetcher.data?.member, form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useMemberEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  const handleSubmit = form.onSubmit((data) => {
    if (!memberId) return;
    editMutation.submit(toMemberInput(data), [{ memberId }]);
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
            会員を編集
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyMemberForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            必要な情報を入力して編集します。完了したら更新をクリックしてください。
          </Text>
          {isLoading && !fetcher.data?.member ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <MemberFormFields form={form} />
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
