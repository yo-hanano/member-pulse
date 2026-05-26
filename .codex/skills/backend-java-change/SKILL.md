---
name: backend-java-change
description: juku-ops backend の Java 実装を変更するときに使う。Quarkus の Service/Dao/Resource 変更、RLS 対応、Vault/Redis/DB 連携、影響範囲調査、検証手順の実行に適用する。
---

# Backend Java Change

juku-ops backend の変更を、既存設計に沿って安全に進める。

## 1. 仕様確認

作業開始時に対象ドキュメントを読む。

- 全体方針: `README.md`
- backend ガイド: `backend/README.md`
- 実装・制約: `AGENTS.md`

仕様が曖昧なら推測せずに質問する。

## 2. 実行計画

実装前に次を明示する。

- 何を変更するか
- 変更ファイル
- 影響範囲
- 検証内容

## 3. 調査手順

実装前に以下を調査する。

1. 変更対象クラス/メソッドの定義
2. 参照元（呼び出し元）と参照先（呼び出し先）
3. 同責務の類似実装（お手本機能）
4. RLS / 認証 / Redis / Vault に与える影響
5. DB スキーマや GraphQL 契約への波及

## 4. 実装ルール

- 既存パターンを優先し、独自構造を増やさない。
- `@Transactional` と `@Rls` の境界を崩さない。
- Java では public/protected メソッドに意図が分かるコメントを付ける。
- 生成物は直接編集しない。
- 変数名・関数名は英語を使う。

## 5. 検証

backend を変更した場合、最低限 `compileJava` を実行する。

```bash
./backend/gradlew compileJava
```

追加で必要な検証がある場合は、影響範囲に応じて実行する。

```bash
./backend/gradlew test
```

## 6. 報告

作業完了時に次を報告する。

1. 実装内容の要約
2. 変更ファイル一覧
3. 調査結果の要点
4. 検証コマンドと結果
5. 残課題と前提
