--liquibase formatted sql

--changeset codex:member-pulse-phase0-001-business-profile
CREATE TABLE public.business_profile (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  business_name VARCHAR(120) NOT NULL,
  industry_type VARCHAR(40) NOT NULL DEFAULT 'studio',
  setup_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  setup_completed_at TIMESTAMP WITHOUT TIME ZONE,
  default_location_id VARCHAR(21),
  fiscal_year_start_month INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT business_profile_pkey PRIMARY KEY (id),
  CONSTRAINT business_profile_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT ck_business_profile_industry_type CHECK (industry_type IN ('studio', 'gym', 'language_school', 'common')),
  CONSTRAINT ck_business_profile_setup_status CHECK (setup_status IN ('not_started', 'in_progress', 'completed')),
  CONSTRAINT ck_business_profile_fiscal_year_start_month CHECK (fiscal_year_start_month BETWEEN 1 AND 12)
);
CREATE UNIQUE INDEX ux_business_profile_company_active ON public.business_profile (company_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_business_profile_company_id ON public.business_profile (company_id);
COMMENT ON TABLE public.business_profile IS '事業プロフィール';

--changeset codex:member-pulse-phase0-002-area-location
CREATE TABLE public.area (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT area_pkey PRIMARY KEY (id),
  CONSTRAINT area_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id)
);
CREATE UNIQUE INDEX ux_area_company_name_active ON public.area (company_id, name) WHERE deleted_at IS NULL;
CREATE INDEX ix_area_company_id ON public.area (company_id);
COMMENT ON TABLE public.area IS '任意の拠点グループ';

CREATE TABLE public.location (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  area_id VARCHAR(21),
  name VARCHAR(100) NOT NULL,
  zip_code VARCHAR(8),
  prefecture_code VARCHAR(21),
  address VARCHAR(255),
  is_default BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT location_pkey PRIMARY KEY (id),
  CONSTRAINT location_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT location_area_id_fk FOREIGN KEY (area_id) REFERENCES public.area (id),
  CONSTRAINT location_prefecture_code_fk FOREIGN KEY (prefecture_code) REFERENCES public.prefecture (code)
);
CREATE UNIQUE INDEX ux_location_company_name_active ON public.location (company_id, name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_location_company_default_active ON public.location (company_id) WHERE is_default = true AND deleted_at IS NULL;
CREATE INDEX ix_location_company_id ON public.location (company_id);
CREATE INDEX ix_location_area_id ON public.location (area_id);
CREATE INDEX ix_location_prefecture_code ON public.location (prefecture_code);
COMMENT ON TABLE public.location IS 'スタジオ、店舗、教室、ジムなどの拠点';

ALTER TABLE public.business_profile
  ADD CONSTRAINT business_profile_default_location_id_fk FOREIGN KEY (default_location_id) REFERENCES public.location (id);

--changeset codex:member-pulse-phase0-003-goal-plan
CREATE TABLE public.goal_plan (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  annual_revenue_goal NUMERIC(14,2) NOT NULL DEFAULT 0,
  annual_operating_profit_goal NUMERIC(14,2) NOT NULL DEFAULT 0,
  year_end_member_count_goal INTEGER NOT NULL DEFAULT 0,
  current_member_count INTEGER NOT NULL DEFAULT 0,
  average_monthly_fee NUMERIC(14,2) NOT NULL DEFAULT 0,
  acceptable_churn_rate NUMERIC(7,4) NOT NULL DEFAULT 0.0300,
  trial_booking_rate NUMERIC(7,4) NOT NULL DEFAULT 0.7000,
  trial_attendance_rate NUMERIC(7,4) NOT NULL DEFAULT 0.8000,
  enrollment_rate NUMERIC(7,4) NOT NULL DEFAULT 0.5000,
  annual_ad_spend_limit NUMERIC(14,2) NOT NULL DEFAULT 0,
  acceptable_ad_investment_rate NUMERIC(7,4) NOT NULL DEFAULT 0.3000,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT goal_plan_pkey PRIMARY KEY (id),
  CONSTRAINT goal_plan_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT ck_goal_plan_rates CHECK (
    acceptable_churn_rate >= 0
    AND trial_booking_rate >= 0
    AND trial_attendance_rate >= 0
    AND enrollment_rate >= 0
    AND acceptable_ad_investment_rate >= 0
  )
);
CREATE UNIQUE INDEX ux_goal_plan_company_fiscal_year_active ON public.goal_plan (company_id, fiscal_year) WHERE deleted_at IS NULL;
CREATE INDEX ix_goal_plan_company_id ON public.goal_plan (company_id);

CREATE TABLE public.goal_plan_month (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  goal_plan_id VARCHAR(21) NOT NULL,
  target_month DATE NOT NULL,
  location_id VARCHAR(21),
  revenue_goal NUMERIC(14,2) NOT NULL DEFAULT 0,
  operating_profit_goal NUMERIC(14,2) NOT NULL DEFAULT 0,
  ending_member_count_goal INTEGER NOT NULL DEFAULT 0,
  new_member_count_goal INTEGER NOT NULL DEFAULT 0,
  resigned_member_count_limit INTEGER NOT NULL DEFAULT 0,
  inquiry_count_goal INTEGER NOT NULL DEFAULT 0,
  trial_booking_count_goal INTEGER NOT NULL DEFAULT 0,
  trial_completed_count_goal INTEGER NOT NULL DEFAULT 0,
  ad_spend_limit NUMERIC(14,2) NOT NULL DEFAULT 0,
  average_monthly_fee_goal NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_overridden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT goal_plan_month_pkey PRIMARY KEY (id),
  CONSTRAINT goal_plan_month_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT goal_plan_month_goal_plan_id_fk FOREIGN KEY (goal_plan_id) REFERENCES public.goal_plan (id),
  CONSTRAINT goal_plan_month_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT ck_goal_plan_month_target_month CHECK (target_month = date_trunc('month', target_month)::date)
);
CREATE UNIQUE INDEX ux_goal_plan_month_scope_active ON public.goal_plan_month (goal_plan_id, target_month, COALESCE(location_id, '')) WHERE deleted_at IS NULL;
CREATE INDEX ix_goal_plan_month_company_id ON public.goal_plan_month (company_id);
CREATE INDEX ix_goal_plan_month_location_id ON public.goal_plan_month (location_id);

--changeset codex:member-pulse-phase0-004-crm
CREATE TABLE public.membership_plan (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21),
  name VARCHAR(100) NOT NULL,
  monthly_fee NUMERIC(14,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT membership_plan_pkey PRIMARY KEY (id),
  CONSTRAINT membership_plan_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT membership_plan_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id)
);
CREATE UNIQUE INDEX ux_membership_plan_company_name_active ON public.membership_plan (company_id, name) WHERE deleted_at IS NULL;
CREATE INDEX ix_membership_plan_company_id ON public.membership_plan (company_id);
CREATE INDEX ix_membership_plan_location_id ON public.membership_plan (location_id);

