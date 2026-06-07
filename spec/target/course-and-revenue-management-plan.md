# コース管理・売上管理 実装計画

2026-06-07 時点の検討メモ。alcos-portal の調査結果と Phase A 実装を踏まえた、次回以降の作業計画。

## 決定事項

- **売上管理は台帳ベース**で進める。ただし請求・入金管理は今回は扱わない（本仕様の除外方針どおり）
- **1会員1契約に限定**する。アクティブな契約は常に1件。プラン変更 = 旧契約を終了 + 新契約を開始（履歴が残る）
- alcos-portal から取り込むのは「コースマスタ管理」「契約履歴管理」「契約→月次売上の自動計算」の業務パターンのみ。
  請求出力・入金管理・返金・月次締め・学年×座席種別の料金マトリクスは持ち込まない

## フェーズ分け

### Phase A: プランマスタ CRUD — 完了（2026-06-07）

- backend: `MembershipPlanInput` / `allMembershipPlans` Query / create・update・delete Mutation
- frontend: `/membership-plans` 画面（一覧・作成・編集・削除）、ナビ「会員プラン」有効化
- プラン削除は論理削除で、既存契約には影響しない（契約は `monthly_fee` を自前で持つ）

### Phase B: 契約管理 — 完了（2026-06-07）

**会員詳細に「コース管理」タブを追加して実装する。**

#### DB

- `membership_subscription` に部分 unique 制約を追加:
  「アクティブ契約は1会員1件」（`member_id` に対し `status != 'ended'` かつ `deleted_at IS NULL` の部分 unique index）
- スキーマ自体は Phase 0 で定義済み（start_date / end_date / status: active・paused・ended / monthly_fee / note）

#### backend

- `MembershipSubscriptionDao` / `MembershipSubscriptionService` / `MembershipSubscriptionResolver` を新設
- Query: `membershipSubscriptionsByMemberId`（履歴を新しい順）
- Mutation:
  - `changeMembershipPlan`: 旧契約を end_date 付きで終了 + 新契約を開始（同一トランザクション）
  - `pauseMembershipSubscription` / `resumeMembershipSubscription`: 休会・再開
  - `endMembershipSubscription`: 契約終了（退会連動は検討の結果「連動しない」で確定。休会/再開も member.status と連動しない）
  - `updateMembershipSubscription`: 月額・メモ等の修正
- 入会処理の `enrollLead` は既存のまま（member + subscription を同一トランザクション作成済み）

#### frontend

- 会員詳細（`members+/$memberId`）に**「コース管理」タブを追加**（現状は概要タブのみ。タブ構造はリード詳細の overview/enrollment パターンを踏襲）
- タブ内容:
  - 現在の契約カード: プラン名・月額・開始日・状態（契約中/休会中）+ 操作ボタン（プラン変更・休会/再開・契約終了）
  - 契約履歴タイムライン: リード詳細の「対応履歴」と同じ文法（日時降順・色とバッジの統一）
- プラン変更モーダル: 新プラン選択（activeMembershipPlans）・切替日・月額（プランから自動入力、割引調整可）

#### UI トンマナ

- リード詳細・会員詳細で確立した文法に合わせる:
  カード内ヘッダー（アイコン+タイトル+説明+操作ボタン）、項目名 太字sm、値 md、バッジ lg

### Phase C: 売上管理（台帳ベース）— 完了（2026-06-07）

- 売上明細テーブル `revenue_record` を新設:
  会員（任意）・拠点（任意）・売上日・種別（月謝/入会金/物販/その他）・金額・入力元（auto/manual）・メモ
- 月謝売上は契約から月次で自動生成（alcos の Uriage 自動生成パターンの軽量版）、その他売上は手入力
  - 生成は売上画面から対象月を指定して手動実行。生成済み会員はスキップする冪等設計
  - 1会員1契約の方針に合わせ、月内にプラン変更があっても会員ごとに最新契約1件のみ生成（日割りなし満額）
  - 休会中（paused）の契約は生成対象外（生成時点のステータスで判定）
- 集計ビュー: 対象月・拠点フィルタ + サマリカード（売上合計 / MRR / 平均月謝 / 月謝件数=課金契約数）。
  月別推移ビューは次回以降に持ち越し
- 月次レビュー（monthly_review_location の crm_* 参考値）への供給は将来フェーズ
- 本仕様書の「売上は月次集計値で入力」との整合: 台帳からの自動集計を参考値とし、
  月次レビュー側の手入力値が最終的な正である構造は維持する

## 参考: alcos-portal 調査の要点

- 受講契約（StudentKeiyaku/Shido）は開始・終了日と個別料金で履歴管理 → member-pulse は `membership_subscription` が同役割（設計済み）
- alcos の弱点「生徒ごとの契約金額の履歴がない」は member-pulse では契約スナップショット（monthly_fee）で解決済み
- 売上種別15種（教材費・模試・合宿等）は塾文脈なので持ち込まず、月謝/その他の軽量分類にする
