# 依存メンテナンス記録（2026-09）

しばらく触れていなかった依存関係の棚卸しと更新の作業記録です。
中断・再開しやすいよう、判断理由と残作業をここに集約します。

## 方針

- リスク別に「🟢 パッチ/マイナー（安全）」「🟠 連動が必要」「🔴 メジャー」に分けて進める
- 各段で typecheck / build 等を通してからコミットする
- コミットは領域ごと（frontend / bff / gradle / mise）に分ける
- 「最新」でも peer 制約やエコシステム未対応なら**上げない**
- 判断に迷う箇所は `cr-checkers` の実績を優先する（同一スタック・本番稼働中の先行事例）

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
| `db13e10` | （docs）本メモの初版 |

## 完了済み（2026-09-05 / 未コミット）

### frontend: react-router 8 移行
- `react-router` / `@react-router/{dev,fs-routes,node,remix-routes-option-adapter}` 7.16.0 → **8.3.1**
- `react-router.config.ts` の `future.v8_*` 5 フラグを削除（v8 で既定化・廃止）。`ssr: false`（SPA モード）は維持
- `app/root.tsx` の nuqs adapter を `nuqs/adapters/react-router/v7` → `v8`
- `@types/node` ^25.9.5 → **^26.4.1**、`lucide-react` ^1.40.0 → ^1.41.0、`playwright` ^1.62.1 → ^1.63.0
- **想定より小さい移行で済んだ理由**: v8 の future flags が既に全て有効化済みで、実質「フラグを外して本体を上げる」だけだった。`remix-flat-routes` + `remix-routes-option-adapter` 構成も v8 でそのまま動く

### frontend / bff: pnpm 混入の解消
- `frontend` / `bff` の通常 `dependencies` から `pnpm` を削除
- `packageManager` をルート・frontend・bff とも **`pnpm@11.9.0`** に統一
- `mise.toml` に `pnpm = "11.9.0"` を追加し、toolchain 側で一元管理する（cr-checkers と同じ形）

### bff
- `hono` ^4.13.5 → ^4.13.7、`jose` ^6.2.10 → ^6.2.12（いずれもパッチ）
- `@types/node` ^25.9.1 → ^26.4.1

### mise.toml
| tool | before | after | 備考 |
|---|---|---|---|
| node | 24.14.0 | **24.20.0** | 24 系 LTS 据え置き（26 へは上げない。下記判断参照） |
| pnpm | （なし） | **11.9.0** | 新規追加 |
| python | 3.13.12 | **3.14.7** | cr-checkers が 3.14 系で稼働中 |
| java | temurin-25.0.2+10.0.LTS | **temurin-25.0.4+7.0.LTS** | Adoptium GA は `jdk-25.0.4+7`。registry の `+101` は GA ではないので採らない |
| ruby | 3.4.8 | **4.0.6** | cr-checkers が 4.0 系で稼働中 |
| gradle | 9.5.1 | **9.7.1** | |
| terraform | 1.14.6 | **1.16.1** | |
| ansible-core | 2.20.3 | **2.21.3** | |
| uv | 0.11.14 | **0.12.10** | |
| task | 3.51.1 | **3.53.1** | |
| just | 1.51.0 | **1.58.0** | |
| lazydocker | 0.23.3 | **0.25.2** | |
| gh | 2.92.0 | **2.100.0** | |
| kamal | 2.11.0 | **2.12.0** | |

据え置き: `vault 1.21.4`、`liquibase 5.0.3`、`quarkus 3.36.2`、`distill 1.5.2`（理由は後述）

### 検証
ホスト側（devcontainer 外）で `npx pnpm@11.9.0` を使って実施。

- frontend: `typecheck` ✅ / `build` ✅（SPA Mode で `build/client/index.html` 生成まで確認）
- bff: `typecheck` ✅ / `build` ✅
- backend / migrate: **未検証**（当環境に mise / gradle が無く、java も 21。devcontainer 内で別途必要）

