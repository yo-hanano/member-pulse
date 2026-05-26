--liquibase formatted sql

--changeset codex:lesson-period-opening-schedule-1-create-lesson-period
CREATE TABLE public.lesson_period (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  disp_order INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT lesson_period_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_period_disp_order_check CHECK (disp_order > 0)
);
ALTER TABLE public.lesson_period
  ADD CONSTRAINT lesson_period_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
CREATE INDEX idx_lesson_period_company_id ON public.lesson_period (company_id);
CREATE UNIQUE INDEX uq_lesson_period_company_disp_order
  ON public.lesson_period (company_id, disp_order) WHERE (is_deleted = false);
COMMENT ON TABLE public.lesson_period IS '時限マスタ';
COMMENT ON COLUMN public.lesson_period.id IS 'ID';
COMMENT ON COLUMN public.lesson_period.company_id IS '会社ID';
COMMENT ON COLUMN public.lesson_period.name IS '表示名';
COMMENT ON COLUMN public.lesson_period.disp_order IS '表示順';
COMMENT ON COLUMN public.lesson_period.created_at IS '作成日時';
COMMENT ON COLUMN public.lesson_period.updated_at IS '更新日時';
COMMENT ON COLUMN public.lesson_period.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.lesson_period.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.lesson_period CASCADE;

--changeset codex:lesson-period-opening-schedule-2-create-opening-template
CREATE TABLE public.branch_opening_schedule_template (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_opening_schedule_template_pkey PRIMARY KEY (id)
);
ALTER TABLE public.branch_opening_schedule_template
  ADD CONSTRAINT branch_opening_schedule_template_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
CREATE INDEX idx_branch_opening_schedule_template_company_id
  ON public.branch_opening_schedule_template (company_id);
CREATE UNIQUE INDEX uq_branch_opening_schedule_template_company_name
  ON public.branch_opening_schedule_template (company_id, name) WHERE (is_deleted = false);
COMMENT ON TABLE public.branch_opening_schedule_template IS '拠点開校スケジュールテンプレート';
COMMENT ON COLUMN public.branch_opening_schedule_template.id IS 'ID';
COMMENT ON COLUMN public.branch_opening_schedule_template.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_opening_schedule_template.name IS 'テンプレート名';
COMMENT ON COLUMN public.branch_opening_schedule_template.note IS '備考';
COMMENT ON COLUMN public.branch_opening_schedule_template.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_opening_schedule_template.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_opening_schedule_template.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_template.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_opening_schedule_template CASCADE;

--changeset codex:lesson-period-opening-schedule-3-create-opening-template-day
CREATE TABLE public.branch_opening_schedule_template_day (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  template_id VARCHAR(21) NOT NULL,
  weekday SMALLINT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_opening_schedule_template_day_pkey PRIMARY KEY (id),
  CONSTRAINT branch_opening_schedule_template_day_weekday_check CHECK (weekday BETWEEN 0 AND 6)
);
ALTER TABLE public.branch_opening_schedule_template_day
  ADD CONSTRAINT branch_opening_schedule_template_day_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_opening_schedule_template_day
  ADD CONSTRAINT branch_opening_schedule_template_day_template_id_fk FOREIGN KEY (template_id) REFERENCES public.branch_opening_schedule_template (id);
ALTER TABLE public.branch_opening_schedule_template_day
  ADD CONSTRAINT uq_branch_opening_schedule_template_day_weekday UNIQUE (template_id, weekday);
CREATE INDEX idx_branch_opening_schedule_template_day_company_id
  ON public.branch_opening_schedule_template_day (company_id);
CREATE INDEX idx_branch_opening_schedule_template_day_template_id
  ON public.branch_opening_schedule_template_day (template_id);
COMMENT ON TABLE public.branch_opening_schedule_template_day IS '拠点開校スケジュールテンプレート曜日';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.id IS 'ID';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.template_id IS 'テンプレートID';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.weekday IS '曜日';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.is_open IS '開校フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_template_day.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_opening_schedule_template_day CASCADE;

