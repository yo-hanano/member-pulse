# Phase 0 スキーマ・プロトタイプ・ベータ計画

この文書は、`monthly-review-saas-plan.md` の Phase 0 を実装に落とすための決定事項をまとめる。

## 1. Phase 0 の基本方針

Phase 0 は、実 DB、ログイン、RLS を含む動くプロトタイプとして作る。

主目的は、収支計画、CRM 実績、月次レビューの予実管理が実運用に近い形で成立するかを検証すること。

プロダクト方針は、`markeman` で計画を作り、`alcos-portal` 的な CRM で実績を拾い、MemberPulse で月次レビューする、という整理にする。

- `markeman` 由来: 収支計画、成り行き、GAP 調整、KPI レバー、CPO / LTV / 販管費
- `alcos-portal` 由来: 会員 CRM、問い合わせ、コース契約、月謝売上、入会 / 休会 / 退会
- MemberPulse 固有: 収支計画と CRM 実績の予実管理、重要成功要因、来月アクション、月次レビュー

Phase 0 では責務を次の 3 つに分ける。

- 収支計画: `markeman` の Plan / PlanSim に近い。仮説として既存会員、料金プラン、新規入会、広告費、費用を置き、成り行きと改善案を比較する。
- CRM 実績: `lead` / `trial_session` / `member` / `membership_subscription` を実績データの正として扱う。誰がどのプランで入会、継続、退会したかを保持する。
- 月次レビュー: 収支計画と CRM 実績または手入力実績を突き合わせ、差分、PL / CPO / LTV、重要成功要因、レポートを生成する。

`lead` / `member` は最初から入れる。ただし収支計画の代替ではなく、月次レビューと予実管理の実績ソースとして扱う。

CRM 登録がある場合は、月次レビュー入力時に参考集計値を自動算出し、ユーザーが今回の入力値へ反映または上書きできるようにする。CRM 登録がない場合でも、収支計画は手入力の仮説で作れるようにする。

## 2. 最初の DB スキーマ

最初から作る主要テーブルは次の通り。

- `company`
- `employee`
- `business_profile`
- `area`
- `location`
- `goal_plan`
- `goal_plan_member_group`
- `goal_plan_month`
- `goal_plan_month_member_group`
- `lead`
- `trial_session`
- `member`
- `membership_plan`
- `membership_subscription`
- `additional_revenue_item`
- `goal_plan_additional_revenue`
- `monthly_review_additional_revenue`
- `cost_item_template`
- `cost_item`
- `monthly_review`
- `monthly_review_location`
- `monthly_review_cost`
- `ad_spend`
- `monthly_review_snapshot`
- `monthly_review_location_snapshot`

### 2.1 売上系テーブルの位置づけ

`membership_plan` は、Phase 0 では月額固定と回数購入を含む料金プランとして扱う。月額固定、通い放題、回数券、チケット制、1回券は、種別と契約条件の組み合わせで表現する。DB 確定前に、より広い名前として `pricing_plan` へ改名するかを最終判断する。

`additional_revenue_item` は、入会金、体験料、物販、イベント、季節講習的な一時売上など、会員契約とは別に発生する売上項目のマスタとする。

`goal_plan_additional_revenue` は、収支計画上の月別追加売上見込みを持つ。

`monthly_review_additional_revenue` は、月次レビュー時の追加売上実績明細を持つ。MVP では `monthly_review_location.other_revenue` の合計入力だけでも保存できるようにし、明細入力がある場合にこのテーブルへ分解する。

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

会社発行は admin 機能の責務にする。

admin の会社発行で行うこと:

- `company` 作成
- company code / 会社 ID の発行
- `business_profile` の初期作成
- 初期管理者 `employee` の作成
- 初期管理者への招待または初期ログイン手段の発行
- 業種に応じた販管費テンプレート候補の用意

ユーザー初回導線では会社 ID を発行しない。ユーザーは発行済みの会社にログインし、必要に応じて自社情報、料金プラン、追加売上項目、販管費項目を確認・調整する。

`company` は認証、RLS、組織境界の基盤テーブルとして残す。会社 ID / company code は admin の会社発行時に決まり、ユーザー側では変更不可にする。

