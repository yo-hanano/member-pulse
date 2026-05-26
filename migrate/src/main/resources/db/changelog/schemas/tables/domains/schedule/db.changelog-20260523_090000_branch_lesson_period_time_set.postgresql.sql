--liquibase formatted sql

--changeset codex:branch-lesson-period-time-set-1-create-time-set
CREATE TABLE public.branch_lesson_period_time_set (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  branch_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_lesson_period_time_set_pkey PRIMARY KEY (id)
);
ALTER TABLE public.branch_lesson_period_time_set
  ADD CONSTRAINT branch_lesson_period_time_set_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_lesson_period_time_set
  ADD CONSTRAINT branch_lesson_period_time_set_branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branch (id);
CREATE INDEX idx_branch_lesson_period_time_set_company_id ON public.branch_lesson_period_time_set (company_id);
CREATE INDEX idx_branch_lesson_period_time_set_branch_id ON public.branch_lesson_period_time_set (branch_id);
CREATE UNIQUE INDEX uq_branch_lesson_period_time_set_branch_name
  ON public.branch_lesson_period_time_set (branch_id, name) WHERE (is_deleted = false);
COMMENT ON TABLE public.branch_lesson_period_time_set IS '拠点時限時刻セット';
COMMENT ON COLUMN public.branch_lesson_period_time_set.id IS 'ID';
COMMENT ON COLUMN public.branch_lesson_period_time_set.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_lesson_period_time_set.branch_id IS '拠点ID';
COMMENT ON COLUMN public.branch_lesson_period_time_set.name IS '時刻セット名';
COMMENT ON COLUMN public.branch_lesson_period_time_set.note IS '備考';
COMMENT ON COLUMN public.branch_lesson_period_time_set.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_lesson_period_time_set.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_lesson_period_time_set.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_lesson_period_time_set.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_lesson_period_time_set CASCADE;

--changeset codex:branch-lesson-period-time-set-2-create-time
CREATE TABLE public.branch_lesson_period_time (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  time_set_id VARCHAR(21) NOT NULL,
  lesson_period_id VARCHAR(21) NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_lesson_period_time_pkey PRIMARY KEY (id),
  CONSTRAINT branch_lesson_period_time_time_check CHECK (start_time < end_time)
);
ALTER TABLE public.branch_lesson_period_time
  ADD CONSTRAINT branch_lesson_period_time_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch_lesson_period_time
  ADD CONSTRAINT branch_lesson_period_time_set_id_fk FOREIGN KEY (time_set_id) REFERENCES public.branch_lesson_period_time_set (id);
ALTER TABLE public.branch_lesson_period_time
  ADD CONSTRAINT branch_lesson_period_time_lesson_period_id_fk FOREIGN KEY (lesson_period_id) REFERENCES public.lesson_period (id);
ALTER TABLE public.branch_lesson_period_time
  ADD CONSTRAINT uq_branch_lesson_period_time_set_lesson_period UNIQUE (time_set_id, lesson_period_id);
CREATE INDEX idx_branch_lesson_period_time_company_id ON public.branch_lesson_period_time (company_id);
CREATE INDEX idx_branch_lesson_period_time_set_id ON public.branch_lesson_period_time (time_set_id);
CREATE INDEX idx_branch_lesson_period_time_lesson_period_id ON public.branch_lesson_period_time (lesson_period_id);
COMMENT ON TABLE public.branch_lesson_period_time IS '拠点時限時刻';
COMMENT ON COLUMN public.branch_lesson_period_time.id IS 'ID';
COMMENT ON COLUMN public.branch_lesson_period_time.company_id IS '会社ID';
COMMENT ON COLUMN public.branch_lesson_period_time.time_set_id IS '拠点時限時刻セットID';
COMMENT ON COLUMN public.branch_lesson_period_time.lesson_period_id IS '時限ID';
COMMENT ON COLUMN public.branch_lesson_period_time.start_time IS '開始時刻';
COMMENT ON COLUMN public.branch_lesson_period_time.end_time IS '終了時刻';
COMMENT ON COLUMN public.branch_lesson_period_time.created_at IS '作成日時';
COMMENT ON COLUMN public.branch_lesson_period_time.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch_lesson_period_time.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch_lesson_period_time.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch_lesson_period_time CASCADE;

--changeset codex:branch-lesson-period-time-set-3-connect-schedule
ALTER TABLE public.branch_opening_schedule
  ADD COLUMN time_set_id VARCHAR(21);
ALTER TABLE public.branch_opening_schedule
  ADD CONSTRAINT branch_opening_schedule_time_set_id_fk FOREIGN KEY (time_set_id) REFERENCES public.branch_lesson_period_time_set (id);
CREATE INDEX idx_branch_opening_schedule_time_set_id ON public.branch_opening_schedule (time_set_id);
COMMENT ON COLUMN public.branch_opening_schedule.time_set_id IS '拠点時限時刻セットID';
--rollback ALTER TABLE public.branch_opening_schedule DROP COLUMN IF EXISTS time_set_id;

--changeset codex:branch-lesson-period-time-set-4-remove-template-period-time
ALTER TABLE public.branch_opening_schedule_template_period
  DROP CONSTRAINT branch_opening_schedule_template_period_time_check;
ALTER TABLE public.branch_opening_schedule_template_period
  DROP COLUMN start_time,
  DROP COLUMN end_time;
--rollback ALTER TABLE public.branch_opening_schedule_template_period ADD COLUMN start_time TIME WITHOUT TIME ZONE; ALTER TABLE public.branch_opening_schedule_template_period ADD COLUMN end_time TIME WITHOUT TIME ZONE;

--changeset codex:branch-lesson-period-time-set-5-remove-schedule-period-time
ALTER TABLE public.branch_opening_schedule_period
  DROP CONSTRAINT branch_opening_schedule_period_time_check;
ALTER TABLE public.branch_opening_schedule_period
  DROP COLUMN start_time,
  DROP COLUMN end_time;
--rollback ALTER TABLE public.branch_opening_schedule_period ADD COLUMN start_time TIME WITHOUT TIME ZONE; ALTER TABLE public.branch_opening_schedule_period ADD COLUMN end_time TIME WITHOUT TIME ZONE;