--changeset codex:lesson-period-opening-schedule-4-create-opening-template-period
CREATE TABLE public.branch_opening_schedule_template_period (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  template_day_id VARCHAR(21) NOT NULL,
  lesson_period_id VARCHAR(21) NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_opening_schedule_template_period_pkey PRIMARY KEY (id),
  CONSTRAINT branch_opening_schedule_template_period_time_check CHECK (start_time < end_time)
);
ALTER TABLE public.branch_opening_schedule_template_period
  ADD CONSTRAINT branch_opening_schedule_template_period_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_opening_schedule_template_period
  ADD CONSTRAINT branch_opening_schedule_template_period_day_id_fk FOREIGN KEY (template_day_id) REFERENCES public.branch_opening_schedule_template_day (id);
ALTER TABLE public.branch_opening_schedule_template_period
  ADD CONSTRAINT branch_opening_schedule_template_period_lesson_period_id_fk FOREIGN KEY (lesson_period_id) REFERENCES public.lesson_period (id);
ALTER TABLE public.branch_opening_schedule_template_period
  ADD CONSTRAINT uq_branch_opening_schedule_template_period_day_lesson_period UNIQUE (template_day_id, lesson_period_id);
CREATE INDEX idx_branch_opening_schedule_template_period_company_id
  ON public.branch_opening_schedule_template_period (company_id);
CREATE INDEX idx_branch_opening_schedule_template_period_day_id
  ON public.branch_opening_schedule_template_period (template_day_id);
CREATE INDEX idx_branch_opening_schedule_template_period_lesson_period_id
  ON public.branch_opening_schedule_template_period (lesson_period_id);
COMMENT ON TABLE public.branch_opening_schedule_template_period IS '拠点開校スケジュールテンプレート時限';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.id IS 'ID';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.template_day_id IS 'テンプレート曜日ID';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.lesson_period_id IS '時限ID';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.start_time IS '開始時刻';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.end_time IS '終了時刻';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_template_period.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_opening_schedule_template_period CASCADE;

--changeset codex:lesson-period-opening-schedule-5-create-branch-opening-schedule
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE public.branch_opening_schedule (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  branch_id VARCHAR(21) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_opening_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT branch_opening_schedule_effective_period_check CHECK (effective_to IS NULL OR effective_from <= effective_to)
);
ALTER TABLE public.branch_opening_schedule
  ADD CONSTRAINT branch_opening_schedule_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_opening_schedule
  ADD CONSTRAINT branch_opening_schedule_branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branch (id);
ALTER TABLE public.branch_opening_schedule
  ADD CONSTRAINT ex_branch_opening_schedule_branch_effective_period
  EXCLUDE USING gist (
    branch_id WITH =,
    daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
  ) WHERE (is_deleted = false);
CREATE INDEX idx_branch_opening_schedule_company_id ON public.branch_opening_schedule (company_id);
CREATE INDEX idx_branch_opening_schedule_branch_id ON public.branch_opening_schedule (branch_id);
COMMENT ON TABLE public.branch_opening_schedule IS '拠点通常開校スケジュール';
COMMENT ON COLUMN public.branch_opening_schedule.id IS 'ID';
COMMENT ON COLUMN public.branch_opening_schedule.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_opening_schedule.branch_id IS '拠点ID';
COMMENT ON COLUMN public.branch_opening_schedule.effective_from IS '適用開始日';
COMMENT ON COLUMN public.branch_opening_schedule.effective_to IS '適用終了日';
COMMENT ON COLUMN public.branch_opening_schedule.note IS '備考';
COMMENT ON COLUMN public.branch_opening_schedule.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_opening_schedule.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_opening_schedule.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_opening_schedule.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_opening_schedule CASCADE;

