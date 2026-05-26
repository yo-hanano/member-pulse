import { z } from "zod";
import { optionalInt, requiredString } from "~/lib/zod-helpers";

// エリア作成・編集フォームの共通バリデーション
export const areaFormSchema = z.object({
  name: requiredString("エリア名"),
  dispOrder: optionalInt(),
});

export type AreaForm = z.infer<typeof areaFormSchema>;

export const emptyAreaForm: AreaForm = {
  name: "",
  dispOrder: undefined,
};