CREATE TABLE public.lead (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(40),
  email VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  inquiry_at TIMESTAMP WITHOUT TIME ZONE,
  lost_at TIMESTAMP WITHOUT TIME ZONE,
  lost_reason TEXT,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT lead_pkey PRIMARY KEY (id),
  CONSTRAINT lead_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT lead_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT ck_lead_status CHECK (status IN ('new', 'contacted', 'trial_scheduled', 'trial_completed', 'enrolled', 'lost'))
);
CREATE INDEX ix_lead_company_id ON public.lead (company_id);
CREATE INDEX ix_lead_location_id ON public.lead (location_id);
CREATE INDEX ix_lead_inquiry_at ON public.lead (inquiry_at);
CREATE INDEX ix_lead_status ON public.lead (status);

CREATE TABLE public.trial_session (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  lead_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21) NOT NULL,
  scheduled_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITHOUT TIME ZONE,
  status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT trial_session_pkey PRIMARY KEY (id),
  CONSTRAINT trial_session_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT trial_session_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.lead (id),
  CONSTRAINT trial_session_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT ck_trial_session_status CHECK (status IN ('scheduled', 'completed', 'no_show', 'canceled'))
);
CREATE INDEX ix_trial_session_company_id ON public.trial_session (company_id);
CREATE INDEX ix_trial_session_lead_id ON public.trial_session (lead_id);
CREATE INDEX ix_trial_session_location_id ON public.trial_session (location_id);
CREATE INDEX ix_trial_session_scheduled_at ON public.trial_session (scheduled_at);
CREATE INDEX ix_trial_session_completed_at ON public.trial_session (completed_at);

CREATE TABLE public.member (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21) NOT NULL,
  lead_id VARCHAR(21),
  name VARCHAR(100) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  joined_at DATE NOT NULL,
  resigned_at DATE,
  resignation_reason_code VARCHAR(40),
  resignation_note TEXT,
  phone VARCHAR(40),
  email VARCHAR(255),
  line_display_name VARCHAR(100),
  address TEXT,
  birth_date DATE,
  source VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT member_pkey PRIMARY KEY (id),
  CONSTRAINT member_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT member_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT member_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.lead (id),
  CONSTRAINT ck_member_status CHECK (status IN ('active', 'paused', 'resigned'))
);
CREATE UNIQUE INDEX ux_member_lead_active ON public.member (lead_id) WHERE lead_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX ix_member_company_id ON public.member (company_id);
CREATE INDEX ix_member_location_id ON public.member (location_id);
CREATE INDEX ix_member_status ON public.member (status);
CREATE INDEX ix_member_joined_at ON public.member (joined_at);
CREATE INDEX ix_member_resigned_at ON public.member (resigned_at);

