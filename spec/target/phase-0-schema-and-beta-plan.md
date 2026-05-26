# Phase 0 スキーマ・プロトタイプ・ベータ計画

この文書は、`monthly-review-saas-plan.md` の Phase 0 を実装に落とすための決定事項をまとめる。

## 1. Phase 0 の基本方針

Phase 0 は、実 DB、ログイン、RLS を含む動くプロトタイプとして作る。

主目的は、月次レビューの入力、CRM 補助集計、PL / CPO / LTV 計算、重要成功要因の判定、レポート表示が実運用に近い形で成立するかを検証すること。

`lead` / `member` は最初から入れる。ただし主機能として前面には出さず、月次レビュー入力の任意データソースとして扱う。

CRM 登録がある場合は、月次レビュー入力時に参考集計値を自動算出し、ユーザーが今回の入力値へ反映または上書きできるようにする。

## 2. 最初の DB スキーマ

最初から作る主要テーブルは次の通り。

- `company`
- `employee`
- `business_profile`
- `area`
- `location`
- `goal_plan`
- `goal_plan_month`
- `lead`
- `trial_session`
- `member`
- `membership_plan`
- `membership_subscription`
- `cost_item_template`
- `cost_item`
- `monthly_review`
- `monthly_review_location`
- `monthly_review_cost`
- `ad_spend`
- `monthly_review_snapshot`
- `monthly_review_location_snapshot`

既存 `juku-ops` 由来の旧ドメインは、新ドメイン実装前に削除する。

残すもの:

- 認証
- `company`
- `employee`
- 招待
- パスワードリセット
- RLS
- BFF 認証
- GraphQL 基盤
- 共通エラー、ページング、DAO パターン

削るもの:

- `student`
- `guardian`
- billing contact
- `teacher`
- school / grade
- `branch`
- lesson period
- 旧 schedule event
- contract
- billing
- score
- 旧 frontend routes / graphqls / components
- 旧 domain changelog

## 3. 事業プロフィール

`company` は認証、RLS、組織境界の基盤テーブルとして残す。

プロダクト固有の事業プロフィールは `business_profile` に分ける。

最小項目:

- `company_id unique`
- `business_name`
- `industry_type`
- `setup_status`: `not_started` / `in_progress` / `completed`
- `setup_completed_at`
- `default_location_id nullable`
- `fiscal_year_start_month`
- `note`

表示上は `business_profile.business_name` を優先する。

## 4. 拠点とエリア

`location` は必須にする。

1 拠点ユーザーでも、初期セットアップ時にデフォルト拠点を 1 件作る。

- デフォルト名は `メインスタジオ` またはユーザー入力
- `location.is_default = true`
- `location.area_id` は nullable
- デフォルト拠点は削除不可
- 名称変更は可能

`area` は任意マスタとして残す。

- `location.area_id` は nullable
- 初期セットアップでは area 入力を求めない
- 複数拠点設定時だけ使える
- UI ナビでは強く出さない

## 5. CRM 補助データ

`lead` / `member` / `trial_session` / `membership_subscription` は、月次レビューの自動算出に使う任意データソースとして扱う。

月次レビューの主導線はあくまで月次レビュー入力であり、CRM は「データ管理」または「入力補助」配下に置く。

LP や初期訴求では CRM を前面に出さない。

### 5.1 lead から member への入会変換

入会変換時は、必ず `member` と `membership_subscription` を同時作成する。

- `lead.status = enrolled`
- `member.lead_id = lead.id`
- `membership_subscription.member_id`
- `membership_subscription.start_date`
- `membership_subscription.monthly_fee`
- `membership_subscription.membership_plan_id nullable`

`monthly_fee` は必須にする。

同一 `lead` から二重変換できない制約を置く。

### 5.2 trial_session

`trial_session` は独立テーブルとして持つ。

最小項目:

- `company_id`
- `lead_id`
- `location_id`
- `scheduled_at`
- `completed_at nullable`
- `status`: `scheduled` / `completed` / `no_show` / `canceled`
- `note`

月次集計:

- 体験予約数: 対象月に `scheduled_at` がある件数
- 体験実施数: 対象月に `completed_at` がある、または `status = completed` の件数

予約管理ではなく、ファネル実績の軽量記録として扱う。

### 5.3 member と membership_subscription

月末会員数、平均月謝、月謝売上、LTV は `membership_subscription` の履歴を使って算出する。

最小項目:

- `member.status`: `active` / `paused` / `resigned`
- `member.joined_at`
- `member.resigned_at`
- `membership_subscription.member_id`
- `membership_subscription.membership_plan_id`
- `membership_subscription.start_date`
- `membership_subscription.end_date`
- `membership_subscription.status`: `active` / `paused` / `ended`
- `membership_subscription.monthly_fee`

休会は内訳には出すが、月謝売上と LTV 用在籍からは別扱いにする。

## 6. 月次レビュー入力

対象月は `review_month date` として持ち、常に月初日に正規化する。

- `monthly_review.review_month date not null`
- `goal_plan_month.target_month date not null`
- DB 制約で月初日であることを保証する
- `company_id, review_month` を unique にする

月次レビューの数値は、基本的に `monthly_review_location` に寄せる。

`monthly_review` に持つもの:

- 対象月
- 状態
- 本部経費
- 全社広告費のうち拠点未指定分を扱うための親情報
- 許容広告投資率などレビュー時設定
- 全体メモ
- 生成日時
- 確定日時

`monthly_review_location` に持つもの:

- 月初会員数
- 月末会員数
- 入会数
- 退会数
- 問い合わせ数
- 体験予約数
- 体験実施数
- 総売上
- 月謝売上
- その他売上
- 平均月謝
- 拠点直接広告費
- 変動費合計
- 固定費合計
- CRM 参考集計値
- ユーザー上書き値

入力値はカラム中心で持つ。

スナップショットは JSONB 中心、入力値はカラム中心とする。

## 7. 費用

費用はテンプレート、マスタ、月次採用額を分ける。

### 7.1 cost_item_template

費用テンプレートは DB の `cost_item_template` に持つ。

最小項目:

- `industry_type`: `studio` / `gym` / `language_school` / `common`
- `name`
- `cost_type`: `fixed` / `variable`
- `scope`: `location_direct` / `head_office`
- `calculation_method`: `fixed_amount` / `revenue_rate` / `member_count` / `manual`
- `target_revenue_type nullable`
- `default_amount nullable`
- `default_rate nullable`
- `description`
- `display_order`
- `active`

セットアップ画面では、テンプレート一覧から「使う費用だけ ON」にする。

ON にしたテンプレートを `cost_item` にコピーする。

### 7.2 cost_item

費用マスタは `cost_item` に統一する。

最小項目:

- `name`
- `cost_type`: `fixed` / `variable`
- `scope`: `location_direct` / `head_office`
- `location_id nullable`
- `calculation_method`: `fixed_amount` / `revenue_rate` / `member_count` / `manual`
- `amount`
- `rate`
- `target_revenue_type`: `total_revenue` / `membership_revenue`
- `active`

### 7.3 monthly_review_cost

月次レビュー時に採用した費用は `monthly_review_cost` に保存する。

最小項目:

- `monthly_review_id`
- `monthly_review_location_id nullable`
- `cost_item_id nullable`
- `name`
- `cost_type`
- `scope`
- `calculation_method`
- `expected_amount`
- `actual_amount`
- `is_overridden`

費用の正は `monthly_review_cost` とする。

ただし表示効率のため、次の合計カラムも持つ。

- `monthly_review_location.variable_cost_amount`
- `monthly_review_location.fixed_cost_amount`
- `monthly_review.head_office_cost_amount`

合計カラムは保存時または生成時に再計算して更新する。