プロダクト固有の事業プロフィールは `business_profile` に分ける。`business_profile` は admin の会社発行時に初期作成し、ユーザーは自社情報画面で会社 ID 以外を編集できるようにする。

最小項目:

- `company_id unique`
- `business_name`
- `industry_type`
- `setup_status`: `not_started` / `in_progress` / `completed`
- `setup_completed_at`
- `default_location_id nullable`
- `fiscal_year_start_month`
- `zip_code nullable`
- `prefecture_code nullable`
- `address nullable`
- `phone_number nullable`
- `note`

表示上は `business_profile.business_name` を優先する。

自社情報画面で編集できるもの:

- 事業者名 / 表示名
- 業種
- 決算月
- 郵便番号
- 都道府県
- 住所
- 電話番号
- メモ

会社 ID / company code は編集不可。

## 4. 拠点とエリア

`location` は任意にする。

初期セットアップでは拠点登録を必須にしない。まずは全社単位のマスタ整備と収支計画から始められるようにする。

拠点を登録するタイミング:

- 収支計画で拠点別目標を作るとき
- CRM 実績を拠点に紐づけたいとき
- 拠点別 PL を見たいとき
- 広告費や共通費を拠点へ按分したいとき

拠点未登録の場合:

- `location_id` は nullable のまま扱う
- 収支計画は全社計画として作る
- CRM 実績は全社実績として扱う
- 月次レビューは全体レビューとして作る
- 拠点別 PL は表示しない

`area` は任意マスタとして残す。

- `location.area_id` は nullable
- 初期セットアップでは area 入力を求めない
- 複数拠点設定時だけ使える
- UI ナビでは強く出さない

## 5. CRM 実績データ

`lead` / `member` / `trial_session` / `membership_subscription` は、月次レビューの自動算出と予実管理に使う実績データソースとして扱う。

収支計画は仮説入力で作れるようにし、CRM はその予実管理を支える。計画作成時に CRM データが存在する場合は、既存会員数、料金プラン別単価、退会率などの初期値を CRM から補完できるようにする。

月次レビューの主導線はあくまで月次レビュー入力とレポートであり、CRM は「データ管理」または「実績補助」配下に置く。

LP や初期訴求では CRM を前面に出さない。

### 5.1 リード管理と体験セッションの位置づけ

リード管理は、問い合わせから入会までの業務フローをまとめて扱う。`trial_session` は独立メニューではなく、`lead` の関連情報として扱う。

基本フロー:

1. `lead` を作成する
2. `lead.status` を更新する
3. `trial_session` を追加して体験予約を記録する
4. `trial_session` に実施結果を入力する
5. 入会処理で `member` と `membership_subscription` を作成する

リード詳細画面は次の関連情報を持つ。

- 基本情報: 氏名、連絡先、問い合わせ日、問い合わせ経路、希望拠点、メモ
- 対応履歴: 架電、メール、LINE、面談メモなどの軽量記録
- 体験セッション: 予約日時、実施日時、ステータス、結果メモ
- 入会処理: 入会日、会員情報、契約する料金プラン、契約開始日

`lead.status` は画面操作上の状態として保持し、`trial_session` の有無や結果から完全自動導出しない。実務では再体験、体験後保留、体験予約済みだが連絡待ちなどが発生するため、状態は手動更新できるようにする。

初期ステータス:

- `new`: 新規問い合わせ
- `contacted`: 連絡済み
- `trial_scheduled`: 体験予約
- `trial_completed`: 体験実施
- `enrolled`: 入会
- `lost`: 失注

月次レビューで使うファネル指標は、リード管理から次のように取得する。

- 問い合わせ数: `lead.inquiry_at` または `lead.created_at` が対象月の件数
- 体験予約数: 対象月に `trial_session.scheduled_at` がある件数
- 体験実施数: 対象月に `trial_session.completed_at` がある、または `status = completed` の件数
- 入会数: `lead.enrolled_at`、または `membership_subscription.start_date` が対象月の件数

### 5.2 lead から member への入会変換

入会変換時は、必ず `member` と `membership_subscription` を同時作成する。

