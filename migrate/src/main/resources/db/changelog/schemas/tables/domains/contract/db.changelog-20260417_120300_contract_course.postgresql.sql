--liquibase formatted sql

--changeset codex:jukuops-phase1-main-9-create-contract
CREATE TABLE public.contract (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  guardian_id VARCHAR(21),
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  subject_id VARCHAR(21) NOT NULL,
  weekly_lessons INTEGER NOT NULL DEFAULT 1,
  preferred_weekday SMALLINT,
  preferred_start_time TIME WITHOUT TIME ZONE,
  preferred_end_time TIME WITHOUT TIME ZONE,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  monthly_fee BIGINT NOT NULL DEFAULT 0,
  discount_amount BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT contract_pkey PRIMARY KEY (id)
);
ALTER TABLE public.contract
  ADD CONSTRAINT contract_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.contract
  ADD CONSTRAINT contract_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
ALTER TABLE public.contract
  ADD CONSTRAINT contract_guardian_id_fk FOREIGN KEY (guardian_id) REFERENCES public.guardian (id);
ALTER TABLE public.contract
  ADD CONSTRAINT contract_subject_id_fk FOREIGN KEY (subject_id) REFERENCES public.subject (id);
CREATE INDEX idx_contract_company_student_status ON public.contract (company_id, student_id, status);
COMMENT ON TABLE public.contract IS '受講契約';
COMMENT ON COLUMN public.contract.id IS 'ID';
COMMENT ON COLUMN public.contract.company_id IS '会社ID';
COMMENT ON COLUMN public.contract.student_id IS '生徒ID';
COMMENT ON COLUMN public.contract.guardian_id IS '保護者ID';
COMMENT ON COLUMN public.contract.contract_start_date IS '契約開始日';
COMMENT ON COLUMN public.contract.contract_end_date IS '契約終了日';
COMMENT ON COLUMN public.contract.subject_id IS '科目ID';
COMMENT ON COLUMN public.contract.weekly_lessons IS '週コマ数';
COMMENT ON COLUMN public.contract.preferred_weekday IS '希望曜日';
COMMENT ON COLUMN public.contract.preferred_start_time IS '希望開始時刻';
COMMENT ON COLUMN public.contract.preferred_end_time IS '希望終了時刻';
COMMENT ON COLUMN public.contract.billing_cycle IS '請求サイクル';
COMMENT ON COLUMN public.contract.monthly_fee IS '月額';
COMMENT ON COLUMN public.contract.discount_amount IS '割引額';
COMMENT ON COLUMN public.contract.status IS '状態';
COMMENT ON COLUMN public.contract.note IS '備考';
COMMENT ON COLUMN public.contract.created_at IS '作成日時';
COMMENT ON COLUMN public.contract.updated_at IS '更新日時';
COMMENT ON COLUMN public.contract.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.contract.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.contract CASCADE;