ユーザーが合計だけ直接入力した場合は、`cost_item_id = null`, `name = '実績入力'` の明細を作る。

## 8. 広告費

広告費は費用マスタに混ぜず、`ad_spend` として別管理する。

最小項目:

- `company_id`
- `monthly_review_id`
- `location_id nullable`
- `name`
- `amount`
- `source_type`: `manual` / `imported` / `crm`
- `note`

扱い:

- `location_id` あり: 拠点直接広告費
- `location_id` なし: 本部広告費として売上比率で配賦
- 全体 PL: すべて合算
- 拠点 PL: 直接広告費 + 配賦広告費
- CPO: 対象範囲の広告費 ÷ 入会数

広告媒体別分析は MVP では作らない。

## 9. 目標設定

目標は `goal_plan` / `goal_plan_month` として月次レビューから分ける。

### 9.1 goal_plan

最小項目:

- `company_id`
- `fiscal_year`
- `annual_revenue_goal`
- `annual_operating_profit_goal`
- `year_end_member_count_goal`
- `current_member_count`
- `average_monthly_fee`
- `acceptable_churn_rate`
- `trial_booking_rate`
- `trial_attendance_rate`
- `enrollment_rate`
- `annual_ad_spend_limit`
- `acceptable_ad_investment_rate`
- `active`

### 9.2 goal_plan_month

最小項目:

- `goal_plan_id`
- `target_month`
- `location_id nullable`
- `revenue_goal`
- `operating_profit_goal`
- `ending_member_count_goal`
- `new_member_count_goal`
- `resigned_member_count_limit`
- `inquiry_count_goal`
- `trial_booking_count_goal`
- `trial_completed_count_goal`
- `ad_spend_limit`
- `average_monthly_fee_goal`
- `is_overridden`

`location_id = null` は全体目標を表す。

拠点別目標がない場合は、売上比、現会員数比などで按分目標を作る。

拠点別目標の合計が全体目標とズレる場合は警告のみ出す。

レビュー生成時には、該当月の目標値をスナップショットへコピーして固定する。

## 10. スナップショット

月次レビューは生成時点の結果をスナップショット保存する。

CRM やマスタ、目標、入力値が後で変わっても、確定済みレビューは勝手に変わらない。

再生成ごとにスナップショット履歴を残す。

`monthly_review_snapshot` の方針:

- `monthly_review_id`
- `version`
- `is_current`
- `generated_at`
- `superseded_at nullable`
- `generated_by_employee_id nullable`
- 主要 KPI カラム
- `summary_json`
- `kpi_json`
- `pl_json`
- `ltv_json`
- `key_success_factors_json`
- `settings_json`
- `goal_json`

主要 KPI カラム:

- `total_revenue`
- `operating_profit`
- `ending_member_count`
- `new_member_count`
- `resigned_member_count`
- `ad_spend_amount`
- `cpo`
- `marginal_cpo`

`monthly_review_location_snapshot` も同様に、主要値だけカラム、詳細は JSONB で持つ。

再生成時:

- 旧 current の `is_current = false`
- 旧 current の `superseded_at` を設定
- 新 snapshot を `version + 1`, `is_current = true` で作成

## 11. 月次レビュー状態遷移

状態は次の 4 つとする。

- `not_started`
- `in_progress`
- `generated`
- `confirmed`

許可する遷移:

- `not_started -> in_progress`
- `in_progress -> generated`
- `generated -> in_progress`
- `generated -> confirmed`
- `confirmed -> in_progress` ただし確定解除操作のみ

禁止すること:

- `in_progress -> confirmed`
- `confirmed` 状態での入力値編集
- `confirmed` 状態での再生成

状態遷移は UI だけでなく backend service で守る。

専用 mutation:

- `startMonthlyReview`
- `saveMonthlyReviewInput`
- `generateMonthlyReview`
- `confirmMonthlyReview`
- `reopenMonthlyReview`