- `lead.status = enrolled`
- `member.lead_id = lead.id`
- `membership_subscription.member_id`
- `membership_subscription.start_date`
- `membership_subscription.monthly_fee`
- `membership_subscription.membership_plan_id nullable`

`monthly_fee` は必須にする。

同一 `lead` から二重変換できない制約を置く。

### 5.3 trial_session

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

### 5.4 member と membership_subscription

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

### 5.5 料金プラン管理

`membership_plan` は、入会処理で選択する料金プランとして扱う。実装上は会員プランという名前を維持するが、仕様上は月額固定と回数購入を表現できる料金プランである。

料金体系は次の 2 種類を基本にする。

- `subscription`: 月額固定。月4回、月8回、通い放題、デイタイムなど
- `ticket`: 回数購入。5回券、10回券、40レッスン、1回券など

都度払いは独立種別にせず、初期は `ticket` の 1回券、または追加売上項目として扱う。

コース契約は独立種別にしない。3ヶ月コースや短期集中は、`subscription` または `ticket` に契約期間、有効期限、付与回数を持たせて表現する。

最小項目:

- `company_id`
- `name`
- `pricing_model`: `subscription` / `ticket`
- `price`
- `contract_months nullable`
- `included_sessions nullable`
- `usage_limit_type`: `limited` / `unlimited`
- `validity_days nullable`
- `auto_renew`
- `affects_member_count`
- `display_order`
- `active`

表現例:

| 例 | pricing_model | contract_months | included_sessions | usage_limit_type | validity_days | auto_renew |
| --- | --- | ---: | ---: | --- | ---: | --- |
| 月4回 | subscription | 1 | 4 | limited | null | true |
| 月8回 | subscription | 1 | 8 | limited | null | true |
| 通い放題 | subscription | 1 | null | unlimited | null | true |
| 10回券 | ticket | null | 10 | limited | 90 | false |
| 3ヶ月コース | subscription または ticket | 3 | 任意 | limited | null または 90 | false |
| 都度払い | ticket | null | 1 | limited | null | false |

`membership_subscription` は、入会時点の契約内容を履歴として保持する。将来プラン価格が変わっても過去月の月謝売上や LTV が壊れないよう、契約時の `price`、`pricing_model`、`included_sessions` など必要なスナップショット値を持たせる。

### 5.6 追加売上項目管理

`additional_revenue_item` は、会員契約とは別に発生する売上項目を扱う。リードや会員に紐づく場合もあるが、月次レビュー上は売上明細として集計できればよい。

対象例:

- 入会金
- 体験料
- ワークショップ
- イベント
- 物販
- 季節キャンペーン
- 特別レッスン
- その他

最小項目:

- `company_id`
- `name`
- `revenue_category`: `enrollment_fee` / `trial_fee` / `event` / `workshop` / `merchandise` / `campaign` / `other`
- `default_unit_price nullable`
- `affects_member_count` default false
- `display_order`
- `active`

収支計画では、`goal_plan_additional_revenue` に対象月、拠点、売上項目、単価、数量、金額、メモを持つ。

月次レビューでは、`monthly_review_additional_revenue` に対象月、拠点、売上項目、単価、数量、金額、メモを持つ。明細入力を使わない場合は `monthly_review_location.other_revenue` の合計だけでよい。

追加売上は、会員数 KPI に直接効くものとして扱わない。入会金のように入会数と連動する項目でも、会員数は `lead` から `member` への入会変換で数え、売上は追加売上として別集計する。

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

`cost_item_template` は admin 機能で管理する共通マスタとする。admin は業種別にテンプレートを追加、編集、無効化できる。会社発行時またはユーザー初回導線では、業種に合うテンプレートを初期候補として提示する。

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
- `created_by_admin_id nullable`
- `updated_by_admin_id nullable`

セットアップ画面では、テンプレート一覧から「使う費用だけ ON」にする。

ON にしたテンプレートを `cost_item` にコピーする。

### 7.2 cost_item

費用マスタは `cost_item` に統一する。

最小項目:

- `name`
- `cost_type`: `fixed` / `variable`
- `scope_type`: `company` / `area` / `prefecture` / `location` / `head_office`
- `scope_id nullable`
- `location_id nullable`
- `allocation_method`: `none` / `equal_by_location` / `by_revenue` / `by_member_count` / `manual`
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
- `scope_type`
- `scope_id nullable`
- `allocation_method`
- `calculation_method`
- `expected_amount`
- `actual_amount`
- `allocated_amount`
- `is_overridden`

費用の正は `monthly_review_cost` とする。

ただし表示効率のため、次の合計カラムも持つ。

- `monthly_review_location.variable_cost_amount`
- `monthly_review_location.fixed_cost_amount`
- `monthly_review.head_office_cost_amount`

合計カラムは保存時または生成時に再計算して更新する。

ユーザーが合計だけ直接入力した場合は、`cost_item_id = null`, `name = '実績入力'` の明細を作る。

拠点別 PL は撤退、移転、追加投資の判断に使う重要要件とする。そのため費用は、拠点直接費だけでなく、本部共通、エリア共通、都道府県単位の費用も表現できるようにする。月次レビュー生成時には、共通費を拠点別に按分した結果を `monthly_review_cost.allocated_amount` と `monthly_review_location` の合計カラムへ固定する。

MVP の費用按分は次を優先する。

- `location`: 指定拠点へ全額
- `company` / `head_office`: 全社共通費として保持し、必要なら均等または売上比で按分
- `area` / `prefecture`: 対象エリアまたは都道府県に属する拠点へ均等按分
- `manual`: ユーザーが拠点別金額を直接補正

## 8. 広告費

広告費は費用マスタに混ぜず、`ad_spend` として別管理する。

最小項目:

- `company_id`
- `monthly_review_id`
- `scope_type`: `company` / `area` / `prefecture` / `location` / `membership_plan`
- `scope_id nullable`
- `location_id nullable`
- `prefecture_code nullable`
- `membership_plan_id nullable`
- `allocation_method`: `none` / `equal_by_location` / `by_revenue` / `by_inquiry_count` / `by_new_member_count` / `manual`
- `name`
- `amount`
- `allocated_amount nullable`
- `source_type`: `manual` / `imported` / `crm`
- `note`

扱い:

- `location`: 指定拠点の直接広告費
- `company`: 全社広告費。全体 PL では全額合算し、拠点別 PL では按分対象にする
- `prefecture`: 都道府県広告費。該当都道府県の拠点へ按分する
- `area`: 商圏または管理エリア広告費。該当エリアの拠点へ按分する
- `membership_plan`: 特定会員種別やコース訴求の広告費。MVP では全体広告費として扱い、将来会員種別別 CPO に使う
- CPO: 対象範囲の広告費 ÷ 入会数

MVP の広告費按分は次を優先する。

- 拠点指定ならその拠点へ全額
- 都道府県指定なら、その都道府県に属する拠点へ均等按分
- エリア指定なら、そのエリアに属する拠点へ均等按分
- 全社指定なら、全体 PL では全額、拠点別 PL では均等按分または手動按分
- 問い合わせ数按分、入会数按分、売上按分は Phase 0 後半または beta で追加検討

広告媒体別分析は MVP では作らない。

## 9. 収支計画

収支計画は `markeman` の Plan / PlanSim に近い位置づけにする。

目的は、実績入力前でも仮説として次を置き、成り行きと改善案を比較できるようにすること。

- 目標売上、目標営業利益
- 既存会員グループ
- 料金プランまたは会員グループ
- 新規入会計画
- 広告費
- 変動費、固定費、本部経費
- 退会率、平均継続月数、LTV、限界 CPO

収支計画は月次レビューから分け、`goal_plan` 系テーブルに保存する。月次レビュー生成時には、該当月の計画値をスナップショットへコピーして固定する。

### 9.1 goal_plan

`goal_plan` は収支計画の親。

最小項目:

- `company_id`
- `fiscal_year`
- `annual_revenue_goal`
- `annual_operating_profit_goal`
- `year_end_member_count_goal`
- `trial_booking_rate`
- `trial_attendance_rate`
- `enrollment_rate`
- `annual_ad_spend_limit`
- `acceptable_ad_investment_rate`
- `active`

`current_member_count` と `average_monthly_fee` は全体の簡易表示値として持ってもよいが、収支計画の主計算は `goal_plan_member_group` の積み上げを優先する。

