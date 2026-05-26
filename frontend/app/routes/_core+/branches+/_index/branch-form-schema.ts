import { z } from "zod";

import { requiredString, zipCode } from "~/lib/zod-helpers";

// 拠点作成・編集フォームの共通バリデーション。
export const branchFormSchema = z.object({
  areaId: requiredString("エリア"),
  code: requiredString("拠点コード"),
  name: requiredString("拠点名"),
  zipCode: zipCode(),
  prefectureCode: requiredString("都道府県"),
  address: requiredString("住所"),
});

export type BranchForm = z.infer<typeof branchFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyBranchForm: BranchForm = {
  areaId: "",
  code: "",
  name: "",
  zipCode: "",
  prefectureCode: "",
  address: "",
};
