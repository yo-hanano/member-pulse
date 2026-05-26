# MemberPulse

月謝制スタジオ向けの月次経営レビュー SaaS。

このリポジトリは `juku-ops` を参考骨格として作成した新プロジェクトです。実装の出発点として、認証、BFF、GraphQL backend、Liquibase + jOOQ、React Router の分離構成を残しています。

## Product Spec

- [月謝制スクール向け月次経営レビュー SaaS 仮説](spec/target/monthly-review-saas-plan.md)
- [市場ポジショニングメモ](spec/target/market-positioning.md)

## Architecture

- Frontend: React Router v7
- BFF: Hono
- Backend: Quarkus GraphQL
- DB: PostgreSQL
- Migration / codegen: Liquibase + jOOQ
- Package manager: pnpm
- Formatter / linter: Biome

UI は仕様上 Mantine v9 へ寄せる方針です。コピー元の HeroUI 実装は参考として残っていますが、新規画面では採用しません。

## Local Setup

Dev Container 利用を前提にしています。

```sh
cp -n profiles/template.env profiles/local.env
cp -n mise.local.toml.template mise.local.toml
```

ローカル DB 名は `member_pulse_dev` です。

Dev Container 起動時に、存在しなければ自動作成されます。

## Cleanup Status

`juku-ops` 由来の業務コードはまだ骨格として残っています。今後の実装では、仕様のデータモデル方針に従って `student`、`teacher`、`guardian`、`branch` などの塾文脈を `member`、`lead`、`trial_session`、`location` へ置き換えます。
