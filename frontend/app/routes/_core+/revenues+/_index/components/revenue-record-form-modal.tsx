import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect } from "react";
import { z } from "zod";

import type { MemberOptionFragment, RevenueRecordItemFragment } from "~/generated/graphql";
import type { useActionFetcher } from "~/hooks/useActionFetcher";
import { useMasterLocations } from "~/hooks/useMasterData";
import {
  revenueTypeOptions,
  revenueTypeValues,
} from "~/routes/_core+/revenues+/_index/revenue-type";
import type { RevenueActionData } from "~/routes/_core+/revenues+/_index/route";

// 売上手入力の入力値。
const revenueFormSchema = z.object({
  revenueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "売上日を入力してください" }),
  revenueType: z.enum(revenueTypeValues),
  locationId: z.string().optional().or(z.literal("")),
  memberId: z.string().optional().or(z.literal("")),
  monthlyAmount: z
    .union([z.number().min(0), z.literal("")])
    .refine((value) => value !== "", { message: "金額を入力してください" }),
  note: z.string().max(1000).optional().or(z.literal("")),
});

// NumberInput の未入力は "" になるため、フォーム型は明示的に union で持つ。
type RevenueForm = {
  revenueDate: string;
  revenueType: (typeof revenueTypeValues)[number];
  locationId: string;
  memberId: string;
  monthlyAmount: number | "";
  note: string;
};

interface Props {
  /** 編集対象の売上。null のときは新規登録として扱う。 */
  record: RevenueRecordItemFragment | null;
  /** 会員選択肢。fixedMember 指定時は不要。 */
  members?: MemberOptionFragment[];
  /**
   * 会員固定モード。会員詳細の売上タブから使う場合に指定する。
   * 会員選択を出さず、この会員の売上として登録する。拠点はこの会員の拠点を初期値にする。
   */
  fixedMember?: { id: string; locationId?: string | null } | null;
  /** 一覧で選択中の対象月（YYYY-MM）。新規登録時の売上日の初期値に使う。未指定は当月。 */
  month?: string;
  mutation: ReturnType<typeof useActionFetcher<RevenueActionData>>;
  opened: boolean;
  onClose: () => void;
}

// 売上明細の登録・編集フォームを描画するモーダル。
export function RevenueRecordFormModal({
  record,
  members = [],
  fixedMember = null,
  month,
  mutation,
  opened,
  onClose,
}: Props) {
  const isEdit = record != null;
  const { data: locations = [] } = useMasterLocations();
  const baseMonth = month ?? new Date().toISOString().slice(0, 7);

  const form = useForm<RevenueForm>({
    mode: "uncontrolled",
    initialValues: buildInitialValues(baseMonth, fixedMember),
    validate: schemaResolver(revenueFormSchema, { sync: true }),
  });

  // モーダルを開くたびに、新規の初期値または編集対象の値へフォームを戻す。
  useEffect(() => {
    if (!opened) return;
    form.setValues(record ? buildEditValues(record) : buildInitialValues(baseMonth, fixedMember));
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened, record, baseMonth, fixedMember]);

  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  const memberOptions = members.map((member) => ({
    value: String(member.id),
    label: member.name ?? String(member.id),
  }));

  // 会員選択時に拠点未指定なら、その会員の拠点を補完する。
  const handleMemberChange = (memberId: string | null) => {
    form.setFieldValue("memberId", memberId ?? "");
    if (!memberId) return;
    const member = members.find((candidate) => String(candidate.id) === memberId);
    if (member?.locationId && !form.getValues().locationId) {
      form.setFieldValue("locationId", member.locationId);
    }
  };

  const handleSubmit = form.onSubmit((data) => {
    if (data.monthlyAmount === "") return;
    mutation.submit({
      intent: isEdit ? "updateRevenue" : "createRevenue",
      revenueRecordId: record?.id,
      locationId: data.locationId || undefined,
      // 会員固定モードでは常にその会員の売上として登録する。
      memberId: fixedMember ? fixedMember.id : data.memberId || undefined,
      revenueDate: data.revenueDate,
      revenueType: data.revenueType,
      amount: data.monthlyAmount,
      note: data.note || undefined,
    });
  });

  return (
    <Modal
      centered
      opened={opened}
      size="lg"
      title={isEdit ? "売上を編集" : "売上を追加"}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              key={form.key("revenueDate")}
              {...form.getInputProps("revenueDate")}
              label="売上日"
              type="date"
              withAsterisk
            />
            <Select
              key={form.key("revenueType")}
              {...form.getInputProps("revenueType")}
              data={revenueTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              label="種別"
              withAsterisk
            />
          </Group>
          <Group grow>
            <Select
              key={form.key("locationId")}
              {...form.getInputProps("locationId")}
              clearable
              data={locationOptions}
              label="拠点"
              placeholder="未指定（全社共通）"
            />
            {/* 会員固定モードでは会員選択を出さない。 */}
            {fixedMember ? null : (
              <Select
                key={form.key("memberId")}
                {...form.getInputProps("memberId")}
                clearable
                data={memberOptions}
                label="会員"
                placeholder="未指定（物販等）"
                searchable
                onChange={handleMemberChange}
              />
            )}
          </Group>
          <NumberInput
            key={form.key("monthlyAmount")}
            {...form.getInputProps("monthlyAmount")}
            label="金額"
            min={0}
            prefix="¥"
            thousandSeparator=","
            withAsterisk
          />
          <Textarea
            key={form.key("note")}
            {...form.getInputProps("note")}
            label="メモ"
            minRows={2}
            placeholder="例) プロテイン購入、体験当日入会の入会金 など"
          />
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

function buildInitialValues(
  month: string,
  fixedMember: { id: string; locationId?: string | null } | null,
): RevenueForm {
  // 対象月を表示中なら、その月の初日を売上日の初期値にする。
  const today = new Date().toISOString().slice(0, 10);
  return {
    revenueDate: today.startsWith(month) ? today : `${month}-01`,
    revenueType: "other",
    locationId: fixedMember?.locationId ?? "",
    memberId: fixedMember?.id ?? "",
    monthlyAmount: "",
    note: "",
  };
}

function buildEditValues(record: RevenueRecordItemFragment): RevenueForm {
  return {
    revenueDate: record.revenueDate ?? "",
    revenueType: (record.revenueType ?? "other") as RevenueForm["revenueType"],
    locationId: record.locationId ?? "",
    memberId: record.memberId ?? "",
    monthlyAmount: record.amount ?? "",
    note: record.note ?? "",
  };
}