CREATE TABLE public.membership_subscription (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  member_id VARCHAR(21) NOT NULL,
  membership_plan_id VARCHAR(21),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  monthly_fee NUMERIC(14,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT membership_subscription_pkey PRIMARY KEY (id),
  CONSTRAINT membership_subscription_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT membership_subscription_member_id_fk FOREIGN KEY (member_id) REFERENCES public.member (id),
  CONSTRAINT membership_subscription_plan_id_fk FOREIGN KEY (membership_plan_id) REFERENCES public.membership_plan (id),
  CONSTRAINT ck_membership_subscription_status CHECK (status IN ('active', 'paused', 'ended')),
  CONSTRAINT ck_membership_subscription_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX ix_membership_subscription_company_id ON public.membership_subscription (company_id);
CREATE INDEX ix_membership_subscription_member_id ON public.membership_subscription (member_id);
CREATE INDEX ix_membership_subscription_plan_id ON public.membership_subscription (membership_plan_id);
CREATE INDEX ix_membership_subscription_period ON public.membership_subscription (start_date, end_date);

--changeset codex:member-pulse-phase0-005-costs
CREATE TABLE public.cost_item_template (
  code VARCHAR(40) NOT NULL,
  industry_type VARCHAR(40) NOT NULL DEFAULT 'common',
  name VARCHAR(100) NOT NULL,
  cost_type VARCHAR(40) NOT NULL,
  scope VARCHAR(40) NOT NULL,
  calculation_method VARCHAR(40) NOT NULL,
  target_revenue_type VARCHAR(40),
  default_amount NUMERIC(14,2),
  default_rate NUMERIC(7,4),
  description TEXT,
  display_order INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT cost_item_template_pkey PRIMARY KEY (code),
  CONSTRAINT ck_cost_item_template_industry_type CHECK (industry_type IN ('studio', 'gym', 'language_school', 'common')),
  CONSTRAINT ck_cost_item_template_cost_type CHECK (cost_type IN ('fixed', 'variable')),
  CONSTRAINT ck_cost_item_template_scope CHECK (scope IN ('location_direct', 'head_office')),
  CONSTRAINT ck_cost_item_template_calculation_method CHECK (calculation_method IN ('fixed_amount', 'revenue_rate', 'member_count', 'manual')),
  CONSTRAINT ck_cost_item_template_target_revenue_type CHECK (target_revenue_type IS NULL OR target_revenue_type IN ('total_revenue', 'membership_revenue'))
);
CREATE INDEX ix_cost_item_template_active_order ON public.cost_item_template (active, display_order);

CREATE TABLE public.cost_item (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21),
  template_code VARCHAR(40),
  name VARCHAR(100) NOT NULL,
  cost_type VARCHAR(40) NOT NULL,
  scope VARCHAR(40) NOT NULL,
  calculation_method VARCHAR(40) NOT NULL,
  amount NUMERIC(14,2),
  rate NUMERIC(7,4),
  target_revenue_type VARCHAR(40),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT cost_item_pkey PRIMARY KEY (id),
  CONSTRAINT cost_item_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT cost_item_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT cost_item_template_code_fk FOREIGN KEY (template_code) REFERENCES public.cost_item_template (code),
  CONSTRAINT ck_cost_item_cost_type CHECK (cost_type IN ('fixed', 'variable')),
  CONSTRAINT ck_cost_item_scope CHECK (scope IN ('location_direct', 'head_office')),
  CONSTRAINT ck_cost_item_calculation_method CHECK (calculation_method IN ('fixed_amount', 'revenue_rate', 'member_count', 'manual')),
  CONSTRAINT ck_cost_item_target_revenue_type CHECK (target_revenue_type IS NULL OR target_revenue_type IN ('total_revenue', 'membership_revenue'))
);
CREATE UNIQUE INDEX ux_cost_item_scope_name_active ON public.cost_item (company_id, COALESCE(location_id, ''), name) WHERE deleted_at IS NULL;
CREATE INDEX ix_cost_item_company_id ON public.cost_item (company_id);
CREATE INDEX ix_cost_item_location_id ON public.cost_item (location_id);
CREATE INDEX ix_cost_item_template_code ON public.cost_item (template_code);

--changeset codex:member-pulse-phase0-006-monthly-review
CREATE TABLE public.monthly_review (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  goal_plan_id VARCHAR(21),
  review_month DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'not_started',
  head_office_cost_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  unassigned_ad_spend_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  acceptable_ad_investment_rate NUMERIC(7,4),
  note TEXT,
  generated_at TIMESTAMP WITHOUT TIME ZONE,
  confirmed_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT monthly_review_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_review_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT monthly_review_goal_plan_id_fk FOREIGN KEY (goal_plan_id) REFERENCES public.goal_plan (id),
  CONSTRAINT ck_monthly_review_review_month CHECK (review_month = date_trunc('month', review_month)::date),
  CONSTRAINT ck_monthly_review_status CHECK (status IN ('not_started', 'in_progress', 'generated', 'confirmed'))
);
CREATE UNIQUE INDEX ux_monthly_review_company_month_active ON public.monthly_review (company_id, review_month) WHERE deleted_at IS NULL;
CREATE INDEX ix_monthly_review_company_id ON public.monthly_review (company_id);
CREATE INDEX ix_monthly_review_goal_plan_id ON public.monthly_review (goal_plan_id);

CREATE TABLE public.monthly_review_location (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  monthly_review_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21) NOT NULL,
  beginning_member_count INTEGER,
  ending_member_count INTEGER,
  new_member_count INTEGER,
  resigned_member_count INTEGER,
  new_inquiry_count INTEGER,
  trial_booking_count INTEGER,
  trial_completed_count INTEGER,
  total_revenue NUMERIC(14,2),
  membership_revenue NUMERIC(14,2),
  other_revenue NUMERIC(14,2),
  average_monthly_fee NUMERIC(14,2),
  location_ad_spend_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  variable_cost_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  fixed_cost_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  crm_beginning_member_count INTEGER,
  crm_ending_member_count INTEGER,
  crm_new_member_count INTEGER,
  crm_resigned_member_count INTEGER,
  crm_new_inquiry_count INTEGER,
  crm_trial_booking_count INTEGER,
  crm_trial_completed_count INTEGER,
  crm_average_monthly_fee NUMERIC(14,2),
  warnings_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT monthly_review_location_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_review_location_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT monthly_review_location_review_id_fk FOREIGN KEY (monthly_review_id) REFERENCES public.monthly_review (id),
  CONSTRAINT monthly_review_location_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id)
);
CREATE UNIQUE INDEX ux_monthly_review_location_scope_active ON public.monthly_review_location (monthly_review_id, location_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_monthly_review_location_company_id ON public.monthly_review_location (company_id);
CREATE INDEX ix_monthly_review_location_location_id ON public.monthly_review_location (location_id);

CREATE TABLE public.monthly_review_cost (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  monthly_review_id VARCHAR(21) NOT NULL,
  monthly_review_location_id VARCHAR(21),
  cost_item_id VARCHAR(21),
  name VARCHAR(100) NOT NULL,
  cost_type VARCHAR(40) NOT NULL,
  scope VARCHAR(40) NOT NULL,
  calculation_method VARCHAR(40) NOT NULL,
  expected_amount NUMERIC(14,2),
  actual_amount NUMERIC(14,2),
  is_overridden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT monthly_review_cost_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_review_cost_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT monthly_review_cost_review_id_fk FOREIGN KEY (monthly_review_id) REFERENCES public.monthly_review (id),
  CONSTRAINT monthly_review_cost_location_id_fk FOREIGN KEY (monthly_review_location_id) REFERENCES public.monthly_review_location (id),
  CONSTRAINT monthly_review_cost_cost_item_id_fk FOREIGN KEY (cost_item_id) REFERENCES public.cost_item (id),
  CONSTRAINT ck_monthly_review_cost_cost_type CHECK (cost_type IN ('fixed', 'variable')),
  CONSTRAINT ck_monthly_review_cost_scope CHECK (scope IN ('location_direct', 'head_office')),
  CONSTRAINT ck_monthly_review_cost_calculation_method CHECK (calculation_method IN ('fixed_amount', 'revenue_rate', 'member_count', 'manual'))
);
CREATE INDEX ix_monthly_review_cost_company_id ON public.monthly_review_cost (company_id);
CREATE INDEX ix_monthly_review_cost_review_id ON public.monthly_review_cost (monthly_review_id);
CREATE INDEX ix_monthly_review_cost_location_id ON public.monthly_review_cost (monthly_review_location_id);

CREATE TABLE public.ad_spend (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  monthly_review_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21),
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  source_type VARCHAR(40) NOT NULL DEFAULT 'manual',
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT ad_spend_pkey PRIMARY KEY (id),
  CONSTRAINT ad_spend_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT ad_spend_monthly_review_id_fk FOREIGN KEY (monthly_review_id) REFERENCES public.monthly_review (id),
  CONSTRAINT ad_spend_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT ck_ad_spend_source_type CHECK (source_type IN ('manual', 'imported', 'crm'))
);
CREATE INDEX ix_ad_spend_company_id ON public.ad_spend (company_id);
CREATE INDEX ix_ad_spend_review_id ON public.ad_spend (monthly_review_id);
CREATE INDEX ix_ad_spend_location_id ON public.ad_spend (location_id);

