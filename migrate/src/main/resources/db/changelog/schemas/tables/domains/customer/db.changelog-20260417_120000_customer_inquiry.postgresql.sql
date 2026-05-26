--liquibase formatted sql

--changeset codex:jukuops-phase1-main-1-create-lead
CREATE TABLE public.lead (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  branch_id VARCHAR(21) NOT NULL,
  inquiry_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  student_name VARCHAR(100) NOT NULL,
  student_kana VARCHAR(100),
  guardian_name VARCHAR(100),
  guardian_kana VARCHAR(100),
  school_name VARCHAR(120),
  grade_name VARCHAR(40),
  phone VARCHAR(20),
  email VARCHAR(255),
  channel VARCHAR(40),
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  follow_up_at TIMESTAMP WITHOUT TIME ZONE,
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT lead_pkey PRIMARY KEY (id),
  CONSTRAINT ck_lead_contact_required CHECK (phone IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT ck_lead_considering_follow_up CHECK (status <> 'considering' OR follow_up_at IS NOT NULL)
);
ALTER TABLE public.lead
  ADD CONSTRAINT lead_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.lead
  ADD CONSTRAINT lead_branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branch (id);
CREATE INDEX idx_lead_company_status ON public.lead (company_id, status);
COMMENT ON TABLE public.lead IS 'リード';
COMMENT ON COLUMN public.lead.id IS 'ID';
COMMENT ON COLUMN public.lead.company_id IS '会社ID';
COMMENT ON COLUMN public.lead.branch_id IS '拠点ID';
COMMENT ON COLUMN public.lead.inquiry_at IS '問い合わせ日時';
COMMENT ON COLUMN public.lead.student_name IS '生徒名';
COMMENT ON COLUMN public.lead.student_kana IS '生徒フリガナ';
COMMENT ON COLUMN public.lead.guardian_name IS '保護者名';
COMMENT ON COLUMN public.lead.guardian_kana IS '保護者フリガナ';
COMMENT ON COLUMN public.lead.school_name IS '学校名';
COMMENT ON COLUMN public.lead.grade_name IS '学年';
COMMENT ON COLUMN public.lead.phone IS '電話番号';
COMMENT ON COLUMN public.lead.email IS 'メールアドレス';
COMMENT ON COLUMN public.lead.channel IS '流入経路';
COMMENT ON COLUMN public.lead.status IS '状態';
COMMENT ON COLUMN public.lead.follow_up_at IS '次回フォロー日時';
COMMENT ON COLUMN public.lead.note IS '備考';
COMMENT ON COLUMN public.lead.created_at IS '作成日時';
COMMENT ON COLUMN public.lead.updated_at IS '更新日時';
COMMENT ON COLUMN public.lead.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.lead.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.lead CASCADE;
