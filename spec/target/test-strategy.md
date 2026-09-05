# テストコード整備計画（2026-09）

member-pulse にはテストコードがありませんでした。この文書は、何から書くか・何を書かないかを決めて、
段階的に入れていくための計画です。第 1 段階（backend の土台と往復テスト）は実装済みです。

## 1. 現状

| 層 | テスト | 備考 |
|---|---|---|
| `backend` | **第 1 段階を実装済み**（`AreaGraphQlTest` 5 件） | 土台は `GraphQlTestSupport` / `GraphQlTestProfile`。`rest-assured` を追加した |
| `migrate` | **なし** | `jooqCodegenWithTestcontainers` で fresh DB を立てる仕組みは既にある |
| `bff` | **なし** | test runner 自体が未導入 |
| `frontend` | **なし** | `playwright` が devDependency に入っているだけで、設定もテストも無い |

CI も未整備で、品質の担保は `build` / `typecheck` / `check` と手動確認に頼っています。

### なぜ今書くのか（実際に起きたこと）

依存メンテナンス（2026-09）で quarkus を 3.36.2 → 3.39.2 に上げたとき、テストが無いため
**手動でブラウザを開いて疎通を確認する**しかありませんでした。そしてその手動確認の過程で、
依存更新とは無関係の既存バグが 1 件見つかりました。

- **症状**: エリアの作成・編集で「表示順」が保存されない（`displayOrder` が常に null）
- **原因**: `AreaInput` / `AreaOrderInput` のフィールド名が `dispOrder` で、DB カラム `display_order` と
  対応しない。`AreaService` の `create` / `update` は jOOQ の `Record.from(input)` に依存しているため、
  名前が一致しないフィールドは黙って無視される。`name` は一致するので保存され、`dispOrder` だけ落ちる
- **同種の入力の比較**: `LocationInput` / `MembershipPlanInput` は `displayOrder` なので正常。Area だけ命名が違う
- **並び順のドラッグ保存は無事**: `updateOrders` は `set(AREA.DISPLAY_ORDER, ...)` と明示的に書いているため動く

**「作って、取り直して、入れた値が返るか」を見るだけのテストが 1 本あれば防げた**バグです。
しかも黙って落ちるので型検査でもビルドでも lint でも捕まりません。この計画はここを起点にします。

**対応済み**: フィールド名を `displayOrder` に揃え、GraphQL 上の名前は `@Name("dispOrder")` で維持した
（計画 §8 の案 (b)）。`AreaOrderInput` も実害は無かったが命名を揃えている。あわせて往復テストを入れ、
**修正を一時的に戻すとテストが 2 件落ちる**ことまで確認した（テストがこのバグを実際に捕まえる証明）。

## 2. 方針

- **壊れうる性質を検証する。期待値を丸ごと固定しない**。データが動くたびに壊れるテストは書かない
- **最初に厚くするのは backend の GraphQL 契約テスト**。frontend / bff は backend の振る舞いに乗っているため、
  ここが一番費用対効果が高い
- **RLS と認証境界は最優先**。壊れたときの被害が最も大きく、手動では確認しづらい
- **E2E は薄く保つ**。主要導線だけを通し、細かい分岐は下の層で担保する
- **書けないものは書かない**。テストのために本体の設計を歪めない
- 参考にするのは `ref/markeman` のテスト設計（後述）。**業務文脈は持ち込まない**

### 検証する「性質」の例

markeman の GraphQL 契約テストが検証している観点をそのまま流用できます。

- 入れた値が取り出せるか（**今回のバグはここ**）
- 空配列と null の区別
- 並び順
- 会社境界（他社データが混ざらない）
- 発行 SQL の件数（N+1 の検出）

## 3. 層ごとの計画

### 3.1 backend（最優先）

Quarkus なので `@QuarkusTest` + RestAssured で実サーバを立て、HTTP で GraphQL を叩きます。
Service を直接呼ぶ形にはしません。**RLS は `@Rls` とトランザクション境界の組み合わせで効くため、
Service を単体で呼ぶと本番と違う経路になる**ためです。

必要な土台（先に 1 本用意する）:

- `GraphQlTestSupport`: クエリ実行、レスポンスの取り出し、エラー判定をまとめる
- **テスト用 JWT の発行**: `quarkus-smallrye-jwt-build`（依存済み）で bff と同じ形の JWT を作る。
  `sub` / `groups` / `iss=cxi-system.com` を揃え、任意の `companyId` を持つユーザーを演じられるようにする
- **DB**: Dev Services は `quarkus.devservices.enabled: false` で切ってあるため、
  testcontainers を明示的に使うか、`migrate` と同じ使い捨て DB の仕組みを共有する

書く順（上から）:

1. **往復テスト（今回のバグの再発防止）**
   `createArea` → `areaById` で `dispOrder` が返るか。同じ形で `location` / `membershipPlan` /
   `member` / `lead` も。**Input のフィールドが DB カラムと対応していない類のバグを機械的に潰せる**
2. **会社境界（RLS）**
   会社 A の JWT で会社 B のデータを引けないこと。`allEmployees` / `memberPagination` /
   `areaById` など、代表的な Query と、`deleteArea` のような他社 ID を指定する Mutation
3. **認証境界**
   JWT なしで 401、`/graphql/schema.graphql` と `/q/*` は素通り、`/public/*` の POST は許可
4. **業務ルール**
   `endMembershipSubscription` の月末制約、`changeMembershipPlan` の履歴の切れ目、
   `generateMembershipFeeRevenues` の冪等性。**仕様の意図が最も出る場所で、回帰したとき気づきにくい**
5. **ページングとソート**
   `*Pagination` の `offset` / `limit` / `orderBy` / `totalCount` の整合

### 3.2 migrate

- `task validate` は既に通しているので、**changelog の rollback が通るか**を足す。
  `--rollback` を書いていても実際に流していないものが混ざりうる
- `jooqCodegenWithTestcontainers` は fresh DB への適用確認も兼ねているため、CI に入れるだけで価値がある
- seed 生成（`task seed`）が例外なく完走することのスモーク

### 3.3 bff

test runner が無いので、まず 1 つ選びます（`vitest` を推奨。markeman も frontend で vitest を使用）。

- **JWT 署名の形**: Vault Transit のレスポンス（`vault:v1:<base64>`）から JWS を組み立てる部分。
  署名そのものは Vault 任せでよいが、**base64url 変換とヘッダの `kid` 付与はこちら側のロジック**
- **セッション**: ログイン → Redis 保存 → `/auth/me` で解決、ログアウトで Pub/Sub に流す
- **JWKS**: Transit の公開鍵から JWKS を組み立てる変換
- Vault と Redis は実物を使う（devcontainer に両方ある）。モックにすると変換の検証が形骸化する

### 3.4 frontend

**unit（vitest）** — 純粋な変換だけに絞る:

- `app/lib/zod-helpers` のバリデーション
- 日付・金額のフォーマッタ
- `useTableSearchParams` の `orderBy` ⇔ ソート状態の変換（`transforms` 込み）

**E2E（playwright）** — 主要導線だけ:

1. ログイン → ダッシュボード表示 → ログアウト
2. マスタの CRUD 1 本（エリアで十分。**作成時に入力した表示順が一覧に出ることまで見る**）
3. 一覧のページング・ソート・フィルタが URL に載り、リロードで復元される
4. リード → 体験 → 入会の導線

設定は `playwright.config.ts` + `tests/global-setup.ts` + `.env.test`（markeman と同じ構成）。
**認証情報は `.env.test` に置き、リポジトリにはテンプレートだけを置く**。

E2E は backend / bff / DB が起動している必要があるため、起動の面倒を `globalSetup` に寄せるか、
起動済みを前提にするかは実装時に決めます。

## 4. 段階

| 段階 | 内容 | 目的 |
|---|---|---|
| ~~**第 1 段階**~~ **完了** | backend のテスト土台（`GraphQlTestSupport` + JWT 発行）と往復テスト | 今回のバグを再現・修正して、二度と起きない状態にした |
| **第 2 段階** | 会社境界（RLS）と認証境界 | 被害の大きい箇所を先に固める |
| **第 3 段階** | 業務ルール（契約・売上生成）とページング | 仕様の意図を残す |
| **第 4 段階** | frontend の unit と E2E 主要導線、bff の変換テスト | 手動確認の置き換え |
| **第 5 段階** | CI で `build` / `test` / `typecheck` / `check` / `validate` を回す | 回帰を自動で止める |