--changeset codex:member-pulse-phase0-007-snapshots
CREATE TABLE public.monthly_review_snapshot (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  monthly_review_id VARCHAR(21) NOT NULL,
  version INTEGER NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT true,
  generated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  superseded_at TIMESTAMP WITHOUT TIME ZONE,
  generated_by_employee_id VARCHAR(21),
  total_revenue NUMERIC(14,2),
  operating_profit NUMERIC(14,2),
  ending_member_count INTEGER,
  new_member_count INTEGER,
  resigned_member_count INTEGER,
  ad_spend_amount NUMERIC(14,2),
  cpo NUMERIC(14,2),
  marginal_cpo NUMERIC(14,2),
  summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  kpi_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  pl_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ltv_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_success_factors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  goal_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT monthly_review_snapshot_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_review_snapshot_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT monthly_review_snapshot_review_id_fk FOREIGN KEY (monthly_review_id) REFERENCES public.monthly_review (id),
  CONSTRAINT monthly_review_snapshot_employee_id_fk FOREIGN KEY (generated_by_employee_id) REFERENCES public.employee (id)
);
CREATE UNIQUE INDEX ux_monthly_review_snapshot_version ON public.monthly_review_snapshot (monthly_review_id, version);
CREATE UNIQUE INDEX ux_monthly_review_snapshot_current ON public.monthly_review_snapshot (monthly_review_id) WHERE is_current = true;
CREATE INDEX ix_monthly_review_snapshot_company_id ON public.monthly_review_snapshot (company_id);

CREATE TABLE public.monthly_review_location_snapshot (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  monthly_review_snapshot_id VARCHAR(21) NOT NULL,
  monthly_review_location_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21) NOT NULL,
  total_revenue NUMERIC(14,2),
  operating_profit NUMERIC(14,2),
  ending_member_count INTEGER,
  new_member_count INTEGER,
  resigned_member_count INTEGER,
  ad_spend_amount NUMERIC(14,2),
  cpo NUMERIC(14,2),
  marginal_cpo NUMERIC(14,2),
  kpi_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  pl_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ltv_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  issue_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  allocation_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT monthly_review_location_snapshot_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_review_location_snapshot_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT monthly_review_location_snapshot_snapshot_id_fk FOREIGN KEY (monthly_review_snapshot_id) REFERENCES public.monthly_review_snapshot (id),
  CONSTRAINT monthly_review_location_snapshot_location_input_id_fk FOREIGN KEY (monthly_review_location_id) REFERENCES public.monthly_review_location (id),
  CONSTRAINT monthly_review_location_snapshot_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id)
);
CREATE UNIQUE INDEX ux_monthly_review_location_snapshot_scope ON public.monthly_review_location_snapshot (monthly_review_snapshot_id, location_id);
CREATE INDEX ix_monthly_review_location_snapshot_company_id ON public.monthly_review_location_snapshot (company_id);
--changeset codex:member-pulse-phase0-008-column-comments
COMMENT ON COLUMN public.business_profile.id IS 'ID';
COMMENT ON COLUMN public.business_profile.company_id IS '会社ID';
COMMENT ON COLUMN public.business_profile.business_name IS '事業名';
COMMENT ON COLUMN public.business_profile.industry_type IS '業種種別';
COMMENT ON COLUMN public.business_profile.setup_status IS 'セットアップ状態';
COMMENT ON COLUMN public.business_profile.setup_completed_at IS 'セットアップ完了日時';
COMMENT ON COLUMN public.business_profile.default_location_id IS '既定拠点ID';
COMMENT ON COLUMN public.business_profile.fiscal_year_start_month IS '会計年度開始月';
COMMENT ON COLUMN public.business_profile.note IS 'メモ';
COMMENT ON COLUMN public.business_profile.created_at IS '作成日時';
COMMENT ON COLUMN public.business_profile.updated_at IS '更新日時';
COMMENT ON COLUMN public.business_profile.deleted_at IS '削除日時';

COMMENT ON COLUMN public.area.id IS 'ID';
COMMENT ON COLUMN public.area.company_id IS '会社ID';
COMMENT ON COLUMN public.area.name IS 'エリア名';
COMMENT ON COLUMN public.area.display_order IS '表示順';
COMMENT ON COLUMN public.area.created_at IS '作成日時';
COMMENT ON COLUMN public.area.updated_at IS '更新日時';
COMMENT ON COLUMN public.area.deleted_at IS '削除日時';

