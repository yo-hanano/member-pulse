# AGENTS.md

このファイルは、AI エージェントが `member-pulse` で作業するときの運用ルールです。
回答、途中報告、最終報告は日本語で行います。

## Product Direction

このプロジェクトは、月謝制スタジオ向けの月次経営レビュー SaaS です。
主仕様は [spec/target/monthly-review-saas-plan.md](spec/target/monthly-review-saas-plan.md) を参照します。

`juku-ops` は参考実装であり、塾向けの `student`、保護者、学校、学年、授業、請求などの文脈は新機能へ持ち込みません。

## Implementation Rules

- 既存の分離構成は踏襲する: `frontend`、`bff`、`backend`、`migrate`
- DB スキーマ変更は Liquibase 経由で行う
- backend の DB アクセスは jOOQ 生成型を優先する
- RLS をバイパスしない
- GraphQL クエリや mutation の文字列直書きは避け、生成済み SDK を使う
- 自動生成ファイル、特に `frontend/app/generated` は直接編集しない
- 秘密情報は Vault / env 経由で扱い、コードへハードコードしない
- UI ライブラリは新規実装では Mantine v9 方針に寄せる

## Domain Naming

新規業務ドメインでは次の命名を優先します。

- `location`: スタジオ、店舗、教室、ジムなどの拠点
- `member`: 会員
- `lead`: 見込み客、問い合わせ
- `trial_session`: 体験レッスン、体験セッション
- `membership_plan`: 月額プラン
- `membership_subscription`: 会員のプラン契約履歴
- `monthly_review`: 月次レビュー
- `cost_item`: 費用マスタ
- `ad_spend`: 広告費

## Current State

このリポジトリは `juku-ops` から生成物や依存ディレクトリを除いてコピーした初期骨格です。
旧ドメイン実装は、基盤パターン参照用として残っています。実装時は仕様に沿って置き換えます。
