# migrate - Liquibase CLI + Task による DB マイグレーション

Liquibase CLI v5 + Taskfile + 環境変数 + mise による DB マイグレーション運用・開発のためのコマンド例・Tips をまとめています。

## SQLベース運用

root の master changelog は **YAML形式** のままですが、実際の schema / seed changelog は **formatted SQL** を基本とします。`diff-changelog` や `generate-changelog` で生成されるファイルも、既定では `.postgresql.sql` で出力されます。

---

## changelog の配置ルール

テーブル定義の changelog は、作成時期ではなく責務で配置します。運用開始後の変更も、原則として変更対象の責務ディレクトリに新しい changelog ファイルを追加します。

```txt
src/main/resources/db/changelog/schemas/tables/
  foundation/
    common_master/  # 性別、都道府県、学年、予定種別、続柄などの共通コード
    identity/       # 会社、従業員、認証・招待トークン
    organization/   # エリア、拠点・教室
    academic/       # 学校、科目
  domains/
    customer/       # 問い合わせ、生徒、保護者、請求先、顧客系紐付け
    teacher/        # 講師、所属拠点、対応科目
    contract/       # 受講契約、コース系
    billing/        # 請求、請求明細、入金
    schedule/       # 予定主体、予定、実績・予約系
  maintenance/
    alter/          # 領域横断の補正、最後に回す必要がある変更
    backfill/       # 既存データの移行・補完
    _generated/     # diff-changelog / generate-changelog の一時出力先
```

通常のカラム追加、制約追加、インデックス追加は対象領域のディレクトリへ積みます。たとえば `student` の変更は `domains/customer/`、`billing` の変更は `domains/billing/` に置きます。

`maintenance/alter/` と `maintenance/backfill/` は何でも置き場ではありません。複数領域をまたぐ変更、既存データの補正、FK 順序などの理由で通常領域の後に実行したい変更だけに使います。

`maintenance/_generated/` は `diff-changelog` / `generate-changelog` の作業場です。生成された SQL はそのまま最終成果物にせず、内容を確認して `foundation/`、`domains/`、`maintenance/alter/`、`maintenance/backfill/` の該当ディレクトリへ移動します。移動後にファイル名、changeset ID、rollback、コメントを整えます。

新しい業務領域が増えた場合は `domains/<domain>/` を追加し、`db.changelog-master.yaml` に include 順を明示します。同一ディレクトリ内の実行順はファイル名の timestamp で管理します。

---

## 環境変数ベース運用

環境変数ベースにすることでコマンドの簡略化をしています。
`mise activate` により、`mise.toml` の `[env]._.file` に応じて ルートの `profiles/<profile>.env` を自動的に読み込みます。

---

## プロファイル切り替えと秘密情報の管理

プロファイルごとの接続情報は ルートの `profiles/<profile>.env` に配置します（例: `local`, `stg`, `prod`）。
既定のプロファイルは `mise.toml` の `_.file = "profiles/local.env"` です。`_.file = "profiles/stg.env"` のように書き換えると、その値に対応する `profiles/<profile>.env` を使って実行できます。

1. サンプルをコピーして必要な値を設定
   ```sh
   cp profiles/template.env profiles/local.env
   # 必要に応じて profiles/stg.env, profiles/prod.env を調整
   ```
2. `mise trust` を実行して `mise` 設定を信頼
3. `mise.toml` の `[env]._.file` を `profiles/local.env | profiles/stg.env | profiles/prod.env` のいずれかに切り替え
4. `mise run profile:print` で現在のプロファイルと env ファイルを確認

`profiles/*.env` は Git 管理対象外なので、必要に応じて Secret Manager 等で安全に共有してください。
`profiles/<profile>.env` は必ず明示的に用意してください。接続先を曖昧にしないため、`task` 側での自動フォールバックには依存しません。

---

## 基本コマンド

### マイグレーション実行

```sh
task up
```
実行後に同じPROFILEで自動的に `snapshot` を取得し、次回の `diff` 比較元を最新化します。

### マイグレーション状態確認

```sh
task st
```

### ロールバック（N件巻き戻し）

