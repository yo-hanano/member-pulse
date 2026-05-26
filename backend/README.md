# バックエンド開発メモ

Quarkus ベースの GraphQL サーバー開発で必要になるコマンドや注意点を整理しています。

## 構成について

migrate プロジェクトを `includeBuild` し、生成された jOOQ 型や共通ライブラリを直接参照しています。migrate 側で codegen を走らせないとビルドに失敗するので注意してください。

## 開発サーバー起動

Vault や DB のシードは Dev Container の `post-start.sh` が実行します。Dev Container では `VAULT_ADDR` / `VAULT_TOKEN` / `VAULT_TRANSIT_KEY` が既に環境変数として渡されるため、そのまま以下の手順で起動できます（コンテナ外で実行する場合は同等の環境変数を用意してください）。

```bash
./gradlew codegen
./gradlew quarkusDev
```

コンテナ外で作業する場合は `mise activate` と `mise.toml` の `[env]._.file`、またはシェルの `export` で環境変数を事前に設定するとスムーズです。

### just ショートカット

`backend` ディレクトリで以下を実行すると、よく使う Gradle コマンドを短く呼び出せます。

```bash
just dev       # ./gradlew quarkusDev
just codegen   # ./gradlew codegen
just compile   # ./gradlew compileJava
just test      # ./gradlew test
just build     # ./gradlew build
just format    # ./gradlew spotlessApply
just check     # ./gradlew spotlessCheck test
```

---

## Quarkus Extension の追加

- [Quarkus Extension 一覧](https://quarkus.io/extensions/)

### 例: GraphQL Extension 追加

```bash
quarkus ext add io.quarkus:quarkus-smallrye-graphql
```

---

## デバッグ設定（VS Code 用 launch.json 例）

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Quarkus Attach",
      "request": "attach",
      "hostName": "127.0.0.1",
      "port": "5005",
      "projectName": "backend"
    }
  ]
}
```

サーバー起動後に Attach してください。

---

## GraphQL / Dev UI

- GraphQL スキーマ: [http://localhost:8080/graphql/schema.graphql](http://localhost:8080/graphql/schema.graphql)
- GraphQL UI: [http://localhost:8080/q/graphql-ui/](http://localhost:8080/q/graphql-ui/)

### GraphQL の関連解決ルール

GraphQL の field resolver は、**原則 async** で書きます。
`@ActivateRequestContext` と `vtSupplyAsync(...)` をセットにして、別テーブル参照やマスタ引き当てをまとめて解決します。
同期 resolver にするのは、純粋な値返却で request context も別テーブル参照も不要と明確に言える場合だけにします。

#### 1:1 の関連

- 単一の関連項目を返す resolver は `@Source Parent` で定義します
- 別テーブル参照があるなら、`CompletableFuture<T>` を返す resolver にして `vtSupplyAsync(...)` で解決します
- 取得対象が一覧で何度も出るなら、1 件ごとの resolver ではなく batch resolver に寄せて N+1 を避けます

例:

- `Student.branchId` は `Student` から 1 件を解決する関連
- `Student.primaryGuardian` は `Student` から 1 件を解決する関連
- `Student.schoolGradeName` は一覧向けの表示項目なので、`Student` 群をまとめて batch 解決します

#### 1:N の関連

- 1:N の関連は、原則として `@Source List<Parent>` で batch resolver を作ります
- 子を 1 件ずつ引く実装は避け、親の一覧から必要な ID を集めてまとめて取得します
- `CompletableFuture` や `vtSupplyAsync(...)` を使う場合は、`@ActivateRequestContext` を必ず付けます

例:

- `BranchResolver.area(...)` / `BranchResolver.prefecture(...)`
- `StudentResolver.schoolGradeName(...)`

#### 実装判断の基準

- 迷ったら batch 化する
- 迷ったら `@ActivateRequestContext` を付ける
- 1:1 でも一覧で件数が増えるなら batch 化を優先し、`CompletableFuture<List<T>>` で返す
- field resolver は基本 `CompletableFuture<T>` / `CompletableFuture<List<T>>` で返す
- 1:N は row-by-row で解決しない

### Quarkus Dev UI

- 管理画面: [http://localhost:8080/q/dev-ui](http://localhost:8080/q/dev-ui)
- 主な用途
  - `Config` などのタブから設定値や拡張機能の状態を確認
  - SmallRye GraphQL のスキーマやクエリを GUI で試す
  - Vault / Data Source のステータス確認
- Dev Services を使わず Vault など外部サービスに依存しているため、起動完了前にアクセスすると 500 エラーになることがあります。Dev Container のバックグラウンドサービスが立ち上がった後に開いてください。

---

## サンプル GraphQL クエリ

```graphql
query allPlans {
  allPlans {
    id
    name
  }
}
```

---

## jOOQ/GraphQL Type ファイル生成

最新のスキーマ情報で jOOQ/GraphQL の型を生成します（migrate を include しているため backend からも実行可能）。

```bash
./gradlew codegen
```

---

## DBアーキテクチャ設計方針

### jOOQを活かした設計

jOOQは「SQL First」のライブラリで、本プロジェクトでは jOOQ の DSL と Record を素直に使えるよう、更新系は Service、参照系は Dao に集約するスタイル を採用します。

**理由:**
- **DDD方式に寄せると**
  - Record → ドメイン変換が常に必要になり、開発負荷が増える
  - Repository.save() が実質 record.store() のラッパーとなり、抽象化の価値が薄い

- **Active Record 方式に寄せると**
  - Service に findXxx() が増えて参照ロジックが散在しやすい
  - Service がテーブル構造に引きずられ、役割が肥大化する

そのため、このプロジェクトではService + Daoスタイルを採用しています。

### 構造

```
Service (ビジネスロジック + CUD操作)
  ├─ record.store() / dsl.update() で直接永続化
  └─ Dao経由でSELECT
       ↓
     Dao (find系のみ)
```
### 責務分担

| 層       | 責務                     | 理由                                                                 |
|----------|--------------------------|----------------------------------------------------------------------|
| **Service** | ビジネスロジック、CUD操作 | jOOQのRecord.store()を直接使用するため。                             |
| **Dao**     | SELECT系のみ             | find系をServiceに直書きすると肥大化するため分離。Repositoryだと「DB全般の責務」を想起させ、CUD操作も含める必要があると捉えられるためDaoと命名。 |

## エラー処理方針

- **リソース未存在**
  Service 層で `NotFoundException`（`@ErrorCode("NOT_FOUND")`）をスロー

- **入力値不正**
  バリデーションアノテーション（`@Valid` / `@NotNull` / `@Min` / `@Max` / `@Pattern`）による自動検証
  → `ConstraintViolationException` が発生

- **システムエラー**
  予期しない例外はそのまま `RuntimeException` として扱う

---

## 備考

### backend プロジェクト作成コマンド

参考: 初期セットアップ時に利用したコマンド

```bash
quarkus create app com.cxisystem:backend --gradle
```

---

### Gradle バージョンアップ

```bash
./gradlew wrapper --gradle-version=9.2.1
```

### quarkus 指定バージョンアップ
```bash
quarkus update -P 3.27.2
```
---
