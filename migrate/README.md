# migrate - Liquibase CLI + Task による DB マイグレーション

`member-pulse` の DB スキーマは Liquibase CLI v5 と Taskfile で管理します。
`migrate` は Java 25 前提です。DB 変更は Liquibase changelog 経由で行い、backend の DB アクセス用 jOOQ 型は changelog から再生成します。

## 基本方針

- root の master changelog は YAML、schema / seed changelog は formatted SQL を基本にする
- DB スキーマ変更は `src/main/resources/db/changelog/schemas` 配下に追加する
- 旧 juku-ops の塾ドメイン（student / guardian / school / lesson / billing など）は新規実装へ持ち込まない
- 共通マスタは `code` 主キー、会社固有・業務固有データは `VARCHAR(21)` の nanoid 形式を基本にする
- RLS は `company_id` を持つテーブルに自動適用される前提で、RLS をバイパスしない
- generated changelog は草案として扱い、責務ディレクトリへ移してから changeset ID、rollback、コメントを整える

## changelog の配置

現在の master changelog は次の順で include します。

```txt
src/main/resources/db/changelog/
  db.changelog-master.yaml
  schemas/
    users/
      create-users-rls-policy-event-trigger.sql
    tables/
      foundation/
        common_master/   # gender, prefecture などの共通コードマスタ
        identity/        # company, employee, employee_token
      domains/
        member_pulse/    # 月次レビュー SaaS の業務テーブル
    seeds/
      seed-initial-data.sql
```

新しい業務テーブルは原則 `schemas/tables/domains/member_pulse/` に追加します。共通マスタは `foundation/common_master/`、認証・会社・従業員系は `foundation/identity/` に置きます。

`Taskfile.yaml` の `task diff` / `task gen` は既定で `schemas/tables/maintenance/_generated/` に生成します。このディレクトリは作業場です。生成 SQL はそのままコミットせず、内容を確認して適切な責務ディレクトリへ移してください。

## profiles と接続情報

接続情報はルートの `profiles/<profile>.env` で管理します。既定は `local` です。

1. サンプルをコピーして値を設定
   ```sh
   cp profiles/template.env profiles/local.env
   ```
2. `mise trust` を実行
3. 必要に応じて `mise.toml` の `[env]._.file` を切り替え
4. 現在のプロファイルを確認
   ```sh
   mise run profile:print
   ```

`profiles/*.env` は Git 管理対象外です。秘密情報は Vault / env / Secret Manager などで扱い、コードへハードコードしません。

## よく使うコマンド

以下は `migrate` ディレクトリで実行します。

### マイグレーション実行

```sh
task up
```

`liquibase update` 後に snapshot を取得し、次回の diff 比較元を更新します。

### 状態確認

```sh
task st
```

### dry run

```sh
task sql
```

`OUT=...` を指定すると SQL をファイルへ出力します。

### バリデーション

```sh
task validate
```

changelog の構文と DB との整合性を確認します。

### rollback

```sh
COUNT=1 task rb
```

指定件数だけ rollback し、その後 snapshot を取り直します。

### タグ指定 rollback

```sh
TAG=checkpoint_20260526_210000 task rbt
```

指定タグまで rollback し、その後 snapshot を取り直します。

### checksum クリア

```sh
task clear
```

ローカル開発 DB で changelog を調整したあと、checksum 不一致を解消したい場合に使います。共有済み・本番適用済み changeset の修正には使わず、新しい changeset を追加してください。

## changelog 作成手順

1. 最新 changelog を適用
   ```sh
   task up
   ```

2. 必要に応じて snapshot を取得
   ```sh
   task snapshot
   ```

3. changelog を手書き、または DB 差分から草案を生成
   ```sh
   task diff
   ```

4. 生成 SQL を確認し、責務ディレクトリへ移動

   - 共通コードマスタ: `schemas/tables/foundation/common_master/`
   - 会社・従業員・認証: `schemas/tables/foundation/identity/`
   - member-pulse 業務テーブル: `schemas/tables/domains/member_pulse/`
   - 複数領域をまたぐ補正や既存データ補完: 必要になった時点で `maintenance/alter/` / `maintenance/backfill/` を追加

5. SQL changelog を整える

   - changeset ID は重複しない名前にする
   - `COMMENT ON TABLE` と `COMMENT ON COLUMN` を付ける
   - 可能な範囲で `--rollback` を付ける
   - RLS 対象テーブルには `company_id` を持たせる
   - 共通マスタは `code`、会社固有マスタ・業務データは nanoid 形式の `id` を使う

6. 検証
   ```sh
   task validate
   ./gradlew jooqCodegenWithTestcontainers compileJava
   ```

## jOOQ 生成

changelog から Testcontainers PostgreSQL を起動して jOOQ 型を生成します。

```sh
./gradlew jooqCodegenWithTestcontainers
```

通常は compile 時にも自動実行されます。

```sh
./gradlew compileJava
```

生成物は `migrate/build/generated/sources/jooq-codegen` 配下です。生成物を手で編集しません。

## 初期データ

初期データは `schemas/seeds/seed-initial-data.sql` で管理します。現在は次の最小データを持ちます。

- 初期 `company`
- 初期管理者 `employee`
- `gender`
- `prefecture`
- `cost_item_template`

会員、見込み客、月次レビューなどの業務サンプルデータはまだ固定 seeder を持ちません。必要になった時点で member-pulse 用の seeder と運用ルールを追加します。

## Liquibase JDBC ドライバ

Liquibase v5 は JDBC ドライバを自動同梱しません。`org.postgresql.Driver` が見つからない場合は、`migrate` ディレクトリで PostgreSQL ドライバを登録します。

```sh
liquibase lpm add -g postgresql
```

`migrate/liquibase.json` が更新された場合、他の環境では次を実行して反映します。

```sh
liquibase lpm install
```

## 利用可能な Task

```sh
task help
```

現時点では旧 juku-ops の `seed` / `school` タスクはありません。member-pulse 用のデータ生成が必要になったら、ドメイン仕様に合わせて新規に追加します。
