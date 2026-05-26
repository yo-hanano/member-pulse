--liquibase formatted sql

--changeset codex:seed-initial-company-and-admin splitStatements:true
-- 初期ログイン:
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
  'テスト株式会社',
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

--changeset codex:seed-relationships splitStatements:true
INSERT INTO public.relationship (code, name, sort_order)
VALUES
  ('father', '父', 1),
  ('mother', '母', 2),
  ('grandfather', '祖父', 3),
  ('grandmother', '祖母', 4),
  ('uncle', '叔父', 5),
  ('aunt', '叔母', 6),
  ('other', 'その他', 7)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-school-types splitStatements:true
INSERT INTO public.school_type (code, name, sort_order)
VALUES
  ('A1', '幼稚園', 1),
  ('A2', 'こども', 2),
  ('B1', '小学校', 3),
  ('C1', '中学校', 4),
  ('C2', '義務教育学校', 5),
  ('D1', '高校', 6),
  ('D2', '中等教育学校', 7),
  ('E1', '特別支援学校', 8),
  ('F1', '大学', 9),
  ('F2', '短大', 10),
  ('G1', '高専', 11),
  ('H1', '専修学校', 12),
  ('H2', '各種学校', 13)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-school-grades splitStatements:true
INSERT INTO public.school_grade (code, name, sort_order)
VALUES
  ('none', '指定なし', 1),
  ('grade_1', '1年', 2),
  ('grade_2', '2年', 3),
  ('grade_3', '3年', 4),
  ('grade_4', '4年', 5),
  ('grade_5', '5年', 6),
  ('grade_6', '6年', 7)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-gender splitStatements:true
INSERT INTO public.gender (code, name, sort_order)
VALUES
  ('not_specified', '未設定', 1),
  ('male', '男性', 2),
  ('female', '女性', 3)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-schedule-event-types splitStatements:true
INSERT INTO public.schedule_event_type (code, name, sort_order)
VALUES
  ('trial_lesson', '体験授業', 1),
  ('interview', '面談', 2)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-schedule-event-statuses splitStatements:true
INSERT INTO public.schedule_event_status (code, name, sort_order)
VALUES
  ('planned', '予定', 1),
  ('not_done', '未実施', 2),
  ('rescheduled', '日程変更済み', 3),
  ('done', '実施済み', 4),
  ('canceled', 'キャンセル', 5)
ON CONFLICT (code) DO NOTHING;

--changeset codex:seed-initial-subjects splitStatements:true
INSERT INTO public.subject (
  id,
  company_id,
  code,
  name,
  school_category,
  is_active,
  created_at,
  updated_at,
  is_deleted,
  deleted_at
)
VALUES
  ('cK4fG6mQ1xR8tY2nP7sUa', 'm3JjAoupaZaQUXzGWKE4q', 'kokugo', '国語', 'junior_high', true, now(), now(), false, null),
  ('dL5gH7nR2yS9uZ3qT8vBb', 'm3JjAoupaZaQUXzGWKE4q', 'sugaku', '数学', 'junior_high', true, now(), now(), false, null),
  ('eM6hJ8pS3zT1vA4rU9wCc', 'm3JjAoupaZaQUXzGWKE4q', 'eigo', '英語', 'junior_high', true, now(), now(), false, null),
  ('fN7jK9qT4aU2wB5sV1xDd', 'm3JjAoupaZaQUXzGWKE4q', 'rika', '理科', 'junior_high', true, now(), now(), false, null),
  ('gP8kL1rU5bV3xC6tW2yEe', 'm3JjAoupaZaQUXzGWKE4q', 'shakai', '社会', 'junior_high', true, now(), now(), false, null)
ON CONFLICT (id) DO NOTHING;