第 1 段階だけでも「依存を上げたあと手でブラウザを開く」作業がかなり減ります。

### 第 1 段階で入れたもの（2026-09-05）

| ファイル | 役割 |
|---|---|
| `src/test/java/com/cxisystem/test/GraphQlTestSupport.java` | クエリ実行、JWT 発行、Redis へのセッション投入 |
| `src/test/java/com/cxisystem/test/GraphQlTestProfile.java` | テスト時だけ JWT の鍵をローカル鍵ペアへ差し替える |
| `src/test/java/com/cxisystem/feature/AreaGraphQlTest.java` | 往復テスト・認証境界・バリデーション（5 件） |
| `src/test/resources/application.properties` | 接続先とテストポート |
| `src/test/resources/test-{private,public}-key.pem` | テスト専用の RSA 鍵ペア |

**認証の再現方法**: backend は JWT の `jti` を Redis キーとして `UserInfo` を引き、そこから `companyId` を
得て RLS を張る（`AppIdentityAugmentor` → `RlsInterceptor`）。そのためテストは「Redis へ UserInfo を置く」と
「その sessionId を `jti` に載せた JWT を発行する」の両方を行う。本番と同じ経路をなぞるため、
Service 直呼びにはしていない。

**引っかかった点**: devcontainer が `MP_JWT_VERIFY_PUBLICKEY_LOCATION`（bff の JWKS）を環境変数で渡しており、
環境変数は `application.properties` より優先度が高い。`%test.` プレフィックスでは上書きできず 401 になるため、
`QuarkusTestProfile` の `getConfigOverrides()` で上書きしている。

## 5. 実行方法（想定）

既存のコマンド体系に合わせます。新しい入口は増やしません。

- backend: `just test` / `just check`（現状 NO-SOURCE で通っているものが実際に動くようになる）
- migrate: `task validate` に加えて rollback 確認のタスクを足す
- bff: `pnpm run test`
- frontend: `pnpm run test`（unit）と `pnpm run test:e2e`（playwright）

## 6. 参考にした実装

`ref/markeman` のテスト設計を土台にしています（backend 77 ファイル / frontend E2E 21 ファイルの実績）。
引いた考え方:

- **実サーバを立てて HTTP で叩く**。MockMvc 相当で済ませない。非同期のディスパッチまで本番と同じ経路を通すため
- **期待 JSON を丸ごと固定しない**。データが動くたびに壊れるため、検証は「空配列と null の区別・並び順・
  SQL 件数・会社境界」に絞る
- **SQL 件数を数えるテスト**（`SqlExecutionCounter`）で N+1 を検出する
- frontend は vitest（unit）と playwright（E2E）を分け、E2E は `.env.test` + `globalSetup` で認証を通す

`ref/cr-checkers` は E2E を薄く保ち（`tests/` に手動確認用のキャプチャスクリプトを置く程度）、
テストの重心を置いていません。member-pulse は backend に業務ロジックが集まる構成なので、
markeman 寄りの重心（backend を厚く、E2E を薄く）が合います。

## 7. 未確定事項

実装に入る前に決める必要があるもの。

- **テスト用 DB の立て方**: `@QuarkusTest` から testcontainers を直接使うか、`migrate` の
  `jooqCodegenWithTestcontainers` と同じ仕組みを共有するか。後者なら changelog の適用も同時に検証できる。
  **現状は開発用 DB（`member_pulse_dev`）をそのまま使っている**。テストは作ったデータを `finally` で消すが、
  削除は論理削除なので `deleted_at` 付きの行が回すたびに積もる。実害は出ていない（未削除の行は seed のまま）が、
  隔離した DB へ移すのが本筋
- **テストデータの作り方**: seed をそのまま使うか、テストごとにフィクスチャを作るか。
  会社境界のテストには **2 社目のデータ**が要るが、現在の seed は 1 社分しかない
- **CI の実行環境**: testcontainers が動く必要がある。GitHub Actions を使うかどうか
- **bff の test runner**: vitest で確定してよいか

## 8. 直近の宿題

- ~~`AreaInput` / `AreaOrderInput` の `dispOrder` バグを直す~~ → **完了**（案 (b) を採用し、往復テストとセットで実装）
- 次は第 2 段階（会社境界・認証境界）。**会社境界のテストには 2 社目の seed データが必要**
