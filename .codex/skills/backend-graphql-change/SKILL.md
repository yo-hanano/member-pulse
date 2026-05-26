---
name: backend-graphql-change
description: juku-ops backend の GraphQL を変更するときに使う。Quarkus SmallRye GraphQL の Query / Mutation 追加・修正、Service 呼び出し変更、影響範囲調査、検証手順の実行に適用する。
---

# Backend GraphQL Change

juku-ops backend の GraphQL 変更を、既存 Quarkus パターンに沿って安全に進める。

## 1. 仕様確認

作業開始時に対象仕様を確認する。

- 全体方針: `README.md`
- backend ガイド: `backend/README.md`
- 実装・制約: `AGENTS.md`

仕様が曖昧なら推測せずに質問する。

## 2. 実行計画

実装前に次を明示する。

- 変更対象の GraphQL フィールド（Query / Mutation）
- 変更ファイル（GraphQL クラス / Service / Dao など）
- 既存 API への影響
- 検証内容

## 3. 調査手順

実装前に以下を調査する。

1. 近い機能のお手本 GraphQL クラスの実装
2. 変更対象メソッドの呼び出し元/呼び出し先
3. Java メソッドシグネチャと公開スキーマへの影響
4. Bean Validation 制約の反映漏れ
5. frontend 側 codegen/typecheck への波及

## 4. 実装ルール

- GraphQL エンドポイントの実装は既存構造に合わせる。
- Java メソッドシグネチャをスキーマの真実の源として扱う。
- 入力・出力に必要な Bean Validation を付ける。
- N+1 を悪化させないよう Service/Dao 呼び出し粒度を確認する。
- コメントは日本語で書き、処理意図が分かる説明を残す。

## 5. 検証

backend を変更した場合は最低限以下を実行する。

```bash
./backend/gradlew compileJava
```

フロント利用クエリに影響する場合は、必要に応じて codegen/型確認も行う。

```bash
cd frontend
pnpm run codegen
pnpm run typecheck
```

## 6. 報告

作業完了時に次を報告する。

1. 変更した GraphQL フィールドと目的
2. 変更ファイル一覧
3. 調査結果の要点
4. 検証コマンドと結果
5. 残課題と前提
