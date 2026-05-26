# BFF 開発メモ

認証/セッション管理、JWT 署名、GraphQL 中継、フロント配信など BFF の役割と運用メモをまとめています。

---

## 役割

- 認証/セッション管理の境界（ログイン/ログアウト/パスワードリセット等の API を提供）
- JWT の署名/公開（Vault Transit と `/.well-known/jwks.json`）
- GraphQL リクエストの中継（`/graphql`）
- フロントエンドの静的配信（`STATIC_ROOT` 配下）と SPA フォールバック
- ランタイム設定の配信（`/runtime-config.json`）

---

## 起動方法

### 開発サーバーの起動

```bash
cd bff
pnpm install
pnpm run dev
```

### ビルド/本番起動

```bash
cd bff
pnpm run build
pnpm run start
```

- ローカル開発プロファイルの待受ポートは `3000`（`BFF_PORT` で変更）

---

## 主なエンドポイント

- `POST /auth/login` ほか `/auth/*`
- `POST /graphql`
- `GET /.well-known/jwks.json`
- `GET /api/postal-code/lookup?zipcode=...`
- `GET /runtime-config.json`
- `GET /health`

---

## 静的配信

- `STATIC_ROOT`（未指定時は `./public`）を配信
- API 系パスを除外し、それ以外は `index.html` へフォールバック（SPA ルーティング）

---

## JWTトークン運用方針

- Cookieには `sessionId`（\_\_session）のみ保持し、JWTやユーザー属性は保存しない
- JWTはサーバーへのリクエスト直前に発行し、Authorizationヘッダにセットする
- JWTのペイロードは `jti=sessionId` と `sub=userId` の最小限のみ（ユーザー情報はRedisセッションから解決）
- JWTは短命（例: 1時間）に設定し、署名コスト対策としてサーバ内LRUキャッシュで期限内のみ再利用
- JWTのキャッシュttlはJWTより短め、またはexpSecに合わせて動的に設定
- JWTの再発行は有効期限残り3分未満の場合のみ
- backend側のJWTキャッシュもJWTより短めに設定している

この方針により、セキュリティ・パフォーマンス・拡張性を両立した認証運用を実現しています。

### JWKS 配信 (公開鍵のAPI提供)

JWKS は BFF が `/.well-known/jwks.json` で配信します。

実装概要:

- ルート: BFF `/.well-known/jwks.json`
- 公開鍵ソース: Vault Transit (`transit/keys/<VAULT_TRANSIT_KEY>`) のエクスポート可能な RSA 公開鍵
- キャッシュ: BFFのプロセスメモリ内で最新バージョンのキーのみ保持 (ETag 付与, 5 分キャッシュ制御)
- kid: Vault の `latest_version` を `v<version>` 形式で付与

Quarkus 側 (MicroProfile JWT) からの設定例:

```
mp.jwt.verify.publickey.location=https://your-node.example.com/.well-known/jwks.json
mp.jwt.verify.issuer=cxi-system.com
mp.jwt.verify.audiences=
```

---

## 設定/環境変数

BFF 起動時に Vault の `secret/edge` から設定を読み込み、未設定の環境変数を補完します。

- 必須: `VAULT_TOKEN`, `SESSION_SECRET`
- 任意/取得対象:
  - `VAULT_ADDR`（未指定時: `http://vault:8200`）
  - `BACKEND_GRAPHQL_URL`, `BACKEND_BASE_URL`
  - `DATABASE_URL`
  - `REDIS_URL`, `REDIS_HOST`, `REDIS_PORT`
  - `COOKIE_SECURE`, `SESSION_COOKIE_NAME`, `SESSION_TTL_SECONDS`
  - `CORS_ORIGIN`, `JWT_ISSUER`, `VAULT_TRANSIT_KEY`
  - `PORT`, `APP_ENV`, `APP_VERSION`, `RUNTIME_CONFIG_CACHE_CONTROL`
  - `STATIC_ROOT`

---

## 関連ファイル

- ルーティング/静的配信: `bff/src/app.ts`
- 起動/設定読み込み: `bff/src/index.ts`
- Docker ビルド: `deploy/edge.Dockerfile`（`frontend` を `./public` に配置）