## 判断の根拠（cr-checkers 参照）

`~/workspace/cr-checkers` は member-pulse とほぼ同構成（Mantine 9 / remix-flat-routes / remix-routes-option-adapter / nuqs / vite 8 / TS 6）で **react-router 8.1.0 系を本番稼働**させている。今回はこれを参照実装として使った。

そこから引いた判断:

- **react-router 8 は行ける**: 同じルーティング構成の稼働実績があるため、doc 初版の「別タスク扱い」から前倒しした
- **node は 26 に上げない**: cr-checkers は node 24 系のまま。node 26 が LTS 入りするのは 2026-10 で、現時点では Current。devcontainer リビルドのリスクに見合わない
- **@types/node 26 は node 24 と切り離してよい**: cr-checkers が node 24 + @types/node 26 の組み合わせで稼働している
- **typescript は 6 据え置き**: cr-checkers も 7 に上げていない。react-router 8 の peer は `^5.1.0 || ^6.0.0`
- **pnpm は mise 管理**: cr-checkers は `mise.toml` の `pnpm` で固定し、package.json の dependencies には入れていない

## 見送り（理由つき）— 上げてはいけない/保留

### frontend
- **graphql 17**（16.14.2 → 17.0.2）: `graphql-request@7.4.0`（14–16）、`@graphql-codegen/*`（〜16）、`graphql-config`（〜16）が未対応。peer 制約。→ codegen/graphql-request の v8 対応待ち
- **typescript 7**（6.0.3 → 7.0.2）: `@react-router/dev@8.3.1` の peer が `^5.1.0 || ^6.0.0`。cr-checkers も 6 据え置き

### bff
- **typescript 7**: monorepo 整合（frontend が TS6）のため保留

### mise
- **vault 1.21.4 → 2.1.0**: メジャー。backend は Vault Transit で JWT 署名し `quarkus-vault` で接続しているため、サーバ／クライアント双方の互換確認が要る。cr-checkers に vault 採用実績が無く参照できない。**単独タスクとして切り出す**
- **liquibase 5.0.3 → 5.0.4 / quarkus 3.36.2 → 3.39.2**: migrate / backend の gradle 側と足並みを揃える必要があり、当環境では検証できないため据え置き（下記「残作業」）

