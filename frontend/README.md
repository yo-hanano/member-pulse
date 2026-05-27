# frontend

React Router v7 + Mantine V9 ベースの正規Webフロントエンドです。認証状態は `/auth` 系エンドポイント、業務データは `/graphql` を通じて扱います。

---

## 依存インストールと GraphQL コード生成

```bash
cd frontend
pnpm install
pnpm run codegen
```

- `pnpm run codegen` は backend から GraphQL スキーマを取得するため、事前に `backend` を起動しておく必要があります。
- backend 側のスキーマ変更を frontend へ取り込む場合は、必要に応じて `pnpm run gen-schema` も利用してください。

---

## 開発サーバー起動

```bash
pnpm run dev
```

---

## 主要コマンド

```bash
pnpm run typecheck
pnpm run build
pnpm run lint
pnpm run format
pnpm run fix
pnpm run check
npx react-router routes
```

---

## ルーティングについて

本プロジェクトは [remix-flat-routes](https://github.com/kiliman/remix-flat-routes) のハイブリッドルート方式を採用しています。

`@react-router/fs-routes` による自動生成を利用しつつ、ネストしたフォルダ構造とフラットな命名規則を併用して、ルート定義の保守性を上げています。

### ルートファイル名のルール

React Router v7 では、`route.ts` / `route.tsx` のみがルートモジュールとして認識されます。

- `route.tsx`: ルートとして認識される
- `index.tsx`: ルートとして認識されない
- インデックスルートは `_index/route.tsx` を使用する

### 仕様上の特殊ルート

- `_index` はその階層のトップページ
- 例: `app/routes/_core+/areas+/_index/route.tsx` → `/areas`

### よく使う記号

- `+`（ハイブリッドモード切替）
- `+` 付きフォルダ配下はフラットルート方式として解釈される
- フォルダ階層で整理しつつ、ルート名はフラットに構成できる
- 例: `app/routes/_core+/project+/parent/child/route.tsx`
- ルート名は `project.parent.child`
- URL は `/project/parent/child`

- `_`（pathless: URL に出さない親ルート）
- 先頭が `_` のセグメントは URL に出現しない
- 共通レイアウト、共通データ取得、権限制御、認証ガードに利用する
- 例: `app/routes/_core+/_layout/route.tsx`

### パスパラメータ

- `$` で始まるディレクトリ名がパスパラメータになる
- 例: `app/routes/_core+/areas+/$areaId/route.tsx` → `/areas/:areaId`
- 例: `app/routes/_core+/branches+/$branchId.edit/route.ts` → `/branches/:branchId/edit`

---

## Mantine V9 の運用

このプロジェクトの標準 UI ライブラリは `@mantine/core` です。共通テーマ、ColorSchemeScript、通知は `app/root.tsx` を起点に組み込んでいます。

### 依存パッケージ

- `@mantine/core`
- `@mantine/hooks`
- `@mantine/notifications`

### コンポーネント配置ルール

- `app/components/form`
- フォーム向けの入力補助、エラー表示、日付入力などを置く
- `app/components/composed`
- Mantine や既存部品を組み合わせたアプリ固有の再利用 UI を置く
- `app/components/table`
- 一覧やテーブル周辺の共通ロジックを置く

### フォーム実装メモ

- フォームは `@mantine/core` の入力 UI と `react-hook-form` + `zod`、`react-router` の `<Form>` / `useSubmit` を組み合わせる
- 旧 HeroUI 実装が残っている画面は段階的に Mantine へ移行する

---

## GraphQL の運用

- GraphQL クエリやミューテーションは文字列直書きせず、`app/generated/graphql.ts` の SDK を利用します。
- コンポーネントや loader の型は、`Lead` や `Student` のようなスキーマ全体型ではなく、query result 型または fragment 型を優先します。
- fragment は `app/graphqls/*.graphql` に集約し、コンポーネント横へ分散させません。
- fragment は UI 部品単位ではなく、画面や用途単位で作ります。
- 基本の粒度は `XxxListItem`、`XxxDetailView`、`XxxFormInitial`、`XxxOption` とします。
- `XxxNameCell` や `XxxStatusBadge` のような cell / button 単位の fragment は原則作りません。
- 小さい部品には fragment 型、または `Pick<XxxListItemFragment, "...">` のような用途に必要な最小型を渡します。

---

## 補足

- frontend は同一オリジンの `/auth` / `/graphql` エンドポイントを利用する React Router v7 フロントエンドです。
- マスターデータは `app/hooks/useMasterData.ts` でメモリキャッシュしています。TTL は 5 分です。
- マスタ更新後は `invalidateMasterData` 系を呼んでキャッシュを破棄します。