## 12. 論理削除

業務テーブルは論理削除にする。

対象:

- `area`
- `location`
- `membership_plan`
- `cost_item`
- `lead`
- `trial_session`
- `member`
- `membership_subscription`
- `monthly_review`
- `monthly_review_location`
- `monthly_review_cost`
- `ad_spend`

snapshot は原則削除しない。

unique 制約は `deleted_at is null` の partial unique を使う。

## 13. enum 方針

DB は PostgreSQL enum ではなく、text + check 制約にする。

理由は、ベータ中に状態や分類名が変わりやすいため。

backend は Java enum、GraphQL は enum として扱う。

## 14. 初期セットアップ

ログイン後、セットアップ未完了なら初期セットアップウィザードへ強制遷移する。

初期セットアップで入力するもの:

- 事業名
- デフォルト拠点名
- 現在会員数
- 平均月謝
- 年間売上目標
- 年間営業利益目標
- 年度末会員数目標
- 許容退会率
- 想定体験予約率
- 想定体験実施率
- 想定入会率
- 年間広告費上限
- 許容広告投資率
- 使う費用テンプレート選択

初期値:

- 許容退会率: 3%
- 体験予約率: 70%
- 体験実施率: 80%
- 入会率: 50%
- 年間目標は月商 × 12 から自動提案
- 年間営業利益目標は売上 × 目標利益率から自動提案

セットアップで作るもの:

- `business_profile`
- デフォルト `location`
- `goal_plan`
- `goal_plan_month`
- 選択された `cost_item`

## 15. プロトタイプ画面

ベータ募集前に、動くプロトタイプを作る。

画面なしヒアリングではなく、実際に触れる画面を見せてフィードバックを得る。

最初のプロトタイプ範囲:

- ログイン
- 招待
- 初期セットアップ
- location
- lead
- trial_session
- member
- membership_subscription
- cost_item template 選択
- monthly_review 入力
- CRM 参考値の自動算出
- PL / CPO / LTV 計算
- 重要成功要因 最大 3 つ
- レポート表示

作らないもの:

- 決済
- 請求
- PDF 生成
- 印刷用レイアウト
- CSV インポート
- 共有 URL
- 通知
- 予約枠管理
- 出席履歴

## 16. 月次レビュー入力 UI

月次レビュー入力は 8 ステップのウィザードにする。

1. 対象月とスタジオ選択
2. 会員数
3. 集客
4. 売上
5. 広告費
6. 費用
7. 確認
8. レポート生成

必要な UX:

- ステップ間の自動保存
- CRM 参考値がある場合の「反映」ボタン
- 不整合はブロックせず警告
- 未確定値フラグ
- スキップ可能な項目の明示
- 最終確認で主要 KPI を先に見せる

## 17. レポート UI

レポートは画面表示を先行する。

印刷 / PDF は後回しにする。

初期レポートは、要約中心、根拠展開可能な構成にする。

構成:

- 今月の重要成功要因 最大 3 つ
- 来月の推奨アクション
- 売上 / 営業利益 / 会員数 / CPO の目標差分カード
- ファネル: 問い合わせ → 体験予約 → 体験実施 → 入会
- 会員: 月初、入会、退会、月末
- PL: 売上、粗利、営業利益
- 広告: CPA、CPO、限界 CPO
- 問題のある拠点カード最大 3 つ
- 拠点別 PL 比較テーブル

各カードには「根拠を見る」を置き、計算式と入力値を展開できるようにする。

## 18. 実装順

1. 旧ドメイン削除
2. Liquibase で新ドメインスキーマ作成
3. jOOQ 生成
4. backend GraphQL CRUD
5. 月次レビュー計算サービス
6. frontend Mantine 導入と旧 HeroUI 置換の土台
7. 初期セットアップ画面
8. `lead` / `member` / `trial_session` CRUD
9. 月次レビュー入力ウィザード
10. レポート表示
11. ベータ用デモデータ