### 9.2 goal_plan_member_group

`goal_plan_member_group` は、計画時点の既存会員を一緒くたにせず、単価や退会特性ごとに分けるための仮説グループ。

CRM がある場合は `membership_plan` や `membership_subscription` から初期値を作る。CRM がない場合は手入力で作る。

最小項目:

- `goal_plan_id`
- `location_id nullable`
- `membership_plan_id nullable`
- `name`
- `source_type`: `manual` / `crm`
- `current_member_count`
- `average_monthly_fee`
- `monthly_churn_rate`
- `member_variable_cost_amount nullable`
- `revenue_variable_cost_rate nullable`
- `expected_end_month nullable`
- `display_order`

例:

- 通常会員
- 上級会員
- 短期集中会員
- 受験生
- 法人会員

`membership_plan` は料金プラン、`goal_plan_member_group` は計画上の分析単位とする。同じ料金プランでも退会タイミングが違う場合は別グループにできるようにする。

`goal_plan_member_group` は、会員数 KPI に効く料金プランを中心に扱う。回数購入でも継続的な会員として追う場合はここに含める。単発イベントや物販のように会員数 KPI に効かない売上は、`goal_plan_additional_revenue` で扱う。

### 9.3 goal_plan_month

`goal_plan_month` は月別計画の全体または拠点別の集計値。

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

### 9.4 goal_plan_month_member_group

`goal_plan_month_member_group` は、会員グループ別の月別計画値。

最小項目:

- `goal_plan_month_id`
- `goal_plan_member_group_id`
- `beginning_member_count`
- `new_member_count_goal`
- `resigned_member_count_limit`
- `ending_member_count_goal`
- `membership_revenue_goal`
- `average_monthly_fee_goal`
- `ad_spend_limit nullable`
- `is_overridden`

全体の `goal_plan_month` は、この明細の積み上げから再計算できるようにする。MVP では全体だけの簡易計画も許容するが、画面設計は会員グループ別へ拡張できる形にする。

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
- `additional_revenue_item`
- `goal_plan_additional_revenue`
- `monthly_review_additional_revenue`
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

ログイン後、セットアップ未完了なら初期セットアップへ誘導する。

初期セットアップは、収支計画そのものではなく、収支計画と CRM で使うマスタの確認・調整に寄せる。ここでは成り行き、GAP 調整、月別計画は作らない。

会社発行時点で admin が作るもの:

- `company`
- company code / 会社 ID
- `business_profile`
- 初期管理者 `employee`
- 初期管理者への招待または初期ログイン手段
- 業種に応じた販管費テンプレート候補

ユーザー初回導線で確認・調整するもの:

- 料金プラン
- 追加売上項目
- 利用する販管費項目
- CRM 実績を使うか、まず手入力で始めるか

セットアップで作るもの:

- `membership_plan`
- `additional_revenue_item`
- 選択された `cost_item_template` から作る `cost_item`

料金プランで扱う最小項目:

- 名称
- 料金体系: 月額固定 / 回数購入
- 金額
- 契約期間 nullable
- 付与回数 nullable
- 利用上限: 回数制限あり / 通い放題
- 有効期限 nullable
- 自動更新有無
- 会員数 KPI に反映するか
- 表示順
- active

追加売上項目で扱う最小項目:

- 名称
- 売上カテゴリ
- 標準単価 nullable
- 表示順
- active

販管費項目で扱う最小項目:

- 名称
- 固定費 / 変動費
- 店舗別 / 本部共通 / 全社共通などのスコープ
- 金額または率は任意。未入力の場合は収支計画で入力する
- active

セットアップ完了後は、最初の収支計画作成へ誘導する。収支計画画面では、ここで登録した料金プラン、追加売上項目、販管費項目を選択肢として使う。

事業者名、業種、決算月、住所などは初期セットアップではなく、自社情報画面で確認・変更できるようにする。UI では年度開始月ではなく決算月を表示し、内部保存は `business_profile.fiscal_year_start_month` とする。

## 15. 収支計画立案 UI

収支計画立案は、初期セットアップとは分けて、「現状の数字を確認し、今年どうやって売上と営業利益を作るか」を組む画面として扱う。