### 既知の警告 / 気づき
- ~~frontend typecheck の `envFile` 非推奨警告~~ → **react-router 8 移行で解消**（typecheck 出力がクリーンになった）
- **`pnpm run check`（biome）が失敗する既存問題**: `biome.json` が `vcs.useIgnoreFile: false` かつ ignore 未設定のため、gitignore 済みの `frontend/build/` まで lint 対象になる。build 実行後に `check` を回すと診断が約 16,700 件出る。ソース側（`app/` 配下）の指摘は `app/generated/graphql.ts`・`app/graphqls/*.graphql`・`tsconfig.json` のフォーマットのみで、いずれも今回の変更とは無関係の既存分。**別途 biome の ignore 設定を入れるべき**
- `pnpm install` が `frontend/pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に更新パッケージを自動追記した（既存の mantine エントリと同じ挙動）
- `ref/cr-checkers` の bind mount は **空**（`.devcontainer/devcontainer.json` に mount 追記済みだが devcontainer 未リビルド）。今回は `~/workspace/cr-checkers` を直接参照した

## 残作業

### gradle（backend / migrate）— 調査完了・適用は devcontainer 内で

Maven Central の `maven-metadata.xml` で確認（2026-09-05 時点）。

| 依存 | 定義箇所 | 現行 | 最新 | 判定 |
|---|---|---|---|---|
| quarkus（BOM / plugin） | `backend/gradle.properties` | 3.36.2 | **3.39.2** | 🟠 mise の quarkus と同時に上げる |
| liquibase-core | `migrate/build.gradle` | 5.0.3 | **5.0.4** | 🟠 mise の liquibase・lpm と同時 |
| jooq / jooq-codegen | `backend` / `migrate` | 3.21.5 | **3.21.8** | 🟢 両方同時。生成物の再生成確認が要る |
| spotless plugin | `backend/build.gradle` | 8.6.0 | **8.10.2** | 🟢 |
| lombok | `backend` / `migrate` | 1.18.46 | **1.18.48** | 🟢 両方同時 |
| commons-collections4 | `backend` | 4.5.0 | **4.6.0** | 🟢 マイナー |
| datafaker | `migrate` | 2.5.4 | **2.7.0** | 🟢 マイナー（seed 生成のみに影響） |
| postgresql | `migrate` | 42.7.11 | **42.7.13** | 🟢 |
| slf4j-simple | `migrate` | 2.0.18 | **2.0.19** | 🟢（2.1.0 は alpha なので採らない） |
| io.smallrye.graphql plugin | `backend` | 2.18.2 | 2.18.2 | ✅ 最新（ライブラリ単体は 2.18.5 だが plugin 経由で解決される） |
| caffeine | `backend` | 3.2.4 | 3.2.4 | ✅ |
| password4j | `backend` | 1.8.4 | 1.8.4 | ✅ |
| commons-lang3 / commons-text / commons-beanutils | `backend` | 3.20.0 / 1.15.0 / 1.11.0 | 同左 | ✅ |
| jnanoid | `backend` | 2.0.0 | 2.0.0 | ✅ |
| commons-dbutils | `migrate` | 1.8.1 | 1.8.1 | ✅ |
| testcontainers-bom | `migrate` | 2.0.5 | 2.0.5 | ✅ |

- versions プラグインは未導入。導入するなら `com.github.ben-manes.versions` / `io.github.ben-manes.versions` とも **0.61.0**（Gradle Plugin Portal で同一バージョンが公開済み。座標は `io.github.ben-manes` へ移行中なのでそちらを使う）
- **gradle wrapper が 9.5.1 のまま**: `backend/gradle/wrapper/gradle-wrapper.properties` と `migrate/gradle/wrapper/gradle-wrapper.properties` の `distributionUrl` が `gradle-9.5.1-bin.zip`。`./gradlew` はこちらを使うため、mise の gradle 9.7.1 を上げても**実ビルドは 9.5.1 のまま**。揃えるなら devcontainer 内で `./gradlew wrapper --gradle-version 9.7.1` を backend / migrate それぞれ実行する（distributionUrl の手編集ではなく wrapper タスクで）
- 検証コマンド: `cd backend && just compile` / `cd migrate && task validate` / `./gradlew jooqCodegenWithTestcontainers compileJava`

### devcontainer 反映
- mise のメジャー（node 24.20 / python 3.14 / ruby 4.0 / java 25.0.4）はリビルドで初めて完全に反映される
- `.devcontainer/devcontainer.json` の `cr-checkers` mount 追記も同時に効く
- リビルド後は frontend / bff とも `pnpm install` をやり直す（今回ホスト側で node_modules を作り直したため）

## 再開時のTODO（順序）
1. gradle wrapper を 9.7.1 へ（backend / migrate それぞれ `./gradlew wrapper --gradle-version 9.7.1`）。mise の gradle と揃える
2. gradle の 🟢 分（jooq 3.21.8 / spotless 8.10.2 / lombok 1.18.48 / commons-collections4 4.6.0 / datafaker 2.7.0 / postgresql 42.7.13 / slf4j-simple 2.0.19）を devcontainer 内で適用し、`just compile` と `jooqCodegenWithTestcontainers` で検証
3. quarkus 3.39.2 / liquibase 5.0.4 を gradle + mise 揃えて更新 → backend build / migrate validate で検証
4. devcontainer リビルドで mise の反映を確認
5. （別タスク）biome の ignore 設定を入れて `pnpm run check` を通す
6. （別タスク）vault 2.x 移行の互換調査
7. （別タスク）codegen / graphql-request の v8 対応後に graphql 17、react-router の peer 更新後に typescript 7 を再検討
