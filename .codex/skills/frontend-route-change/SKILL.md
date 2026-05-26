---
name: frontend-route-change
description: juku-ops frontend の React Router route を変更するときに使う。`frontend/app/routes` 配下の画面追加・更新、loader/action の変更、GraphQL クエリ利用変更、影響範囲調査、検証手順の実行に適用する。
---

# Frontend Route Change

juku-ops frontend の route 変更を、既存 React Router 構造に沿って安全に進める。

## 1. 仕様確認

作業開始時に対象仕様を確認する。

- 全体方針: `README.md`
- frontend ガイド: `frontend/README.md`
- 実装・制約: `AGENTS.md`

仕様が曖昧なら推測せずに質問する。

## 2. 実行計画

実装前に次を明示する。

- 対象 route（追加/更新/削除）
- 変更ファイル（`index.tsx`, `components`, `*.server.tsx` など）
- 画面遷移と既存機能への影響
- 検証内容

## 3. 調査手順

実装前に以下を調査する。

1. 同じ階層・用途の route 実装（お手本機能）
2. `loader` / `action` / `meta` / `handle` の既存パターン
3. 参照コンポーネントと outlet context の受け渡し
4. GraphQL ドキュメントと `app/generated` 型の利用箇所
5. 変更 route を参照する画面・遷移元

## 4. 実装ルール

- route エントリは `frontend/app/routes/.../index.tsx` の既存構造に合わせる。
- サーバー処理は既存の `loader` / `action` 分離パターンに合わせる。
- 画面部品は `components/` 配下へ分割し、肥大化を避ける。
- `frontend/app/generated` は直接編集しない（必要なら codegen）。
- コメントは日本語で書き、処理意図が追える説明を残す。
- 命名は既存 route 命名規則に合わせる。

## 5. 検証

frontend 変更時は、既存エラーの影響を避けるため差分中心で検証する。

日常開発では、変更ファイルに対して lint を実行する。

```bash
cd frontend
pnpm biome check <変更ファイル1> <変更ファイル2>
```

`typecheck` は、型定義・共通コンポーネント・GraphQL 関連に影響する変更時に実行する。

```bash
cd frontend
pnpm run typecheck
```

GraphQL クエリ/ミューテーション変更がある場合は codegen を実行し、その後 `typecheck` を実行する。

```bash
cd frontend
pnpm run codegen
pnpm run typecheck
```

PR 前は可能な範囲で全体 `lint` / `typecheck` を実行する。難しい場合は「変更ファイル lint + 影響範囲の手動確認」を実施する。

## 6. 報告

作業完了時に次を報告する。

1. 変更した route と目的
2. 変更ファイル一覧
3. 調査結果の要点
4. 検証コマンドと結果
5. 残課題と前提
