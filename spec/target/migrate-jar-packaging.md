# migrate の jar 化と backend への取り込み

`migrate` を jar として固め、backend の依存に含める仕組みの概要メモです。
DB スキーマの唯一の正を `migrate` に保ちつつ、backend からは jOOQ 生成型を型安全に使えるようにするのが目的です。

## 1. 全体像

```
migrate (java-library)
  ├─ src/main/resources/db/changelog/   … Liquibase changelog（スキーマの正）
  └─ build/generated/.../jooq-codegen/   … jOOQ 生成型（changelog から生成）
        │
        │  jar 化（main のソース＋リソース）
        ▼
backend (Quarkus)
  └─ implementation "com.cxisystem:migrate:1.0.0"
        → com.cxisystem.jooq.* を型安全に利用
```

`migrate` の成果物には次の 2 つが入ります。

- jOOQ 生成型（`com.cxisystem.jooq.*`）
- Liquibase changelog リソース（`db/changelog/**`）

backend が実際に使うのは主に **jOOQ 生成型** です。

## 2. migrate 側（jar の中身を作る）

`migrate/build.gradle` の要点。

- `plugins { id 'java-library' }` … ライブラリとして jar 化できる構成。
- jOOQ 生成物を main ソースに含める:
  ```gradle
  def jooqOutDir = "$buildDir/generated/sources/jooq-codegen"
  sourceSets { main { java.srcDir(jooqOutDir) } }
  ```
  これで生成型が jar の main 成果物に入る。
- `jooqCodegenWithTestcontainers` タスクが、Testcontainers で PostgreSQL を起動 → Liquibase changelog を適用 → その状態から jOOQ コードを生成。
- `tasks.named('compileJava') { dependsOn 'jooqCodegenWithTestcontainers' }` … 生成 → コンパイルの順序を保証。
- changelog は `src/main/resources/db/changelog/` に置かれるため、リソースとして jar に同梱される。

## 3. backend 側（jar を取り込む）

### 3.1 依存の宣言

`backend/build.gradle`:

```gradle
// migrate codegen
implementation "com.cxisystem:migrate:1.0.0"
```

### 3.2 included build による差し替え

`backend/settings.gradle`:

```gradle
includeBuild("../migrate") {
    dependencySubstitution {
        substitute module("com.cxisystem:migrate") using project(":")
    }
}
```

- ローカル開発では、Maven リポジトリに publish 済みの jar を取りに行かず、隣の `../migrate` プロジェクトを included build として直接参照する。
- `dependencySubstitution` で `com.cxisystem:migrate` を included build のプロジェクトに差し替えるため、`migrate` を変更するとそのまま backend のビルドへ反映される。

### 3.3 コード生成の連鎖

`backend/build.gradle`:

```gradle
tasks.register("codegen") {
    dependsOn(gradle.includedBuild("migrate").task(":jooqCodegenWithTestcontainers"))
}
tasks.named("compileJava") { dependsOn("codegen") }
```

- backend の `compileJava` が `codegen` → migrate の `jooqCodegenWithTestcontainers` に連鎖する。
- 結果として、backend をビルドすれば changelog に沿った最新の jOOQ 生成型が用意された状態でコンパイルされる。

## 4. マイグレーション適用との関係（重要）

- backend は **実行時に Liquibase を走らせない**（`quarkus-liquibase` 依存や `application.yaml` の liquibase 設定は持たない）。
- 実際の DB スキーマ適用は `migrate` 側で別途行う（`cd migrate && task up` など）。
- したがって jar は「backend 起動時に自動マイグレーションする」ためではなく、
  **changelog を正としたスキーマから生成した jOOQ 型を backend へ配布する**ためのもの。

## 5. まとめ

- スキーマの唯一の正は `migrate` の Liquibase changelog。
- `migrate` は Testcontainers 上で changelog を適用して jOOQ 型を生成し、jar（main 成果物）に含める。
- backend は included build ＋依存差し替えで `migrate` を取り込み、`compileJava` 前に codegen を連鎖させて型を最新化する。
- DB への適用自体は `migrate` の Liquibase 運用（`task up` 等）で行い、jar の役割は型の配布が中心。