```sh
COUNT=1 task rb
```
ロールバック完了後も同じ PROFILE で自動的に `snapshot` を取得するため、次回の diff 比較用スナップショットが常に最新状態になります。

### タグ指定ロールバック

```sh
TAG=checkpoint_20260210_000125 task rbt
```
タグ指定ロールバック完了後も同じ PROFILE で自動的に `snapshot` を取得します。

### dry run（SQL出力のみ）

```sh
task sql
```

---

## マイグレーションファイル(ChangeLog)作成手順

1. 最新の変更ログを適用してローカル開発DBを更新
   ```sh
   task up
   ```

2. 最新状態のローカル開発DBのスナップショットを取得
   ```sh
   task snapshot
   ```
   スナップショットは `build/liquibase/baseline-snapshot.json` に保存されます

3. 必要に応じてローカル開発DBを手動で変更（テーブル作成・カラム追加等）

4. スナップショットとローカル開発DBの差分でchangelogを作成
   ```sh
   task diff
   ```
   自動生成された changelog は最終配置ではなく、草案として扱います。出力先は `src/main/resources/db/changelog/schemas/tables/maintenance/_generated/` を基本とします。

5. 生成されたchangelogファイルを確認し、手動変更が期待どおりか検証

   生成結果は業務責務を判断できないため、そのままコミットしません。内容に応じて配置先を決めます。

   - 単一テーブルまたは同一領域の変更: 対象の `foundation/` または `domains/` 配下へ移動
   - 複数領域をまたぐ補正: `maintenance/alter/` へ移動
   - 既存データの移行・補完: `maintenance/backfill/` へ移動
   - 生成 SQL が不要または不自然: 破棄して手書き

6. **運用ルール: rollback追記（SQL changelog）**

   SQL形式の changelog は、各 changeset の末尾に `--rollback` を追記します。

   **AIに編集を依頼する場合の指示プロンプト例:**

   ```
   生成されたSQL形式のchangelogファイルを以下のルールで編集してください：

   1. 各changesetの末尾に適切なrollback文を追記
      - CREATE TABLE → DROP TABLE
      - CREATE INDEX → DROP INDEX
      - ALTER TABLE ADD CONSTRAINT → ALTER TABLE DROP CONSTRAINT
      - ALTER TABLE ADD COLUMN → ALTER TABLE DROP COLUMN
      - その他の変更も適切なrollback文を追加

   2. rollback文の直後に空行を1行入れる

   変更後のファイル全体を出力してください。
   ```

7. ローカル開発DBをchangelog適用済み扱いにする
   ```sh
   task sync
   ```

8. changelogをgitにコミット

---

## その他のコマンド

### バリデーション（changelogファイルの構文チェック・整合性確認）

```sh
task validate
```

changelogファイルの構文エラーやDBとの整合性をチェックします。
デプロイ前の事前確認に有効です。

### 既存DBからchangelog生成

```sh
task gen
```
既存のDBスキーマ全体をchangelogファイルとして出力します。
出力先は `src/main/resources/db/changelog/schemas/tables/maintenance/_generated/` を基本とします。
生成後は上記の運用ルールに従い、責務ディレクトリへの移動、changeset ID の確認、rollback の追記を行ってください。

### シードデータ生成

```sh
ARGS="--school-count=40 --student-count=100" task seed
```

`migrate/src/codegen/java/com/cxisystem/seed` 配下の Java CLI を Gradle 経由で起動します。
`seed` は既定で `--non-interactive --truncate` を付けるため、基本は毎回クリーンな状態から生成します。
`seed-interactive` は対話入力用で、`PROFILE` や DB 接続先が正しければ実行時に件数などをその場で入力できます。
`seed-initial-data.sql` は初期ログイン用の `company/admin` と master 系だけを持ち、`area` / `branch` / `student` は Java seeder 側で生成します。
`--lead-count` を指定しない場合は `--student-count` の倍のリードを作成し、先頭の生徒件数分を入会済み、残りを入会前リードとして複数ステータスに分散します。

### 学校CSVの取り込み

```sh
ARGS="--truncate" task school
```