基本方針:

- 最初に計画グループで、計画期間と目標を決める
- 次に現状数値を入力する。実績があれば実績から取得し、なければ手入力する
- その現状数値をもとに、リード数、入会数、費用、営業利益を組み立てる
- UI は `markeman` のオファー設定に近い表形式にする。ただし業務用語は月謝制スタジオ向けに置き換える
- 表は Excel / Google Sheets からの貼り付けを重視する
- グリッドは AG Grid Community を第一候補にする。Enterprise の clipboard 機能には依存せず、TSV paste を自前実装する
- Mantine はページレイアウト、カード、ボタン、ライブ試算に使い、数値入力グリッドだけを AG Grid に切り出す

`financial-plans/setting` は、markeman の `product/:productId/plan/:planId/setting` を画面原型として採用する。採用するのは、番号付きの大分類、点線のセクション区切り、チェック付きの設定カード、編集アイコン、カード内に要約値を並べる情報密度である。左タブ型にはせず、1 画面上で「売上関連」「経費関連」「着地」を上から順に確認できる構成にする。商品・広告運用・EC 文脈はそのまま持ち込まず、月謝制スタジオ向けの会員、入会、問い合わせ、費用、広告費へ置き換える。

用語対応:

- product: 料金プランまたは会員グループ
- plan setting: 計画シナリオ設定
- 販売件数: 入会数
- CVR: F2 体験予約率 / F3 体験実施率 / F4 入会率
- 広告費: 広告費。PL と CPO 判断の両方に使う
- 売上: 月謝売上を中心に、必要に応じてその他売上を足す
- 原価 / 変動費: 会員連動変動費または売上率変動費
- 販管費: 固定費、本部経費
- シミュレーション結果: 着地

持ち込まないもの:

- EC の商品、SKU、購入、定期購入、媒体別広告運用の文脈
- 商品単位の CVR や広告媒体別 ROAS を主役にする画面
- markeman 固有の計算式名や社内用語
- 月謝制スタジオの月次レビューに直結しない分析軸

`financial-plans/setting` の確定構成:

- 計画グループ: 期間、売上目標、営業利益目標、期末会員目標を設定する。markeman の目標数値カード相当はここへ統合する
- 1. 売上関連: 料金プランと入会計画、追加売上をカードで表示する。目標数値は計画グループに持たせるため、このセクションには出さない
- 2. 経費関連: 販管費と広告費をカードで表示する
- 3. 着地: 月別の売上、営業利益、会員数、入会数、問い合わせ数を確認する
- 各カード: チェック状態、編集アイコン、主要な要約値を持つ。setting 画面内には結果カードだけを表示し、追加・更新フォームは Drawer で開く
- ライブ試算: 右固定ではなく、目標数値カードと着地カード内で要約値として見せる

入力ステップ:

1. 計画グループ
   - グループ名
   - 計画開始月
   - 計画終了月
   - 売上目標
   - 営業利益目標
   - 期末会員数目標

2. 現状数値
   - 料金プラン別に、現時点の売上・会員・ファネル前提を Drawer で入力する
   - 入会件数などの計画値はここには置かず、次のセクションに分ける
   - setting 画面には入力フォームを直接並べず、料金プランごとの設定結果カードを表示する
   - 料金プラン別の項目:
     - 料金プラン名
     - 料金体系: 月額固定 / 回数購入
     - 金額
     - 期初人数または販売数
     - 月額固定: 月次解約率、自動更新有無
     - 回数購入: 付与回数、有効期限
     - 通い放題: 利用上限なしとして表示
     - 体験予約率
     - 体験実施率
     - 入会率
   - Drawer ではカード表示と同じく `在籍・単価前提` と `獲得ファネル` に分ける
   - 3ヶ月コースや短期集中は独立した種別にせず、月額固定または回数購入に契約期間、有効期限、付与回数を持たせて表現する

