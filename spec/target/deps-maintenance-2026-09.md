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

据え置き: `vault 1.21.4`、`distill 1.5.2`（理由は後述）

`liquibase` と `quarkus` はこの時点では据え置いたが、後半で gradle 側と揃えて更新した（`liquibase 5.0.4` / `quarkus 3.39.2`）。

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
- ~~**liquibase 5.0.3 → 5.0.4 / quarkus 3.36.2 → 3.39.2**~~ → **後半で対応済み**。devcontainer 内で gradle 側と揃えて更新し、`backend build` / `migrate validate` で検証した

### 既知の警告 / 気づき
- ~~frontend typecheck の `envFile` 非推奨警告~~ → **react-router 8 移行で解消**（typecheck 出力がクリーンになった）
- **`pnpm run check`（biome）が失敗する既存問題**: `biome.json` が `vcs.useIgnoreFile: false` かつ ignore 未設定のため、gitignore 済みの `frontend/build/` まで lint 対象になる。build 実行後に `check` を回すと診断が約 16,700 件出る。ソース側（`app/` 配下）の指摘は `app/generated/graphql.ts`・`app/graphqls/*.graphql`・`tsconfig.json` のフォーマットのみで、いずれも今回の変更とは無関係の既存分。**別途 biome の ignore 設定を入れるべき**
- `pnpm install` が `frontend/pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に更新パッケージを自動追記した（既存の mantine エントリと同じ挙動）
- ~~`ref/cr-checkers` の bind mount は **空**~~ → devcontainer リビルド後に有効化済み（`/workspace/ref/` に alcos-portal / cr-checkers / juku-ops / markeman が見えている）

## 完了済み（2026-09-05 後半 / 未コミット）

### gradle wrapper（コミット済み `b5fea82`）
- `backend` / `migrate` とも `gradle-9.5.1-bin.zip` → `gradle-9.7.1-bin.zip`。mise の gradle と一致

### gradle 依存（🟢 分）
| 依存 | 定義箇所 | before | after |
|---|---|---|---|
| jooq / jooq-codegen | `backend` / `migrate` | 3.21.5 | **3.21.8** |
| spotless plugin | `backend` | 8.6.0 | **8.10.2** |
| lombok | `backend` / `migrate` | 1.18.46 | **1.18.48** |
| commons-collections4 | `backend` | 4.5.0 | **4.6.0** |
| datafaker | `migrate` | 2.5.4 | **2.7.0** |
| postgresql | `migrate` | 42.7.11 | **42.7.13** |
| slf4j-simple | `migrate` | 2.0.18 | **2.0.19** |

### gradle 依存（🟠 分）
| 依存 | 定義箇所 | before | after |
|---|---|---|---|
| quarkus（BOM / plugin） | `backend/gradle.properties` | 3.36.2 | **3.39.2** |
| liquibase-core | `migrate/build.gradle` | 5.0.3 | **5.0.4** |

`mise.toml` の `quarkus` (3.36.2 → 3.39.2) と `liquibase` (5.0.3 → 5.0.4) も同時に更新し、`mise install` 済み。

### spotless: eclipse フォーマッタのバージョンを pin（`ref/markeman` 参照）
`eclipse()` はバージョン未指定だと spotless 側の既定 JDT に追随するため、依存更新だけで整形結果が動く。
markeman が `eclipse('4.40')` で固定しているのに倣い、member-pulse も **`eclipse('4.40')`** に変更した。
現行コードに対する整形結果は変わらない（pin 前後とも `spotlessCheck` が同じ状態で通る）ことを確認済み。

markeman にはこのほか `shortenFullyQualifiedTypes()`、`targetExclude 'src/generated/**'`、
コメント規約の `forbidRegex`（issue 番号 / spec 参照の禁止）があるが、これらは整形規約そのものの変更なので
依存メンテとは切り離し、別タスクとする。

### smallrye-graphql の確認（据え置きが正しい）
- Gradle Plugin Portal の `io.smallrye.graphql` plugin の安定最新は **2.18.2**（現行と同じ）。次点は `3.0.0.Beta3` で beta のため採らない
- 実行時ライブラリは quarkus BOM が解決する。3.39.2 では `io.smallrye:smallrye-graphql:2.18.5` が入る（plugin バージョンとは独立して追随する）
- ライブラリ単体の最新は `3.0.0.Beta7` で beta。よって 2.18 系が実質最新安定

### 検証（devcontainer 内）
- `backend`: `./gradlew build` ✅ / `spotlessCheck` ✅ / `test` は NO-SOURCE（テスト未作成）
- `migrate`: `task validate` ✅（liquibase 5.0.4）/ `./gradlew jooqCodegenWithTestcontainers compileJava --rerun-tasks` ✅（生成 79 ファイル）
- backend の `compileJava` は included build 経由で migrate の jOOQ codegen を必ず通るため、jooq 3.21.8 での再生成も同時に確認済み

### 疎通テスト（quarkus 3.39.2 / liquibase 5.0.4 で実施）
backend（`quarkusDev`）と bff（`pnpm run dev`）を実際に起動し、認証境界と RLS 経路まで通した。

| 経路 | 結果 |
|---|---|
| backend 起動 | ✅ `Quarkus 3.39.2 started` / features に agroal, jdbc-postgresql, redis-client, smallrye-graphql, smallrye-jwt, vault, narayana-jta |
| `/q/health` | ✅ Redis `PONG` / Database `UP` |
| `/graphql/schema.graphql` | ✅ 522 行生成（smallrye-graphql 2.18.5 が動作） |
| Redis Pub/Sub | ✅ `Subscribed to Redis channel 'logout'` |
| bff JWKS | ✅ `/.well-known/jwks.json` が RS256 公開鍵を返す（Vault Transit 疎通） |
| ログイン | ✅ `POST /auth/login`（DB 認証 + Redis セッション + Cookie 発行） |
| 認証つき Query（RLS 経路） | ✅ `allEmployees` が自社スコープで 1 件。`allPrefectures` も取得できる |
| 未認証アクセス | ✅ `POST /graphql` が 401 |
| 書き込み（`@Transactional` + `@Rls`） | ✅ `createArea` → `deleteArea` が成功。`companyId` は JWT の会社と一致。作成データは削除して元の 3 件に戻した |
| 起動ログのエラー | ✅ backend / bff とも ERROR・例外なし |

`liquibase 5.0.4` は `task st`（`is up to date`）と `task validate` の両方で確認済み。

### 途中で見つかった既存の不具合・注意点
- **`spotlessCheck` が既に失敗していた**: 機能コミット `2c457d5` の Javadoc が未整形のまま入っていた。`spotlessApply` で解消（`MembershipSubscriptionService.java` の 1 箇所）。spotless 8.6.0 でも同じ違反が出ることを確認済みで、8.10.2 への更新が原因ではない
- ~~**`./gradlew generateSchema` が失敗する既存問題**~~ → **対応済み**（後述）。当初「実害なし」と書いたが誤りで、frontend の `pnpm run gen-schema` がこのタスクに依存しているため、スキーマを取り直せない状態だった
- **devcontainer リビルドで liquibase の lpm ドライバが消える**: `Cannot find database driver: org.postgresql.Driver` になる。`liquibase lpm add -g postgresql` を再実行して復旧する。liquibase 本体のバージョンを上げた直後も同様（インストール先が `installs/.../<version>/bin/lib` のため）
- **mise 更新直後は現行シェルに反映されない**: `eval "$(mise env -s bash)"` を挟むか、シェルを開き直す
- **devcontainer リビルド後は bff / frontend の `pnpm install` が必須**: ホスト側で作った `node_modules` が残っていると `pnpm run dev` が `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` で落ちる。非対話シェルでは `CI=true pnpm install` で通る（bff は対応済み。**frontend は未実施**）

### frontend: biome の対象範囲を直し、診断をゼロにした

`biome.json` が ignore 未設定で、gitignore 済みの `build/` や `.react-router/` まで
lint していたため診断が 11,307 件出ていた。`ref/cr-checkers` に倣って
`files.includes` で除外する。

member-pulse は `biome.json` が `frontend/` 配下、`.gitignore` がリポジトリルートに
あるため `useIgnoreFile` は使えない（ignore file を解決できずエラーになる）。
`includes` で明示する形にした。除外に加えたのは `build` / `.react-router` / `dist` /
`node_modules` と、生成物である `app/generated` および `app/graphqls/schema.graphql`。

除外後に残った実コードの指摘も片付けた。

- 未使用 import の削除（`_core+/_layout`）
- `forEach` のコールバックが `cache.delete()` の boolean を返していたのをブロック本体へ
- `useActionFetcher`: `defaultAction` の引数列を反変位置の `never[]` で受ける形に変え、
  `payload` は `unknown`、`body` は `string | FormData` として `as any` を除去。
  `error` は `ActionResult` に無いため `TAction & { error?: string }` で拾う
- `useTableSearchParams`: `parsers` を nuqs の `UseQueryStatesKeysMap` に置き換え、
  setter の戻り型から `void` を外す（nuqs は Promise を返すため）
- `linter.rules.recommended` を `preset` へ移行（biome 2.5 で非推奨）

`useActionFetcher` でジェネリクス（`TArgs extends unknown[]`）を使う案は採れなかった。
呼び出し側が `useActionFetcher<XxxActionData>({...})` と第 1 型引数を明示しているため、
TypeScript は残りの型引数を推論せずデフォルトを使い、`({ areaId }: { areaId: string })` を
受け付けられなくなる。

結果: `pnpm run check` が診断 0・exit 0。`typecheck` / `build` も成功。

### backend: generateSchema が失敗するのを直した

原因は 2 つ。

1. smallrye-graphql plugin は解決用に `<name>ForClassLoading` / `<name>ForIndexing` と
   いう configuration の copy を作るが、copy には属性が引き継がれない。そのため quarkus の
   deployment variant と runtime variant を選び分けられず、`quarkus-tls-registry-spi` の
   解決に失敗していた。copy 側に `Usage` / `Category` / `LibraryElements` と
   `quarkus.prod.deployment-dependency.<project>` を補って runtime を選ばせる
2. `generateSchema` は `build/classes` を丸ごと読むため test 側タスクと出力が重なるが、
   依存が未宣言で `build` と同時に指定すると Gradle の検証に引っかかっていた。
   `dependsOn classes` と `mustRunAfter` で順序を固定する

検証: `clean build generateSchema` / 単体実行 / `compileJava spotlessCheck test`。
生成物は実行時の `/graphql/schema.graphql`（522 行）とも
`frontend/app/graphqls/schema.graphql` とも完全一致し、`pnpm run gen-schema` も通る。

### gradle versions プラグインを導入した

`io.github.ben-manes.versions` **0.61.0** を backend / migrate 両方に入れた
（markeman と同じ座標・同じバージョン）。`backend/justfile` の `dep-updates` は
プラグイン未導入で動かない状態だったのが解消し、migrate 側にも `task dep-updates` を追加した。

alpha / beta / RC を候補から外す `rejectVersionIf` を入れている。今回 slf4j 2.1.0-alpha や
smallrye-graphql 3.0.0.Beta を「採らない」と判断したのと同じ基準を設定に落としたもの。

導入直後のレポートでは backend / migrate とも**更新候補ゼロ**。今回の更新がすべて最新に
到達していることの裏付けになる（`quarkus-vault 4.9.0` も最新だった）。

### 未着手のまま残るもの
- ~~versions プラグインは未導入~~ → **導入済み**（後述）
- `ref/cr-checkers` の bind mount は devcontainer リビルド後に有効化済み（`/workspace/ref/` に alcos-portal / cr-checkers / juku-ops / markeman が見えている）

## 再開時のTODO（順序）
1. （別タスク）spotless に markeman 相当の規約（`shortenFullyQualifiedTypes` / コメント規約の `forbidRegex`）を入れるか検討する
2. （別タスク）vault 2.x 移行の互換調査
3. （別タスク）codegen / graphql-request の v8 対応後に graphql 17、react-router の peer 更新後に typescript 7 を再検討
