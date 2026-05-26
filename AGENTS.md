# AGENTS.md

このファイルは、AI エージェントが `member-pulse` で作業するときの運用ルールです。
回答、途中報告、最終報告は日本語で行います。

## 1. 最優先ルール

- 修正・実装の前に、要件理解、作業計画、影響範囲、触るファイル、確認方法を明示する
- 不明点がある場合は推測で進めず、質問して前提を確定する
- 既存の分離構成は踏襲する: `frontend`、`bff`、`backend`、`migrate`
- DB スキーマ変更は Liquibase 経由で行う
- backend の DB アクセスは jOOQ 生成型を優先する
- RLS をバイパスしない
- GraphQL クエリや mutation の文字列直書きは避け、生成済み SDK を使う
- 自動生成ファイル、特に `frontend/app/generated` は直接編集しない
- 秘密情報は Vault / env 経由で扱い、コードへハードコードしない
- 既存 UI は frontend の現行コンポーネント体系に合わせる。新規実装で急に別系統の UI ライブラリへ寄せない
- 旧 juku-ops の業務文脈を新機能へ持ち込まない

## 2. 作業フロー

修正・実装作業は次の順で進めます。

1. 要件を確認する
2. 必要な README と仕様を確認する
3. 実行計画と影響範囲を整理する
4. 既存実装を調査する
5. 既存パターンに合わせて実装する
6. ビルド、型検査、テスト、静的確認を行う
7. 変更内容、確認結果、残リスクを報告する

調査や読み取りは先に進めてよいですが、実装方針に分岐がある場合は質問してから進めます。

## 3. プロジェクト概要

`member-pulse` は、月謝制スタジオ向けの月次経営レビュー SaaS です。
主仕様は [spec/target/monthly-review-saas-plan.md](spec/target/monthly-review-saas-plan.md) を参照します。

主要ディレクトリ:

- `migrate/`: Liquibase DB マイグレーション、seed、jOOQ コード生成
- `backend/`: Quarkus GraphQL API サーバー
- `bff/`: Hono ベースの認証/セッション/JWKS/GraphQL 中継
- `frontend/`: React Router v7 ベースの Web フロントエンド
- `spec/`: 計画書、検討メモ、仕様資料
- `profiles/`: 環境変数テンプレート
- `ref/`: 参考プロジェクトmount。指示がある時以外読まないこと。
- `.devcontainer/`: Dev Container 定義と起動スクリプト

`juku-ops` は参考実装であり、塾向けの `student`、保護者、学校、学年、授業、請求などの文脈は新機能へ持ち込みません。`markeman`も計算ロジックや構成の参考にするだけで持ち込みません。

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

共通マスタは `code` を使い、会社固有・業務固有データは `VARCHAR(21)` の nanoid 形式を優先します。

## 4. 調査ツールの使い分け

### 4.1 Serena

Serena はコード解析の主手段です。定義、参照、呼び出し関係、影響範囲、類似実装を調べるときに使います。

使う場面:

- 実装前に既存パターンを確認する
- クラス、メソッド、変数の定義箇所を探す
- 呼び出し元、呼び出し先、影響範囲を調べる
- お手本機能の実装パターンを確認する
- 局所的なデータフローや責務分担を追う

### 4.2 context7

context7 は外部ライブラリやフレームワークの最新 API 確認に使います。

使う場面:

- 新しいライブラリを導入する
- バージョンアップ後の API 変更を確認する
- 既存実装にない API パターンが必要
- バージョン固有の問題を調べる

### 4.3 distill-talk

`distill-talk` は、複雑な依頼を圧縮して実行可能な最小ステップへ落とすために使います。

使う条件:

- 指示が複雑で、実装前に分解・優先順位付けが必要
- 複数の選択肢を短く比較して次アクションを決めたい
- 長文指示を、実行可能な最小ステップへ圧縮したい

使わない条件:

- 通常の質疑応答、雑談、最終回答
- 単純な読み取りや軽微な修正

### 4.4 専用スキル

該当する作業では次のスキルを優先します。

- `backend-java-change`: backend の Java 実装変更
- `backend-graphql-change`: backend の GraphQL 変更
- `frontend-route-change`: frontend の route 変更

## 5. README 確認ルール

作業対象に応じて、先に該当 README を確認します。

- `backend/`: `/workspace/backend/README.md`
- `frontend/`: `/workspace/frontend/README.md`
- `bff/`: `/workspace/bff/README.md`
- `migrate/`: `/workspace/migrate/README.md`
- 全体方針: `/workspace/README.md`
- 仕様: `/workspace/spec/target/monthly-review-saas-plan.md`

重要な観点:

- `backend/`: DB アーキテクチャ、Service/Dao 分離、codegen、RLS、Dev UI
- `frontend/`: React Router ルーティング、UI コンポーネント、GraphQL SDK、マスターデータ運用
- `bff/`: Cookie、JWT、Redis、JWKS、静的配信、認証境界
- `migrate/`: Liquibase、SQL changelog、rollback、lpm 管理、jOOQ 生成

## 6. 実装ルール

### 6.1 共通

- 既存パターンに従う
- 大きな変更は段階的に分ける
- 重要な判断には理由を残す。ただし逐語的なコメントは避ける
- 依存バージョンや tool chain は既存設定に合わせる
- 既存ファイルの報告では差分を中心に説明する。新規ファイルは全文説明してよい
- 破壊的コマンドは使わない。`git reset --hard`、`git checkout --`、`rm` の乱用は禁止する
- 他者の変更を勝手に戻さない

