import { z } from "zod";

import { requiredString } from "~/lib/zod-helpers";

// 月額プラン作成・編集フォームの共通バリデーション。
export const membershipPlanFormSchema = z.object({
  name: requiredString("プラン名").max(100),
  // refine だと型述語推論で "" が落ちるため superRefine で必須チェックする。
  monthlyFee: z
    .union([z.number().min(0, { message: "月額は0以上で入力してください" }), z.literal("")])
    .superRefine((value, ctx) => {
      if (value === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "月額を入力してください" });
      }
    }),
  locationId: z.string().max(21).optional().or(z.literal("")),
  active: z.boolean(),
  displayOrder: z.union([z.number().int(), z.literal("")]),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export type MembershipPlanForm = z.infer<typeof membershipPlanFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyMembershipPlanForm: MembershipPlanForm = {
  name: "",
  monthlyFee: "",
  locationId: "",
  active: true,
  displayOrder: "",
  note: "",
};

// GraphQL input へ渡す前に空文字を nullable な値へ寄せる。
export const toMembershipPlanInput = (data: MembershipPlanForm) => ({
  name: data.name,
  monthlyFee: data.monthlyFee === "" ? 0 : data.monthlyFee,
  locationId: data.locationId || undefined,
  active: data.active,
  displayOrder: data.displayOrder === "" ? undefined : data.displayOrder,
  note: data.note || undefined,
});