`migrate/src/csv` 配下の学校CSVを `public.school` に反映します。
`Loader` で一度 staging に読み込み、その後 jOOQ/SQL で正規化して `school` に upsert します。
`--truncate` は既存の `public.school` を削除して入れ替えるためのオプションです。
学生や教師など、`school` を参照するデータが既にある状態では使わないでください。

### 利用可能なTask一覧

```sh
cd migrate
task help
```

---

## ライブラリの登録管理方法

Liquibase v5 は JDBC ドライバを自動で同梱しないため、`diff-changelog` などの CLI 実行時に
`org.postgresql.Driver` が見つからない場合は、**lpm（Liquibase Package Manager）**で
ドライバを登録します。

### lpm で PostgreSQL ドライバを登録

1. LPM を初期化
   ```sh
   cd migrate
   liquibase lpm
   ```

2. lpm でパッケージを検索
   ```sh
   liquibase lpm search postgres
   ```

3. グローバルに追加（Liquibase の lib に登録）
   ```sh
   liquibase lpm add -g postgresql
   ```

   - `lpm` は **実行したディレクトリの `liquibase.json` に記録**されます
   - このリポジトリでは `migrate/liquibase.json` に管理されます

4. 反映後に再実行
   ```sh
   task diff
   ```

### 他人が更新したライブラリの取り込み

`migrate/liquibase.json` が更新された場合、`migrate` ディレクトリで
以下を実行して依存を反映します。

```sh
liquibase lpm install
```

---

## 備忘録

### create table 時に RLS の設定を合わせた例

（changelog に複数の SQL 文を含める例。カラムを not null に変更するときにデータ追加するなどに使える）

```sql
--liquibase formatted sql

--changeset yo-hanano:create-test-table
CREATE TABLE public.create_test_table (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL,
  memo VARCHAR,
  CONSTRAINT create_test_table_company_id_ck CHECK (company_id > 0)
);

ALTER TABLE public.create_test_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY create_test_table_select_policy
  ON public.create_test_table
  TO company_user
  USING (company_id = current_setting('app.current_company_id')::int);

COMMENT ON TABLE public.create_test_table IS 'createテーブル確認用';
COMMENT ON COLUMN public.create_test_table.id IS 'ID';
COMMENT ON COLUMN public.create_test_table.company_id IS '企業ID';
COMMENT ON COLUMN public.create_test_table.memo IS 'メモ';

--rollback DROP POLICY IF EXISTS create_test_table_select_policy ON public.create_test_table;
--rollback DROP TABLE IF EXISTS public.create_test_table;
```

---

## 構成詳細

### バージョン

- Liquibase CLI: v5
- Java: 21

### 主要な設定ファイル

- [Taskfile.yaml](Taskfile.yaml) - Liquibase CLI タスク
- [build.gradle](build.gradle) - jOOQ codegen 用のGradle設定
- `../mise.toml` - ツールバージョンと現在の env ファイル選択
- `../profiles/<profile>.env` - プロジェクト共通のプロファイル別接続情報（Git管理対象外）
- [src/main/resources/db/changelog/db.changelog-master.yaml](src/main/resources/db/changelog/db.changelog-master.yaml) - マスターchangelogファイル（root は YAML、実体は SQL / SQL preview を include 可能）

### 出力ディレクトリ

- `build/liquibase/baseline-snapshot.json` - DB スナップショットファイル
- `src/main/resources/db/changelog/schemas/tables/` - 適用対象の formatted SQL changelog ファイル
- `src/main/resources/db/changelog/schemas/legacy/tables/` - 退避した旧 YAML changelog ファイル
- `build/generated/sources/jooq-codegen/` - jOOQ 生成コード

---

## よくあるコマンド

```sh
# 開発環境でマイグレーション実行
task up

# スナップショット取得
task snapshot

# 差分changelog生成
task diff

# changelogを適用済み扱いにする
task sync

# 1つ前の状態にロールバック
task rb COUNT=1
```

# sshトンネル
# devcontenerからも使いたい場合は後者
```sh
ssh -N -o ExitOnForwardFailure=yes -L 45432:localhost:5432 x-server
ssh -N -o ExitOnForwardFailure=yes -L 0.0.0.0:45432:localhost:5432 x-server
```
