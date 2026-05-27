import { z } from "zod";

import { requiredString } from "~/lib/zod-helpers";

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, { message: `${label}は${max}文字以内で入力してください` }).optional().or(z.literal(""));

// 拠点作成・編集フォームの共通バリデーション。
export const locationFormSchema = z.object({
  areaId: optionalText(21, "エリア"),
  name: requiredString("拠点名"),
  zipCode: optionalText(8, "郵便番号"),
  prefectureCode: optionalText(21, "都道府県"),
  address: optionalText(255, "住所"),
  isDefault: z.boolean(),
});

export type LocationForm = z.infer<typeof locationFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyLocationForm: LocationForm = {
  areaId: "",
  name: "",
  zipCode: "",
  prefectureCode: "",
  address: "",
  isDefault: false,
};

// GraphQL input へ渡す前に空文字を nullable な値へ寄せる。
export const toLocationInput = (data: LocationForm) => ({
  ...data,
  areaId: data.areaId || undefined,
  zipCode: data.zipCode || undefined,
  prefectureCode: data.prefectureCode || undefined,
  address: data.address || undefined,
});