## 19. ベータ顧客獲得

ベータは無料で始める。ただし条件付きにする。

条件:

- 期間: 2 か月
- 対象: 3〜5 社
- 月 1 回、30〜45 分のフィードバック面談
- 実数字または実態に近い概算を入力
- 画面録画または同席入力を許可
- 継続意向と価格感を最後に回答

見返り:

- ベータ期間無料
- 正式版移行時に初期価格を一定期間据え置き
- 月次レビュー資料を返す

## 20. ベータ候補の集め方

最初は LP / 広告ではなく、知人紹介と直接 DM で取る。

優先候補:

- 直接知っているスタジオ / ジム / スクール運営者
- 知人が通っているヨガ / ピラティス / ジム
- 友人、元同僚に紹介してもらえそうな店舗経営者
- SNS で接点がある運営者
- 既存仕事と競合しない周辺領域の知人
- 地元や生活圏で会話できそうな小規模店舗

最初の目標:

- 15 件接触
- 5 件ヒアリング
- 3 件ベータ参加

候補は次の観点でスコア化する。

- 関係性
- ターゲット一致度
- 数字の痛み
- データ提供可能性
- ベータ協力度

最初の 1 件は、多少ターゲットからズレても、関係性が強く深く話せる相手を優先する。

## 21. 最初の訴求

最初の訴求は「SaaS を試してください」ではなく、「月次数字の見直しを一緒にやらせてください」にする。

DM の核:

```text
月謝制スタジオ向けに、会員数・退会・入会・広告費・利益を月1回で振り返る小さなツールを作っています。
まだ開発中なので、実際のスタジオ運営で月次数字をどう見ているか、30分だけ教えてもらえませんか。
可能なら、こちらで簡単な月次レビューのたたき台も作ってお返しします。
```

売り込みではなく、協力依頼と返礼としての月次レビューたたき台を前面に出す。

## 22. ヒアリング方針

初回は運用フロー中心に聞き、可能なら概算数字まで聞く。

実データは 2 回目以降、またはベータ参加時に依頼する。

初回ヒアリングで聞くこと:

- 月末 / 月初に何を確認しているか
- 会員数、入会、退会はどこで見ているか
- 問い合わせ、体験、入会は追えているか
- 売上、月謝売上、その他売上は分けているか
- 広告費は月別に見ているか
- 固定費 / 変動費はどこまで把握しているか
- 先月が良かった / 悪かった理由をどう判断しているか
- 数字を見る作業に何分かかるか
- 今いちばん見直したい数字は何か

概算で聞いてよい数字:

- 会員数レンジ
- 月商レンジ
- 月の入会 / 退会のだいたいの数
- 広告費を使っているか
- 店舗数

## 23. ベータ運用

ベータ期間中は毎月 1 回同席する。

目的はサポートではなく学習。

運用:

- 初回: 45〜60 分、セットアップ同席
- 1 回目月次入力: 30〜45 分、同席
- 2 回目: できればセルフ入力後に 30 分レビュー
- 終了時: 30 分、継続意向、価格感、不要機能確認

## 24. ベータ成功条件

成功条件:

- 3 社中 2 社が 2 か月連続で月次入力を完了
- 3 社中 2 社がレビュー結果を見て、来月の打ち手を 1 つ以上決める
- 3 社中 1 社以上が月額 4,980 円で継続意向
- 入力同席なしでも、2 回目の入力を完了できる会社が 1 社以上
- CRM 補助ではなく月次レビューに価値を感じた発言が出る
- 未計測だった問い合わせ / 体験などを、翌月から測ろうとする会社が 1 社以上

失敗条件:

- 入力が重すぎて 2 社以上が 2 回目をやらない
- レポートが既知のことしか言わないと言われる
- 会計 / 予約 / 請求の置き換え要求ばかりになる
- 月額 4,980 円でも払う理由が弱い