COMMENT ON COLUMN public.location.id IS 'ID';
COMMENT ON COLUMN public.location.company_id IS '会社ID';
COMMENT ON COLUMN public.location.area_id IS 'エリアID';
COMMENT ON COLUMN public.location.name IS '拠点名';
COMMENT ON COLUMN public.location.zip_code IS '郵便番号';
COMMENT ON COLUMN public.location.prefecture_code IS '都道府県コード';
COMMENT ON COLUMN public.location.address IS '住所';
COMMENT ON COLUMN public.location.is_default IS '既定拠点フラグ';
COMMENT ON COLUMN public.location.display_order IS '表示順';
COMMENT ON COLUMN public.location.created_at IS '作成日時';
COMMENT ON COLUMN public.location.updated_at IS '更新日時';
COMMENT ON COLUMN public.location.deleted_at IS '削除日時';

COMMENT ON COLUMN public.goal_plan.id IS 'ID';
COMMENT ON COLUMN public.goal_plan.company_id IS '会社ID';
COMMENT ON COLUMN public.goal_plan.fiscal_year IS '会計年度';
COMMENT ON COLUMN public.goal_plan.annual_revenue_goal IS '年間売上目標';
COMMENT ON COLUMN public.goal_plan.annual_operating_profit_goal IS '年間営業利益目標';
COMMENT ON COLUMN public.goal_plan.year_end_member_count_goal IS '期末会員数目標';
COMMENT ON COLUMN public.goal_plan.current_member_count IS '現在会員数';
COMMENT ON COLUMN public.goal_plan.average_monthly_fee IS '平均月謝';
COMMENT ON COLUMN public.goal_plan.acceptable_churn_rate IS '許容退会率';
COMMENT ON COLUMN public.goal_plan.trial_booking_rate IS '体験予約率';
COMMENT ON COLUMN public.goal_plan.trial_attendance_rate IS '体験参加率';
COMMENT ON COLUMN public.goal_plan.enrollment_rate IS '入会率';
COMMENT ON COLUMN public.goal_plan.annual_ad_spend_limit IS '年間広告費上限';
COMMENT ON COLUMN public.goal_plan.acceptable_ad_investment_rate IS '許容広告投資率';
COMMENT ON COLUMN public.goal_plan.active IS '有効フラグ';
COMMENT ON COLUMN public.goal_plan.created_at IS '作成日時';
COMMENT ON COLUMN public.goal_plan.updated_at IS '更新日時';
COMMENT ON COLUMN public.goal_plan.deleted_at IS '削除日時';

COMMENT ON COLUMN public.goal_plan_month.id IS 'ID';
COMMENT ON COLUMN public.goal_plan_month.company_id IS '会社ID';
COMMENT ON COLUMN public.goal_plan_month.goal_plan_id IS '目標計画ID';
COMMENT ON COLUMN public.goal_plan_month.target_month IS '対象月';
COMMENT ON COLUMN public.goal_plan_month.location_id IS '拠点ID';
COMMENT ON COLUMN public.goal_plan_month.revenue_goal IS '売上目標';
COMMENT ON COLUMN public.goal_plan_month.operating_profit_goal IS '営業利益目標';
COMMENT ON COLUMN public.goal_plan_month.ending_member_count_goal IS '月末会員数目標';
COMMENT ON COLUMN public.goal_plan_month.new_member_count_goal IS '新規入会数目標';
COMMENT ON COLUMN public.goal_plan_month.resigned_member_count_limit IS '退会数上限';
COMMENT ON COLUMN public.goal_plan_month.inquiry_count_goal IS '問い合わせ数目標';
COMMENT ON COLUMN public.goal_plan_month.trial_booking_count_goal IS '体験予約数目標';
COMMENT ON COLUMN public.goal_plan_month.trial_completed_count_goal IS '体験実施数目標';
COMMENT ON COLUMN public.goal_plan_month.ad_spend_limit IS '広告費上限';
COMMENT ON COLUMN public.goal_plan_month.average_monthly_fee_goal IS '平均月謝目標';
COMMENT ON COLUMN public.goal_plan_month.is_overridden IS '個別上書きフラグ';
COMMENT ON COLUMN public.goal_plan_month.created_at IS '作成日時';
COMMENT ON COLUMN public.goal_plan_month.updated_at IS '更新日時';
COMMENT ON COLUMN public.goal_plan_month.deleted_at IS '削除日時';

COMMENT ON COLUMN public.membership_plan.id IS 'ID';
COMMENT ON COLUMN public.membership_plan.company_id IS '会社ID';
COMMENT ON COLUMN public.membership_plan.location_id IS '拠点ID';
COMMENT ON COLUMN public.membership_plan.name IS '月額プラン名';
COMMENT ON COLUMN public.membership_plan.monthly_fee IS '月額料金';
COMMENT ON COLUMN public.membership_plan.active IS '有効フラグ';
COMMENT ON COLUMN public.membership_plan.display_order IS '表示順';
COMMENT ON COLUMN public.membership_plan.note IS 'メモ';
COMMENT ON COLUMN public.membership_plan.created_at IS '作成日時';
COMMENT ON COLUMN public.membership_plan.updated_at IS '更新日時';
COMMENT ON COLUMN public.membership_plan.deleted_at IS '削除日時';