3. リード・入会計画
   - `markeman` の販売件数に相当するものとして、MemberPulse ではリード数を起点にする
   - 表示名は利用者に伝わりやすいように `問い合わせ数/月` を優先する
   - 内部モデル名は `lead_count` 系を優先する
   - 料金プラン別の項目:
     - 問い合わせ数/月
     - 体験予約数/月 = 問い合わせ数/月 × 体験予約率
     - 体験実施数/月 = 体験予約数/月 × 体験実施率
     - 入会数/月 = 体験実施数/月 × 入会率
     - 月謝売上/月
   - 入会数を直接入力する逆算モードも将来追加できるようにするが、初期 UI はリード数起点を優先する

4. 費用計画
   - 登録済み `cost_item` をもとに、計画期間の費用前提を入力する
   - 最小項目:
     - 月額固定費
     - 月額本部経費
     - 変動費率
     - 月額広告費
   - 広告費は PL に反映しつつ、CPO 判断にも使う

5. 営業利益の着地
   - 月次で売上、営業利益、会員数、入会数、問い合わせ数を表示する
   - 右側にライブ試算を常時表示する
   - ライブ試算の最小項目:
     - 計画期間売上
     - 売上目標比
     - 営業利益
     - 利益目標比
     - 期末会員数
     - 会員目標比
     - CPO

現状数値の初期値:

- 実績がある場合:
  - `membership_plan` から料金プランと金額を取得する
  - `membership_subscription` から期初人数候補を作る
  - 直近退会実績から月次解約率候補を出す
  - CRM 実績から問い合わせ、体験予約、体験実施、入会の実績率を計算する
- 実績がない場合:
  - 料金プラン、料金体系、金額、期初人数または販売数、解約率または有効期限、体験予約率、体験実施率、入会率を手入力する
  - 初期値は月額固定、月次解約率 3%、体験予約率 70%、体験実施率 80%、入会率 50% とする

グリッド入力:

- `現状数値` と `リード・入会計画` は AG Grid Community で作る
- Excel / Google Sheets からコピーした TSV を `paste` イベントで受け取り、選択セルを起点に複数セルへ反映する
- paste 時は列ごとに数値パース、% パース、円パースを行う
- 読み取り専用列には貼り付けない
- 貼り付け後はライブ試算を即時更新する
- Enterprise 専用の範囲選択・clipboard API は初期段階では使わない

収支計画保存で作るもの:

- 計画グループ: 期間と目標を持つ
- 収支計画: 計画グループに紐づく具体シナリオを持つ
- 料金プラン別の現状数値スナップショット
- 料金プラン別のリード・入会計画
- 月次の売上、会員数、問い合わせ数、入会数、営業利益の計算結果
- 登録済み `cost_item` をもとにした計画費用

既存スキーマ案との対応:

- UI 上の「計画グループ」は、現行メモの `goal_plan` 相当を再整理する概念として扱う
- 料金プラン別の現状数値と計画値は、`goal_plan_member_group` / `goal_plan_month_member_group` 相当へ保存する
- DB 命名は実装前に、`goal_plan` のままにするか `financial_plan_group` / `financial_plan` へ寄せるかを再検討する

## 16. プロトタイプ画面

ベータ募集前に、動くプロトタイプを作る。

画面なしヒアリングではなく、実際に触れる画面を見せてフィードバックを得る。

最初のプロトタイプ範囲:

- ログイン
- 招待
- 初期セットアップ
- 収支計画作成
- 既存会員グループ設定
- 成り行き計算
- GAP 調整
- location
- lead
- trial_session
- member
- membership_subscription
- cost_item template 選択
- monthly_review 入力
- CRM 実績値の自動算出
- 計画と実績の差分表示
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

## 17. 月次レビュー入力 UI

月次レビュー入力は、収支計画と CRM 実績を突き合わせるウィザードにする。

1. 対象月とスタジオ選択
2. 計画値確認
3. CRM 実績値確認
4. 会員数の補正
5. 集客実績の補正
6. 売上、広告費、費用の補正
7. 確認
8. レポート生成

必要な UX:

- ステップ間の自動保存
- CRM 実績値がある場合の「反映」ボタン
- 計画値、CRM 実績値、手入力値を区別して表示する
- 不整合はブロックせず警告
- 未確定値フラグ
- スキップ可能な項目の明示
- 最終確認で主要 KPI と予実差分を先に見せる

## 18. レポート UI