--changeset codex:lesson-period-opening-schedule-6-create-branch-opening-schedule-day
CREATE TABLE public.branch_opening_schedule_day (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  branch_opening_schedule_id VARCHAR(21) NOT NULL,
  weekday SMALLINT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_opening_schedule_day_pkey PRIMARY KEY (id),
  CONSTRAINT branch_opening_schedule_day_weekday_check CHECK (weekday BETWEEN 0 AND 6)
);
ALTER TABLE public.branch_opening_schedule_day
  ADD CONSTRAINT branch_opening_schedule_day_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_opening_schedule_day
  ADD CONSTRAINT branch_opening_schedule_day_schedule_id_fk FOREIGN KEY (branch_opening_schedule_id) REFERENCES public.branch_opening_schedule (id);
ALTER TABLE public.branch_opening_schedule_day
  ADD CONSTRAINT uq_branch_opening_schedule_day_weekday UNIQUE (branch_opening_schedule_id, weekday);
CREATE INDEX idx_branch_opening_schedule_day_company_id ON public.branch_opening_schedule_day (company_id);
CREATE INDEX idx_branch_opening_schedule_day_schedule_id ON public.branch_opening_schedule_day (branch_opening_schedule_id);
COMMENT ON TABLE public.branch_opening_schedule_day IS '拠点通常開校曜日';
COMMENT ON COLUMN public.branch_opening_schedule_day.id IS 'ID';
COMMENT ON COLUMN public.branch_opening_schedule_day.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_opening_schedule_day.branch_opening_schedule_id IS '拠点通常開校スケジュールID';
COMMENT ON COLUMN public.branch_opening_schedule_day.weekday IS '曜日';
COMMENT ON COLUMN public.branch_opening_schedule_day.is_open IS '開校フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_day.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_opening_schedule_day.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_opening_schedule_day.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_day.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_opening_schedule_day CASCADE;

--changeset codex:lesson-period-opening-schedule-7-create-branch-opening-schedule-period
CREATE TABLE public.branch_opening_schedule_period (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  branch_opening_schedule_day_id VARCHAR(21) NOT NULL,
  lesson_period_id VARCHAR(21) NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_opening_schedule_period_pkey PRIMARY KEY (id),
  CONSTRAINT branch_opening_schedule_period_time_check CHECK (start_time < end_time)
);
ALTER TABLE public.branch_opening_schedule_period
  ADD CONSTRAINT branch_opening_schedule_period_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_opening_schedule_period
  ADD CONSTRAINT branch_opening_schedule_period_day_id_fk FOREIGN KEY (branch_opening_schedule_day_id) REFERENCES public.branch_opening_schedule_day (id);
ALTER TABLE public.branch_opening_schedule_period
  ADD CONSTRAINT branch_opening_schedule_period_lesson_period_id_fk FOREIGN KEY (lesson_period_id) REFERENCES public.lesson_period (id);
ALTER TABLE public.branch_opening_schedule_period
  ADD CONSTRAINT uq_branch_opening_schedule_period_day_lesson_period UNIQUE (branch_opening_schedule_day_id, lesson_period_id);
CREATE INDEX idx_branch_opening_schedule_period_company_id ON public.branch_opening_schedule_period (company_id);
CREATE INDEX idx_branch_opening_schedule_period_day_id ON public.branch_opening_schedule_period (branch_opening_schedule_day_id);
CREATE INDEX idx_branch_opening_schedule_period_lesson_period_id ON public.branch_opening_schedule_period (lesson_period_id);
COMMENT ON TABLE public.branch_opening_schedule_period IS '拠点通常開校時限';
COMMENT ON COLUMN public.branch_opening_schedule_period.id IS 'ID';
COMMENT ON COLUMN public.branch_opening_schedule_period.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_opening_schedule_period.branch_opening_schedule_day_id IS '拠点通常開校曜日ID';
COMMENT ON COLUMN public.branch_opening_schedule_period.lesson_period_id IS '時限ID';
COMMENT ON COLUMN public.branch_opening_schedule_period.start_time IS '開始時刻';
COMMENT ON COLUMN public.branch_opening_schedule_period.end_time IS '終了時刻';
COMMENT ON COLUMN public.branch_opening_schedule_period.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_opening_schedule_period.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_opening_schedule_period.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_opening_schedule_period.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_opening_schedule_period CASCADE;
