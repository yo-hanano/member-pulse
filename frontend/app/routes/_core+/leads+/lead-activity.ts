import type { LeadDetailViewFragment, TrialSessionListItemFragment } from "~/generated/graphql";
import {
  formatTrialSessionStatus,
  trialSessionStatusBadgeColor,
} from "~/routes/_core+/leads+/trial-session-status";

export type LeadActivityKind =
  | "inquiry"
  | "trial"
  | "next_contact"
  | "contracted"
  | "enrolled"
  | "lost";

export type LeadActivityEntry = {
  key: string;
  kind: LeadActivityKind;
  label: string;
  color: string;
  /** 表示日時。成約・入会は記録日時を持たないため undefined。 */
  at?: string | null;
  note?: string | null;
  /** 体験エントリのみ: 編集・削除対象の元データ。 */
  trialSession?: TrialSessionListItemFragment;
  /** 次回連絡予定エントリのみ: 期日超過か。 */
  isOverdue?: boolean;
};

// リード本体と体験セッションから、対応履歴タイムラインのエントリ一覧（処理日時の降順）を合成する。
// 段階1の擬似合成: 判断イベントはリードのカラムから生成し、専用テーブルは持たない。
export function buildLeadActivityEntries(
  lead: LeadDetailViewFragment,
  trialSessions: TrialSessionListItemFragment[],
): LeadActivityEntry[] {
  const entries: LeadActivityEntry[] = [];

  // 判断の確定（入会・成約・不成約）または次回連絡予定。
  if (lead.status === "enrolled") {
    entries.push({ key: "enrolled", kind: "enrolled", label: "入会", color: "green" });
  } else if (lead.status === "contracted") {
    entries.push({ key: "contracted", kind: "contracted", label: "成約", color: "green" });
  } else if (lead.status === "lost") {
    entries.push({
      key: "lost",
      kind: "lost",
      label: "不成約",
      color: "red",
      at: lead.lostAt,
      note: lead.lostReason,
    });
  } else if (lead.nextContactAt) {
    // 追客中: 次回連絡の予定。期日超過は強調する。
    const isOverdue = new Date(lead.nextContactAt) <= new Date();
    entries.push({
      key: "next-contact",
      kind: "next_contact",
      label: isOverdue ? "次回連絡（期日超過）" : "次回連絡予定",
      color: isOverdue ? "red" : "yellow",
      at: lead.nextContactAt,
      isOverdue,
    });
  }

  // 体験イベント。
  for (const trialSession of trialSessions) {
    entries.push({
      key: `trial-${trialSession.id}`,
      kind: "trial",
      label: formatTrialSessionStatus(trialSession.status),
      color: trialSessionStatusBadgeColor(trialSession.status),
      at: trialSession.scheduledAt,
      note: trialSession.note,
      trialSession,
    });
  }

  // 起点となる問い合わせ受付。
  if (lead.inquiryAt) {
    entries.push({
      key: "inquiry",
      kind: "inquiry",
      label: "問い合わせ",
      color: "gray",
      at: lead.inquiryAt,
    });
  }

  // 処理日時の降順（新しい順）に並べる。日時を持たない成約・入会は最新の判断として先頭に固定する。
  const timeOf = (entry: LeadActivityEntry) =>
    entry.at ? new Date(entry.at).getTime() : Number.POSITIVE_INFINITY;
  return entries.sort((a, b) => timeOf(b) - timeOf(a));
}