### 6.2 Java

- `*.java` ではクラスコメントと public / protected メソッドコメントを原則付ける
- private メソッドや補助処理にも、必要に応じて短い意味コメントを付ける
- `@Transactional` と `@Rls` の組み合わせを確認する
- Bean Validation を活用する
- DB アクセスは jOOQ 生成型を優先する
- 例外は既存方針に合わせ、`NotFoundException`、`ConstraintViolationException` など適切な型を使う

### 6.3 TypeScript / React

- `*.ts` / `*.tsx` では、関数、`useEffect`、主要処理ブロックに目的が分かる短いコメントを付ける
- フォームは `react-hook-form`、`react-router` の `<Form>` / `useSubmit`、既存の入力コンポーネントのパターンに合わせる
- バリデーションは既存の zod ヘルパーを優先する
- GraphQL は生成済み SDK を使い、クエリ文字列を直書きしない
- 新規 UI は既存デザインシステムの密度、余白、操作感に合わせる

### 6.4 SQL / Liquibase

- DB スキーマ変更は Liquibase の formatted SQL を基本にする
- `COMMENT ON TABLE` と `COMMENT ON COLUMN` を付ける
- 可能な範囲で `--rollback` を追記する
- 共通マスタは `code`、会社固有・業務データは nanoid 形式の `id` を使う
- `company_id` を持つテーブルは RLS 対象として設計する
- `location` は郵便番号補完を流用できるように `zip_code`、`prefecture_code`、`address` を持たせる

## 7. アーキテクチャ制約

### 7.1 認証

- `frontend` は BFF の `/auth/*` と `/graphql` を通じて操作する
- `__bff_session` には `sessionId` のみ入れる
- JWT は最小限のペイロードにする。ユーザー属性は Redis セッションから解決する
- JWT 署名は Vault Transit を使う。秘密鍵はローカルに保存しない
- backend は JWKS で JWT を検証する

### 7.2 RLS

- `company_id` カラムがあるテーブルには company ユーザー用の RLS を前提にする
- RLS をバイパスする実装はしない
- `@Rls` が必要な Service メソッドとトランザクション境界を揃える

### 7.3 GraphQL

- frontend で GraphQL の文字列直書きはしない
- query / mutation は `frontend/app/generated/graphql.ts` の SDK を使う
- backend 側は既存の GraphQL 実装パターンを優先し、独自のバラバラな resolver 方式を増やさない

### 7.4 DB マイグレーションと jOOQ

- DB スキーマ変更は `migrate` を唯一の正にする
- jOOQ 生成型を優先し、生成物を手で編集しない
- `./gradlew jooqCodegenWithTestcontainers compileJava` で fresh DB の適用と生成を確認する
- `migrate/src/main/resources/db/changelog/db.changelog-master.yaml` の include 順を守る

## 8. 開発コマンド

### 8.1 初期セットアップ

- `gh auth login`
- `cp -n profiles/template.env profiles/local.env`
- `cp -n mise.local.toml.template mise.local.toml`
- `mise trust`
- Dev Container を再ビルドする

### 8.2 migrate

- `cd migrate && task help`
- `task up`
- `task st`
- `task validate`
- `task diff`
- `task sql`
- `COUNT=1 task rb`
- `TAG=... task rbt`
- `task clear`
- `./gradlew jooqCodegenWithTestcontainers compileJava`
- `liquibase lpm add -g postgresql`

### 8.3 backend

- `cd backend && just dev`
- `just codegen`
- `just compile`
- `just test`
- `just build`
- `just fmt`
- `just check`

### 8.4 bff

- `cd bff && pnpm install`
- `pnpm run dev`
- `pnpm run build`
- `pnpm run start`

### 8.5 frontend

- `cd frontend && pnpm install`
- `pnpm run codegen`
- `pnpm run dev`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run lint`
- `pnpm run format`
- `pnpm run fix`
- `pnpm run check`

## 9. 環境とポート

- frontend: `5173`
- bff: `3000`
- backend: `8080`
- PostgreSQL: `5432`
- Vault: `8200`
- Redis: `6379`

`post-start.sh` が DB と Vault の初期化を行うため、Dev Container 内ではまずそれを前提に作業します。

## 10. 確認とデバッグ

- backend の GraphQL UI は `http://localhost:8080/q/graphql-ui/`
- backend の Dev UI は `http://localhost:8080/q/dev-ui`
- backend の GraphQL スキーマは `http://localhost:8080/graphql/schema.graphql`
- bff の JWKS は `http://localhost:3000/.well-known/jwks.json`
- bff の郵便番号検索は `http://localhost:3000/api/postal-code/lookup?zipcode=...`
- frontend は backend 起動後に `pnpm run codegen` を通してから確認する
- migrate は fresh DB で `validate` と `jooqCodegenWithTestcontainers compileJava` を通す

## 11. Git

- 非対話コマンドを優先する
- 既存の未変更差分を勝手に戻さない
- コミットや push は明示依頼があるときだけ行う
- 変更を報告するときは、何を変えたか、どう確認したか、残るリスクを短く整理する

## 12. 品質チェックリスト

- 触る前に関連 README と仕様を確認した
- 影響範囲を把握した
- 生成物や自動生成ファイルを直接編集していない
- DB 変更は Liquibase 経由で行った
- frontend の GraphQL は生成済み SDK を使った
- RLS と認証境界を壊していない
- 実装後に build / typecheck / validate / codegen など必要な確認を行った
- 残リスクをユーザーに明示した