COMMENT ON COLUMN public.lead.id IS 'ID';
COMMENT ON COLUMN public.lead.company_id IS '会社ID';
COMMENT ON COLUMN public.lead.location_id IS '拠点ID';
COMMENT ON COLUMN public.lead.name IS '見込み客名';
COMMENT ON COLUMN public.lead.phone IS '電話番号';
COMMENT ON COLUMN public.lead.email IS 'メールアドレス';
COMMENT ON COLUMN public.lead.source IS '流入元';
COMMENT ON COLUMN public.lead.status IS '状態';
COMMENT ON COLUMN public.lead.inquiry_at IS '問い合わせ日時';
COMMENT ON COLUMN public.lead.lost_at IS '失注日時';
COMMENT ON COLUMN public.lead.lost_reason IS '失注理由';
COMMENT ON COLUMN public.lead.note IS 'メモ';
COMMENT ON COLUMN public.lead.created_at IS '作成日時';
COMMENT ON COLUMN public.lead.updated_at IS '更新日時';
COMMENT ON COLUMN public.lead.deleted_at IS '削除日時';

COMMENT ON COLUMN public.trial_session.id IS 'ID';
COMMENT ON COLUMN public.trial_session.company_id IS '会社ID';
COMMENT ON COLUMN public.trial_session.lead_id IS '見込み客ID';
COMMENT ON COLUMN public.trial_session.location_id IS '拠点ID';
COMMENT ON COLUMN public.trial_session.scheduled_at IS '体験予定日時';
COMMENT ON COLUMN public.trial_session.completed_at IS '体験完了日時';
COMMENT ON COLUMN public.trial_session.status IS '状態';
COMMENT ON COLUMN public.trial_session.note IS 'メモ';
COMMENT ON COLUMN public.trial_session.created_at IS '作成日時';
COMMENT ON COLUMN public.trial_session.updated_at IS '更新日時';
COMMENT ON COLUMN public.trial_session.deleted_at IS '削除日時';

COMMENT ON COLUMN public.member.id IS 'ID';
COMMENT ON COLUMN public.member.company_id IS '会社ID';
COMMENT ON COLUMN public.member.location_id IS '拠点ID';
COMMENT ON COLUMN public.member.lead_id IS '見込み客ID';
COMMENT ON COLUMN public.member.name IS '会員名';
COMMENT ON COLUMN public.member.status IS '状態';
COMMENT ON COLUMN public.member.joined_at IS '入会日';
COMMENT ON COLUMN public.member.resigned_at IS '退会日';
COMMENT ON COLUMN public.member.resignation_reason_code IS '退会理由コード';
COMMENT ON COLUMN public.member.resignation_note IS '退会理由メモ';
COMMENT ON COLUMN public.member.phone IS '電話番号';
COMMENT ON COLUMN public.member.email IS 'メールアドレス';
COMMENT ON COLUMN public.member.line_display_name IS 'LINE表示名';
COMMENT ON COLUMN public.member.address IS '住所';
COMMENT ON COLUMN public.member.birth_date IS '生年月日';
COMMENT ON COLUMN public.member.source IS '流入元';
COMMENT ON COLUMN public.member.note IS 'メモ';
COMMENT ON COLUMN public.member.created_at IS '作成日時';
COMMENT ON COLUMN public.member.updated_at IS '更新日時';
COMMENT ON COLUMN public.member.deleted_at IS '削除日時';

COMMENT ON COLUMN public.membership_subscription.id IS 'ID';
COMMENT ON COLUMN public.membership_subscription.company_id IS '会社ID';
COMMENT ON COLUMN public.membership_subscription.member_id IS '会員ID';
COMMENT ON COLUMN public.membership_subscription.membership_plan_id IS '月額プランID';
COMMENT ON COLUMN public.membership_subscription.start_date IS '契約開始日';
COMMENT ON COLUMN public.membership_subscription.end_date IS '契約終了日';
COMMENT ON COLUMN public.membership_subscription.status IS '状態';
COMMENT ON COLUMN public.membership_subscription.monthly_fee IS '月額料金';
COMMENT ON COLUMN public.membership_subscription.note IS 'メモ';
COMMENT ON COLUMN public.membership_subscription.created_at IS '作成日時';
COMMENT ON COLUMN public.membership_subscription.updated_at IS '更新日時';
COMMENT ON COLUMN public.membership_subscription.deleted_at IS '削除日時';

COMMENT ON COLUMN public.cost_item_template.code IS 'コード';
COMMENT ON COLUMN public.cost_item_template.industry_type IS '業種種別';
COMMENT ON COLUMN public.cost_item_template.name IS '費用テンプレート名';
COMMENT ON COLUMN public.cost_item_template.cost_type IS '費用種別';
COMMENT ON COLUMN public.cost_item_template.scope IS '費用範囲';
COMMENT ON COLUMN public.cost_item_template.calculation_method IS '計算方法';
COMMENT ON COLUMN public.cost_item_template.target_revenue_type IS '対象売上種別';
COMMENT ON COLUMN public.cost_item_template.default_amount IS '既定金額';
COMMENT ON COLUMN public.cost_item_template.default_rate IS '既定率';
COMMENT ON COLUMN public.cost_item_template.description IS '説明';
COMMENT ON COLUMN public.cost_item_template.display_order IS '表示順';
COMMENT ON COLUMN public.cost_item_template.active IS '有効フラグ';
COMMENT ON COLUMN public.cost_item_template.created_at IS '作成日時';
COMMENT ON COLUMN public.cost_item_template.updated_at IS '更新日時';

COMMENT ON COLUMN public.cost_item.id IS 'ID';
COMMENT ON COLUMN public.cost_item.company_id IS '会社ID';
COMMENT ON COLUMN public.cost_item.location_id IS '拠点ID';
COMMENT ON COLUMN public.cost_item.template_code IS '費用テンプレートコード';
COMMENT ON COLUMN public.cost_item.name IS '費用名';
COMMENT ON COLUMN public.cost_item.cost_type IS '費用種別';
COMMENT ON COLUMN public.cost_item.scope IS '費用範囲';
COMMENT ON COLUMN public.cost_item.calculation_method IS '計算方法';
COMMENT ON COLUMN public.cost_item.amount IS '金額';
COMMENT ON COLUMN public.cost_item.rate IS '率';
COMMENT ON COLUMN public.cost_item.target_revenue_type IS '対象売上種別';
COMMENT ON COLUMN public.cost_item.active IS '有効フラグ';
COMMENT ON COLUMN public.cost_item.created_at IS '作成日時';
COMMENT ON COLUMN public.cost_item.updated_at IS '更新日時';
COMMENT ON COLUMN public.cost_item.deleted_at IS '削除日時';

