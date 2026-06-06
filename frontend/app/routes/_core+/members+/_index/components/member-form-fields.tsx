import { Select, SimpleGrid, Textarea, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useState } from "react";

import { useMasterLocations, useMasterPrefectures } from "~/hooks/useMasterData";
import { usePostalCodeAutofill } from "~/hooks/usePostalCodeAutofill";
import type { MemberForm } from "~/routes/_core+/members+/_index/member-form-schema";
import { memberStatusOptions } from "~/routes/_core+/members+/_index/member-status";

interface Props {
  form: UseFormReturnType<MemberForm>;
  /**
   * enrollment: 入会処理向けの軽量表示。基本情報のみを扱い、
   * 状態・退会系・リードIDなど入会時に不要な項目を出さない。
   */
  variant?: "full" | "enrollment";
}

// 会員作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function MemberFormFields({ form, variant = "full" }: Props) {
  const isFull = variant === "full";
  const { data: locations = [] } = useMasterLocations();
  const { data: prefectures = [] } = useMasterPrefectures();
  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  const prefectureOptions = prefectures.map((prefecture) => ({
    value: prefecture.code ?? "",
    label: prefecture.name ?? prefecture.code ?? "-",
  }));

  // 郵便番号のユーザー入力値。初期表示の既存値では補完を発火させず、入力時のみ反応させる。
  const [zipCodeInput, setZipCodeInput] = useState("");
  usePostalCodeAutofill({
    zipCode: zipCodeInput,
    prefectures,
    onAutofill: (result) => {
      // 拠点と同じ構造: 都道府県は専用カラムへ、住所には市区町村以下を補完する。
      form.setFieldValue("prefectureCode", result.prefectureCode);
      form.setFieldValue("address", result.address);
    },
  });
  const zipCodeProps = form.getInputProps("zipCode");

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <Select
        key={form.key("locationId")}
        {...form.getInputProps("locationId")}
        data={locationOptions}
        label="拠点"
        placeholder="項目を選択"
        searchable
        withAsterisk
      />
      <TextInput
        key={form.key("joinedAt")}
        {...form.getInputProps("joinedAt")}
        label="入会日"
        type="date"
        withAsterisk
      />
      <TextInput
        key={form.key("name")}
        {...form.getInputProps("name")}
        label="氏名"
        placeholder="例) 山田 太郎"
        withAsterisk
      />
      {isFull ? (
        <Select
          key={form.key("status")}
          {...form.getInputProps("status")}
          data={memberStatusOptions.map((option) => ({ value: option.value, label: option.label }))}
          label="状態"
          withAsterisk
        />
      ) : null}
      <TextInput
        key={form.key("phone")}
        {...form.getInputProps("phone")}
        label="電話番号"
        placeholder="例) 090-1234-5678"
      />
      <TextInput
        key={form.key("email")}
        {...form.getInputProps("email")}
        label="メールアドレス"
        placeholder="例) sample@example.com"
        type="email"
      />
      {/* LINE 連携は未想定のため、入会処理では表示しない。必要になれば会員編集で入力できる。 */}
      {isFull ? (
        <TextInput
          key={form.key("lineDisplayName")}
          {...form.getInputProps("lineDisplayName")}
          label="LINE表示名"
          placeholder="例) taro"
        />
      ) : null}
      {/* 流入元はリード段階で確定する項目のため、入会処理では表示しない（値はリードから引き継ぐ）。 */}
      {isFull ? (
        <TextInput
          key={form.key("source")}
          {...form.getInputProps("source")}
          label="流入元"
          placeholder="例) Web / 紹介 / チラシ"
        />
      ) : null}
      <TextInput
        key={form.key("birthDate")}
        {...form.getInputProps("birthDate")}
        label="生年月日"
        type="date"
      />
      {isFull ? (
        <TextInput
          key={form.key("resignedAt")}
          {...form.getInputProps("resignedAt")}
          label="退会日"
          type="date"
        />
      ) : null}
      {isFull ? (
        <TextInput
          key={form.key("resignationReasonCode")}
          {...form.getInputProps("resignationReasonCode")}
          label="退会理由コード"
          placeholder="例) price"
        />
      ) : null}
      {isFull ? (
        <TextInput
          key={form.key("leadId")}
          {...form.getInputProps("leadId")}
          label="リードID"
          placeholder="入会変換時に利用"
        />
      ) : null}
      <TextInput
        key={form.key("zipCode")}
        {...zipCodeProps}
        description="7桁を入力すると都道府県・住所を自動補完します"
        inputMode="numeric"
        label="郵便番号"
        placeholder="例) 100-0001"
        onChange={(event) => {
          zipCodeProps.onChange(event);
          setZipCodeInput(event.currentTarget.value);
        }}
      />
      <Select
        key={form.key("prefectureCode")}
        {...form.getInputProps("prefectureCode")}
        clearable
        data={prefectureOptions}
        label="都道府県"
        placeholder="都道府県を選択"
        searchable
      />
      <Textarea
        key={form.key("address")}
        {...form.getInputProps("address")}
        className="md:col-span-2"
        label="住所"
        minRows={2}
        placeholder="市区町村・番地・建物名"
      />
      {isFull ? (
        <Textarea
          key={form.key("resignationNote")}
          {...form.getInputProps("resignationNote")}
          className="md:col-span-2"
          label="退会理由メモ"
          minRows={3}
        />
      ) : null}
      <Textarea
        key={form.key("note")}
        {...form.getInputProps("note")}
        className="md:col-span-2"
        label="メモ"
        minRows={4}
        placeholder="対応メモを入力"
      />
    </SimpleGrid>
  );
}
