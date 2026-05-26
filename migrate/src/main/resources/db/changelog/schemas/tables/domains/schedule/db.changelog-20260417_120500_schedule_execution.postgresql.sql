--liquibase formatted sql

--changeset codex:jukuops-phase1-main-13-create-schedule-subject
CREATE TABLE public.schedule_subject (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  lead_id VARCHAR(21),
  student_id VARCHAR(21),
  teacher_id VARCHAR(21),
  guardian_id VARCHAR(21),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT schedule_subject_pkey PRIMARY KEY (id),
  CONSTRAINT ck_schedule_subject_one_target CHECK (
    (CASE WHEN lead_id IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN teacher_id IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN guardian_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);
ALTER TABLE public.schedule_subject
  ADD CONSTRAINT schedule_subject_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.schedule_subject
  ADD CONSTRAINT schedule_subject_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.lead (id);
ALTER TABLE public.schedule_subject
  ADD CONSTRAINT schedule_subject_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
ALTER TABLE public.schedule_subject
  ADD CONSTRAINT schedule_subject_teacher_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teacher (id);
ALTER TABLE public.schedule_subject
  ADD CONSTRAINT schedule_subject_guardian_id_fk FOREIGN KEY (guardian_id) REFERENCES public.guardian (id);
CREATE INDEX idx_schedule_subject_company_id ON public.schedule_subject (company_id);
COMMENT ON TABLE public.schedule_subject IS '予定主体';
COMMENT ON COLUMN public.schedule_subject.id IS 'ID';
COMMENT ON COLUMN public.schedule_subject.company_id IS '会社ID';
COMMENT ON COLUMN public.schedule_subject.lead_id IS 'リードID';
COMMENT ON COLUMN public.schedule_subject.student_id IS '生徒ID';
COMMENT ON COLUMN public.schedule_subject.teacher_id IS '講師ID';
COMMENT ON COLUMN public.schedule_subject.guardian_id IS '保護者ID';
COMMENT ON COLUMN public.schedule_subject.created_at IS '作成日時';
COMMENT ON COLUMN public.schedule_subject.updated_at IS '更新日時';
COMMENT ON COLUMN public.schedule_subject.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.schedule_subject.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.schedule_subject CASCADE;

--changeset codex:jukuops-phase1-main-14-create-schedule-event
CREATE TABLE public.schedule_event (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  branch_id VARCHAR(21) NOT NULL,
  schedule_subject_id VARCHAR(21) NOT NULL,
  schedule_type VARCHAR(40) NOT NULL,
  scheduled_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'planned',
  reason VARCHAR(1000),
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT schedule_event_pkey PRIMARY KEY (id),
  CONSTRAINT ck_schedule_event_reason_required CHECK (
    status NOT IN ('rescheduled', 'canceled', 'not_done') OR reason IS NOT NULL
  )
);
ALTER TABLE public.schedule_event
  ADD CONSTRAINT schedule_event_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.schedule_event
  ADD CONSTRAINT schedule_event_branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branch (id);
ALTER TABLE public.schedule_event
  ADD CONSTRAINT schedule_event_subject_id_fk FOREIGN KEY (schedule_subject_id) REFERENCES public.schedule_subject (id);
ALTER TABLE public.schedule_event
  ADD CONSTRAINT schedule_event_schedule_type_fk FOREIGN KEY (schedule_type) REFERENCES public.schedule_event_type (code);
ALTER TABLE public.schedule_event
  ADD CONSTRAINT schedule_event_status_fk FOREIGN KEY (status) REFERENCES public.schedule_event_status (code);
CREATE INDEX idx_schedule_event_company_subject ON public.schedule_event (company_id, schedule_subject_id);
CREATE INDEX idx_schedule_event_company_scheduled_at ON public.schedule_event (company_id, scheduled_at);
COMMENT ON TABLE public.schedule_event IS '予定';
COMMENT ON COLUMN public.schedule_event.id IS 'ID';
COMMENT ON COLUMN public.schedule_event.company_id IS '会社ID';
COMMENT ON COLUMN public.schedule_event.branch_id IS '拠点ID';
COMMENT ON COLUMN public.schedule_event.schedule_subject_id IS '予定主体ID';
COMMENT ON COLUMN public.schedule_event.schedule_type IS '予定種別';
COMMENT ON COLUMN public.schedule_event.scheduled_at IS '予定日時';
COMMENT ON COLUMN public.schedule_event.status IS '状態';
COMMENT ON COLUMN public.schedule_event.reason IS '理由';
COMMENT ON COLUMN public.schedule_event.note IS '備考';
COMMENT ON COLUMN public.schedule_event.created_at IS '作成日時';
COMMENT ON COLUMN public.schedule_event.updated_at IS '更新日時';
COMMENT ON COLUMN public.schedule_event.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.schedule_event.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.schedule_event CASCADE;