COMMENT ON COLUMN public.monthly_review.id IS 'ID';
COMMENT ON COLUMN public.monthly_review.company_id IS '会社ID';
COMMENT ON COLUMN public.monthly_review.goal_plan_id IS '目標計画ID';
COMMENT ON COLUMN public.monthly_review.review_month IS 'レビュー対象月';
COMMENT ON COLUMN public.monthly_review.status IS '状態';
COMMENT ON COLUMN public.monthly_review.head_office_cost_amount IS '本部費用額';
COMMENT ON COLUMN public.monthly_review.unassigned_ad_spend_amount IS '未割当広告費額';
COMMENT ON COLUMN public.monthly_review.acceptable_ad_investment_rate IS '許容広告投資率';
COMMENT ON COLUMN public.monthly_review.note IS 'メモ';
COMMENT ON COLUMN public.monthly_review.generated_at IS '生成日時';
COMMENT ON COLUMN public.monthly_review.confirmed_at IS '確定日時';
COMMENT ON COLUMN public.monthly_review.created_at IS '作成日時';
COMMENT ON COLUMN public.monthly_review.updated_at IS '更新日時';
COMMENT ON COLUMN public.monthly_review.deleted_at IS '削除日時';

COMMENT ON COLUMN public.monthly_review_location.id IS 'ID';
COMMENT ON COLUMN public.monthly_review_location.company_id IS '会社ID';
COMMENT ON COLUMN public.monthly_review_location.monthly_review_id IS '月次レビューID';
COMMENT ON COLUMN public.monthly_review_location.location_id IS '拠点ID';
COMMENT ON COLUMN public.monthly_review_location.beginning_member_count IS '月初会員数';
COMMENT ON COLUMN public.monthly_review_location.ending_member_count IS '月末会員数';
COMMENT ON COLUMN public.monthly_review_location.new_member_count IS '新規入会数';
COMMENT ON COLUMN public.monthly_review_location.resigned_member_count IS '退会数';
COMMENT ON COLUMN public.monthly_review_location.new_inquiry_count IS '新規問い合わせ数';
COMMENT ON COLUMN public.monthly_review_location.trial_booking_count IS '体験予約数';
COMMENT ON COLUMN public.monthly_review_location.trial_completed_count IS '体験実施数';
COMMENT ON COLUMN public.monthly_review_location.total_revenue IS '総売上';
COMMENT ON COLUMN public.monthly_review_location.membership_revenue IS '月謝売上';
COMMENT ON COLUMN public.monthly_review_location.other_revenue IS 'その他売上';
COMMENT ON COLUMN public.monthly_review_location.average_monthly_fee IS '平均月謝';
COMMENT ON COLUMN public.monthly_review_location.location_ad_spend_amount IS '拠点広告費額';
COMMENT ON COLUMN public.monthly_review_location.variable_cost_amount IS '変動費額';
COMMENT ON COLUMN public.monthly_review_location.fixed_cost_amount IS '固定費額';
COMMENT ON COLUMN public.monthly_review_location.crm_beginning_member_count IS 'CRM算出月初会員数';
COMMENT ON COLUMN public.monthly_review_location.crm_ending_member_count IS 'CRM算出月末会員数';
COMMENT ON COLUMN public.monthly_review_location.crm_new_member_count IS 'CRM算出新規入会数';
COMMENT ON COLUMN public.monthly_review_location.crm_resigned_member_count IS 'CRM算出退会数';
COMMENT ON COLUMN public.monthly_review_location.crm_new_inquiry_count IS 'CRM算出新規問い合わせ数';
COMMENT ON COLUMN public.monthly_review_location.crm_trial_booking_count IS 'CRM算出体験予約数';
COMMENT ON COLUMN public.monthly_review_location.crm_trial_completed_count IS 'CRM算出体験実施数';
COMMENT ON COLUMN public.monthly_review_location.crm_average_monthly_fee IS 'CRM算出平均月謝';
COMMENT ON COLUMN public.monthly_review_location.warnings_json IS '警告JSON';
COMMENT ON COLUMN public.monthly_review_location.created_at IS '作成日時';
COMMENT ON COLUMN public.monthly_review_location.updated_at IS '更新日時';
COMMENT ON COLUMN public.monthly_review_location.deleted_at IS '削除日時';

COMMENT ON COLUMN public.monthly_review_cost.id IS 'ID';
COMMENT ON COLUMN public.monthly_review_cost.company_id IS '会社ID';
COMMENT ON COLUMN public.monthly_review_cost.monthly_review_id IS '月次レビューID';
COMMENT ON COLUMN public.monthly_review_cost.monthly_review_location_id IS '月次レビュー拠点ID';
COMMENT ON COLUMN public.monthly_review_cost.cost_item_id IS '費用項目ID';
COMMENT ON COLUMN public.monthly_review_cost.name IS '費用名';
COMMENT ON COLUMN public.monthly_review_cost.cost_type IS '費用種別';
COMMENT ON COLUMN public.monthly_review_cost.scope IS '費用範囲';
COMMENT ON COLUMN public.monthly_review_cost.calculation_method IS '計算方法';
COMMENT ON COLUMN public.monthly_review_cost.expected_amount IS '見込み金額';
COMMENT ON COLUMN public.monthly_review_cost.actual_amount IS '実績金額';
COMMENT ON COLUMN public.monthly_review_cost.is_overridden IS '手動上書きフラグ';
COMMENT ON COLUMN public.monthly_review_cost.created_at IS '作成日時';
COMMENT ON COLUMN public.monthly_review_cost.updated_at IS '更新日時';
COMMENT ON COLUMN public.monthly_review_cost.deleted_at IS '削除日時';

