# 依存メンテナンス記録（2026-09）

しばらく触れていなかった依存関係の棚卸しと更新の作業記録です。
中断・再開しやすいよう、判断理由と残作業をここに集約します。

## 方針

- リスク別に「🟢 パッチ/マイナー（安全）」「🟠 連動が必要」「🔴 メジャー」に分けて進める
- 各段で typecheck / build 等を通してからコミットする
- コミットは領域ごと（frontend / bff / gradle / mise）に分ける
- 「最新」でも peer 制約やエコシステム未対応なら**上げない**

## 完了済み（コミット）

| commit | 内容 |
|---|---|
| `2c457d5` | （機能）コース契約の切れ目を月単位に統一 ※メンテ前の未コミット分 |
| `c8e4ba8` | quarkus 3.36.1 → 3.36.2 / smallrye-graphql 2.17.0 → 2.18.2 ※未コミット分 |
| `f62591d` | （docs）migrate jar 化メモ ※未コミット分 |
| `ab2bc28` | frontend パッチ/マイナー（mantine 9.6 / vite 8.2.2 / zod 4.5.4 / biome 2.5.12 / react 19.2.8 / graphql-codegen 7.4 系 / lucide 1.40 / playwright 1.62 ほか） |
| `d5d419e` | frontend graphql ^16.14.2 / @types/node ^25.9.5 パッチ、メジャー据え置き整理 |
| `fc19f2a` | bff パッチ/マイナー（hono 4.13.5 / @hono/node-server 2.1.1 / jose 6.2.10 / lru-cache 11.5.2 / tsx 4.23.13 / argon2 0.45.1） |
| `c91d37d` | bff ioredis 5 → 6（実接続 PING/GET 確認済み） |

検証: frontend typecheck+build 通過、bff typecheck+build 通過、backend `just compile` 通過。

## 見送り（理由つき）— 上げてはいけない/保留

### frontend
- **graphql 17**: `graphql-request@7.4.0`（14–16）、`@graphql-codegen/*`（〜16）、`graphql-config`（〜16）が未対応。peer 制約。→ codegen/graphql-request の v8 対応待ち
- **typescript 7**: `@react-router/dev@7.16.0` ほか react-router 7 系が `^5.1.0 || ^6.0.0`。react-router 8 移行とセット
- **react-router 8**（7.16.0 → 8.3.1）: ESM-only 化、`react-router-dom` 廃止（本プロジェクト未使用）、middleware / Vite Environment API がデフォルト化しサイレントな挙動変化あり。**独立した移行タスク**として実施する
  - 推奨手順: v7 で future flags を有効化 → 警告（後述 `envFile` 等）を消す → v8 codemod
  - 参考: https://reactrouter.com/upgrading/v7 、要件は Node 22.22+/React 19.2.7+/Vite 7+（現状すべて満たす）
- **@types/node 26**: ランタイム node のメジャーと揃える。node 判断（下記）に連動

### bff
- **typescript 7 / @types/node 26**: monorepo 整合（frontend が TS6）と node 判断に合わせて保留

### 既知の警告 / 気づき
- frontend typecheck で `The 'envFile' option is deprecated, please use 'envDir: false' instead.` → react-router 8 移行前の future-flag 整理で対応
- `pnpm` が frontend・bff の**通常 dependency に混入**（`packageManager` で管理すべき）。ルートは `pnpm@11.3.0`、各パッケージは `pnpm@11.5.1` と不一致 → 整理候補

## 残作業（未着手）

### gradle（backend / migrate）※連動注意
- versions プラグイン未導入。`com.github.ben-manes.versions`（Gradle 9 対応は v0.52.0+、最新 0.61.0、座標は `io.github.ben-manes` へ移行中）を入れると `dependencyUpdates` で棚卸し可能
- 明示ピン依存: jooq 3.21.5 / commons-* / caffeine 3.2.4 / password4j 1.8.4 / lombok 1.18.46 / spotless 8.6.0 / datafaker / postgresql / testcontainers など → 個別に最新確認
- **連動**: quarkus・liquibase・jooq は mise / migrate / backend で足並みを揃える

### mise（ツールチェーン）※「全部」方針だが devcontainer 影響大
- 🟢 安全: java 25.0.2→25.0.4 / gradle 9.5.1→9.7.1 / terraform 1.14.6→1.16.1 / ansible-core 2.20.3→2.21.3 / uv 0.11.14→0.12.9 / task 3.51.1→3.53.1 / just 1.51.0→1.58.0 / lazydocker 0.23.3→0.25.2 / gh 2.92.0→2.100.0 / kamal 2.11.0→2.12.0
- 🟠 連動: liquibase 5.0.3→5.0.4（migrate `liquibase-core` と lpm）/ quarkus 3.36.2→3.39.2（backend BOM・プラグインと）
- 🔴 メジャー: node 24.14→26.8（LTS 24 → 最新、@types/node 26 と連動）/ ruby 3.4→4.0 / vault 1.21→2.1（サーバ互換注意）/ python 3.13→3.14
- ⚪ `latest` 固定（toml 変更不要・再インストールで最新化）: opencode / @antfu/ni / @openai/codex / @anthropic-ai/claude-code
- **実行順の注意**: node を上げるとセッション途中で pnpm 作業が不安定化するため、mise メジャーは pnpm/gradle を仕上げた**最後**に反映。完全反映は devcontainer 再ビルド前提

## 再開時のTODO（順序）
1. gradle 明示ピン依存の最新確認（必要なら versions プラグイン導入）
2. quarkus 3.39.2 / liquibase 5.0.4 を gradle + mise 揃えて更新 → backend build / migrate validate で検証
3. mise 🟢 安全ツールを更新
4. mise 🔴 メジャー（node/ruby/vault/python）を反映 → devcontainer 再ビルドで確認
5. （別タスク）react-router 8 移行。完了後に graphql 17 / typescript 7 を再検討
