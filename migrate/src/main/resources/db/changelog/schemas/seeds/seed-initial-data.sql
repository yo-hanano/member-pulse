--liquibase formatted sql

--changeset codex:seed-initial-company-and-admin splitStatements:true
-- Initial login:
--   companyCode: dev
--   email: tester@cxi-system.com
--   password: ntw8ngd8TGK9wjt@twu

INSERT INTO public.company (
  id,
  code,
  name,
  status,
  created_at,
  updated_at,
  is_deleted,
  deleted_at
)
VALUES (
  'm3JjAoupaZaQUXzGWKE4q',
  'dev',
  'MemberPulse Demo',
  'active',
  now(),
  now(),
  false,
  null
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.employee (
  id,
  company_id,
  name,
  email,
  password,
  is_admin,
  status,
  password_set_at,
  created_at,
  updated_at,
  is_deleted,
  deleted_at
)
VALUES (
  'hjZ8c5G9zQpXhFT_wv6EQ',
  'm3JjAoupaZaQUXzGWKE4q',
  'テスト 太郎',
  'tester@cxi-system.com',
  '$argon2id$v=19$m=65536,t=3,p=4$utv97PFpesOztI8x23HfCQ$KLCfVMiGjCJ8tK3qJWYT+5z6DHQ8capi6B9qEVcIP4c',
  true,
  'active',
  now(),
  now(),
  now(),
  false,
  null
)
ON CONFLICT (company_id, email) DO NOTHING;

--changeset codex:seed-gender splitStatements:true
INSERT INTO public.gender (code, name, sort_order)
VALUES
  ('not_specified', '未設定', 1),
  ('male', '男性', 2),
  ('female', '女性', 3)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-prefectures splitStatements:true
INSERT INTO public.prefecture (code, name, sort_order)
VALUES
  ('hkd', '北海道', 1),
  ('aom', '青森県', 2),
  ('iwt', '岩手県', 3),
  ('myg', '宮城県', 4),
  ('akt', '秋田県', 5),
  ('ygt', '山形県', 6),
  ('fks', '福島県', 7),
  ('ibr', '茨城県', 8),
  ('tcg', '栃木県', 9),
  ('gnm', '群馬県', 10),
  ('stm', '埼玉県', 11),
  ('chb', '千葉県', 12),
  ('tky', '東京都', 13),
  ('kng', '神奈川県', 14),
  ('nig', '新潟県', 15),
  ('tym', '富山県', 16),
  ('isk', '石川県', 17),
  ('fki', '福井県', 18),
  ('ymn', '山梨県', 19),
  ('ngn', '長野県', 20),
  ('gif', '岐阜県', 21),
  ('szo', '静岡県', 22),
  ('aic', '愛知県', 23),
  ('mie', '三重県', 24),
  ('sig', '滋賀県', 25),
  ('kyt', '京都府', 26),
  ('osk', '大阪府', 27),
  ('hyg', '兵庫県', 28),
  ('nar', '奈良県', 29),
  ('wky', '和歌山県', 30),
  ('ttr', '鳥取県', 31),
  ('smn', '島根県', 32),
  ('oky', '岡山県', 33),
  ('hrs', '広島県', 34),
  ('ygc', '山口県', 35),
  ('tks', '徳島県', 36),
  ('kgw', '香川県', 37),
  ('ehm', '愛媛県', 38),
  ('kch', '高知県', 39),
  ('fuk', '福岡県', 40),
  ('sag', '佐賀県', 41),
  ('ngs', '長崎県', 42),
  ('kmm', '熊本県', 43),
  ('oit', '大分県', 44),
  ('myz', '宮崎県', 45),
  ('kgs', '鹿児島県', 46),
  ('okn', '沖縄県', 47)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-cost-item-templates splitStatements:true
INSERT INTO public.cost_item_template (
  code,
  industry_type,
  name,
  cost_type,
  scope,
  calculation_method,
  target_revenue_type,
  default_amount,
  default_rate,
  description,
  display_order,
  active,
  created_at,
  updated_at
)
VALUES
  ('rent', 'common', '家賃', 'fixed', 'location_direct', 'fixed_amount', null, null, null, 'スタジオや店舗の月額賃料。', 10, true, now(), now()),
  ('utilities', 'common', '水道光熱費', 'fixed', 'location_direct', 'fixed_amount', null, null, null, '電気、ガス、水道などの固定的な店舗費用。', 20, true, now(), now()),
  ('booking_system', 'common', '予約システム利用料', 'fixed', 'location_direct', 'fixed_amount', null, null, null, '予約管理や会員管理システムの月額利用料。', 30, true, now(), now()),
  ('insurance', 'common', '保険', 'fixed', 'location_direct', 'fixed_amount', null, null, null, '施設賠償責任保険などの月額換算費用。', 40, true, now(), now()),
  ('cleaning', 'common', '清掃費', 'fixed', 'location_direct', 'fixed_amount', null, null, null, '店舗清掃や衛生維持に関する費用。', 50, true, now(), now()),
  ('instructor_fee', 'common', 'インストラクター報酬', 'variable', 'location_direct', 'revenue_rate', 'membership_revenue', null, null, 'レッスン提供に連動する業務委託費や人件費。', 60, true, now(), now()),
  ('consumables', 'common', '消耗品費', 'variable', 'location_direct', 'member_count', null, null, null, '会員数に応じて増えやすい備品、消耗品。', 70, true, now(), now()),
  ('payment_fee', 'common', '決済手数料', 'variable', 'location_direct', 'revenue_rate', 'total_revenue', null, null, 'クレジットカードや口座振替などの決済手数料。', 80, true, now(), now()),
  ('tax_accountant', 'common', '税理士費用', 'fixed', 'head_office', 'fixed_amount', null, null, null, '税理士、会計事務所などの共通費用。', 90, true, now(), now()),
  ('shared_system', 'common', '共通システム費', 'fixed', 'head_office', 'fixed_amount', null, null, null, '複数拠点で共通利用するシステム費用。', 100, true, now(), now()),
  ('admin_outsource', 'common', '事務外注費', 'fixed', 'head_office', 'fixed_amount', null, null, null, '事務作業やバックオフィスの外注費用。', 110, true, now(), now())
ON CONFLICT (code) DO NOTHING;