COMMENT ON COLUMN public.ad_spend.id IS 'ID';
COMMENT ON COLUMN public.ad_spend.company_id IS '会社ID';
COMMENT ON COLUMN public.ad_spend.monthly_review_id IS '月次レビューID';
COMMENT ON COLUMN public.ad_spend.location_id IS '拠点ID';
COMMENT ON COLUMN public.ad_spend.name IS '広告費名';
COMMENT ON COLUMN public.ad_spend.amount IS '金額';
COMMENT ON COLUMN public.ad_spend.source_type IS '入力元種別';
COMMENT ON COLUMN public.ad_spend.note IS 'メモ';
COMMENT ON COLUMN public.ad_spend.created_at IS '作成日時';
COMMENT ON COLUMN public.ad_spend.updated_at IS '更新日時';
COMMENT ON COLUMN public.ad_spend.deleted_at IS '削除日時';

COMMENT ON COLUMN public.monthly_review_snapshot.id IS 'ID';
COMMENT ON COLUMN public.monthly_review_snapshot.company_id IS '会社ID';
COMMENT ON COLUMN public.monthly_review_snapshot.monthly_review_id IS '月次レビューID';
COMMENT ON COLUMN public.monthly_review_snapshot.version IS 'バージョン';
COMMENT ON COLUMN public.monthly_review_snapshot.is_current IS '現行フラグ';
COMMENT ON COLUMN public.monthly_review_snapshot.generated_at IS '生成日時';
COMMENT ON COLUMN public.monthly_review_snapshot.superseded_at IS '差し替え日時';
COMMENT ON COLUMN public.monthly_review_snapshot.generated_by_employee_id IS '生成者従業員ID';
COMMENT ON COLUMN public.monthly_review_snapshot.total_revenue IS '総売上';
COMMENT ON COLUMN public.monthly_review_snapshot.operating_profit IS '営業利益';
COMMENT ON COLUMN public.monthly_review_snapshot.ending_member_count IS '月末会員数';
COMMENT ON COLUMN public.monthly_review_snapshot.new_member_count IS '新規入会数';
COMMENT ON COLUMN public.monthly_review_snapshot.resigned_member_count IS '退会数';
COMMENT ON COLUMN public.monthly_review_snapshot.ad_spend_amount IS '広告費額';
COMMENT ON COLUMN public.monthly_review_snapshot.cpo IS 'CPO';
COMMENT ON COLUMN public.monthly_review_snapshot.marginal_cpo IS '限界CPO';
COMMENT ON COLUMN public.monthly_review_snapshot.summary_json IS 'サマリーJSON';
COMMENT ON COLUMN public.monthly_review_snapshot.kpi_json IS 'KPI JSON';
COMMENT ON COLUMN public.monthly_review_snapshot.pl_json IS 'PL JSON';
COMMENT ON COLUMN public.monthly_review_snapshot.ltv_json IS 'LTV JSON';
COMMENT ON COLUMN public.monthly_review_snapshot.key_success_factors_json IS 'KSF JSON';
COMMENT ON COLUMN public.monthly_review_snapshot.settings_json IS '設定JSON';
COMMENT ON COLUMN public.monthly_review_snapshot.goal_json IS '目標JSON';
COMMENT ON COLUMN public.monthly_review_snapshot.created_at IS '作成日時';
COMMENT ON COLUMN public.monthly_review_snapshot.updated_at IS '更新日時';

COMMENT ON COLUMN public.monthly_review_location_snapshot.id IS 'ID';
COMMENT ON COLUMN public.monthly_review_location_snapshot.company_id IS '会社ID';
COMMENT ON COLUMN public.monthly_review_location_snapshot.monthly_review_snapshot_id IS '月次レビュースナップショットID';
COMMENT ON COLUMN public.monthly_review_location_snapshot.monthly_review_location_id IS '月次レビュー拠点ID';
COMMENT ON COLUMN public.monthly_review_location_snapshot.location_id IS '拠点ID';
COMMENT ON COLUMN public.monthly_review_location_snapshot.total_revenue IS '総売上';
COMMENT ON COLUMN public.monthly_review_location_snapshot.operating_profit IS '営業利益';
COMMENT ON COLUMN public.monthly_review_location_snapshot.ending_member_count IS '月末会員数';
COMMENT ON COLUMN public.monthly_review_location_snapshot.new_member_count IS '新規入会数';
COMMENT ON COLUMN public.monthly_review_location_snapshot.resigned_member_count IS '退会数';
COMMENT ON COLUMN public.monthly_review_location_snapshot.ad_spend_amount IS '広告費額';
COMMENT ON COLUMN public.monthly_review_location_snapshot.cpo IS 'CPO';
COMMENT ON COLUMN public.monthly_review_location_snapshot.marginal_cpo IS '限界CPO';
COMMENT ON COLUMN public.monthly_review_location_snapshot.kpi_json IS 'KPI JSON';
COMMENT ON COLUMN public.monthly_review_location_snapshot.pl_json IS 'PL JSON';
COMMENT ON COLUMN public.monthly_review_location_snapshot.ltv_json IS 'LTV JSON';
COMMENT ON COLUMN public.monthly_review_location_snapshot.issue_json IS '課題JSON';
COMMENT ON COLUMN public.monthly_review_location_snapshot.allocation_json IS '配賦JSON';
COMMENT ON COLUMN public.monthly_review_location_snapshot.created_at IS '作成日時';
COMMENT ON COLUMN public.monthly_review_location_snapshot.updated_at IS '更新日時';