レポートは画面表示を先行する。

印刷 / PDF は後回しにする。

初期レポートは、要約中心、根拠展開可能な構成にする。

構成:

- 今月の重要成功要因 最大 3 つ
- 来月の推奨アクション
- 売上 / 営業利益 / 会員数 / CPO の予実差分カード
- 計画、CRM 実績、手入力確定値の比較
- ファネル: 問い合わせ → 体験予約 → 体験実施 → 入会
- 会員: 月初、入会、退会、月末
- 既存会員グループ別の差分: 会員数、月謝売上、退会
- PL: 売上、粗利、営業利益
- 広告: CPA、CPO、限界 CPO
- 問題のある拠点カード最大 3 つ
- 拠点別 PL 比較テーブル
- 拠点別の撤退判断材料: 売上、粗利、販管費、広告費、営業利益、会員数、退会数
- 共通費と広告費の按分根拠

各カードには「根拠を見る」を置き、計算式と入力値を展開できるようにする。

## 19. 実装順

Phase 0 は、業務フロー順に仕様と実装を固める。収支計画は入力の起点ではなく、料金プラン、追加売上、リード、入会、会員契約の実績を使う集計・シミュレーション画面として扱う。

短期の進め方:

1. 料金プランと追加売上項目の仕様を固める
2. リード管理、体験セッション、入会処理の仕様を固める
3. DB スキーマを Phase 0 の正として確定する
4. リード詳細と入会処理を mock UI で確認する
5. 収支計画を、登録済みマスタと CRM 実績を使う画面へ接続する
6. 月次レビュー入力とレポートへ接続する

CRM は、計画画面の代替ではなく、月次レビューで実績を拾うための土台として設計する。最初に日々の予約管理や請求管理へ広げすぎず、リード詳細に紐づく体験セッション、入会変換、会員契約履歴を優先する。

DB スキーマと GraphQL は、業務フローを保存できる形に落とす。`lead` を問い合わせから入会までの起点にし、`trial_session` は `lead` の関連履歴、`membership_subscription` は入会後の料金プラン契約履歴として扱う。`goal_plan_member_group` は、CRM の実データをそのまま表すものではなく、収支計画上の分析単位として扱う。

実装順:

1. 料金プラン管理の仕様確定
2. 追加売上項目管理の仕様確定
3. リード管理と入会処理の仕様確定
4. 旧ドメイン削除
5. Liquibase で新ドメインスキーマ作成
6. jOOQ 生成
7. backend GraphQL CRUD
8. 初期セットアップ
9. `lead` 詳細 mock UI
10. `trial_session` 関連情報 UI
11. `lead` から `member` への入会変換
12. `member` / `membership_subscription` 管理
13. CRM 実績集計サービス
14. 収支計画の mock UI と計算ロジック再接続
15. 収支計画保存
16. 月次レビュー入力ウィザード
17. 月次レビュー計算サービス
18. レポート表示
19. ベータ用デモデータ

収支計画は、料金プランと CRM 実績の仕様が固まった後に、予実管理と月次レビューへ接続する。

## 20. ベータ顧客獲得

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

## 21. ベータ候補の集め方

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

## 22. 最初の訴求

最初の訴求は「SaaS を試してください」ではなく、「月次数字の見直しを一緒にやらせてください」にする。

DM の核:

```text
月謝制スタジオ向けに、会員数・退会・入会・広告費・利益を月1回で振り返る小さなツールを作っています。
まだ開発中なので、実際のスタジオ運営で月次数字をどう見ているか、30分だけ教えてもらえませんか。
可能なら、こちらで簡単な月次レビューのたたき台も作ってお返しします。
```

売り込みではなく、協力依頼と返礼としての月次レビューたたき台を前面に出す。

## 23. ヒアリング方針

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

## 24. ベータ運用

ベータ期間中は毎月 1 回同席する。

目的はサポートではなく学習。

運用:

- 初回: 45〜60 分、セットアップ同席
- 1 回目月次入力: 30〜45 分、同席
- 2 回目: できればセルフ入力後に 30 分レビュー
- 終了時: 30 分、継続意向、価格感、不要機能確認

## 25. ベータ成功条件

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
