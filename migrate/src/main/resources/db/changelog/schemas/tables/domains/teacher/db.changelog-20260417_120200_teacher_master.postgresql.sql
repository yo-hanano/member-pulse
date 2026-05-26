--liquibase formatted sql

--changeset codex:jukuops-phase1-main-6-create-teacher
CREATE TABLE public.teacher (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  kana VARCHAR(100) NOT NULL,
  birthday DATE,
  gender_code VARCHAR(32),
  school_code VARCHAR(16),
  school_name VARCHAR(120),
  school_grade_code VARCHAR(32),
  phone VARCHAR(20),
  email VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT teacher_pkey PRIMARY KEY (id)
);
ALTER TABLE public.teacher
  ADD CONSTRAINT teacher_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.teacher
  ADD CONSTRAINT teacher_gender_code_fk FOREIGN KEY (gender_code) REFERENCES public.gender (code);
ALTER TABLE public.teacher
  ADD CONSTRAINT teacher_school_grade_code_fk FOREIGN KEY (school_grade_code) REFERENCES public.school_grade (code);
ALTER TABLE public.teacher
  ADD CONSTRAINT teacher_school_code_fk FOREIGN KEY (school_code) REFERENCES public.school (code);
CREATE INDEX idx_teacher_company_status ON public.teacher (company_id, status);
CREATE INDEX idx_teacher_gender_code ON public.teacher (gender_code);
CREATE INDEX idx_teacher_school_code ON public.teacher (school_code);
CREATE INDEX idx_teacher_school_grade_code ON public.teacher (school_grade_code);
COMMENT ON TABLE public.teacher IS '講師';
COMMENT ON COLUMN public.teacher.id IS 'ID';
COMMENT ON COLUMN public.teacher.company_id IS '会社ID';
COMMENT ON COLUMN public.teacher.code IS '講師NO';
COMMENT ON COLUMN public.teacher.name IS '講師名';
COMMENT ON COLUMN public.teacher.kana IS 'フリガナ';
COMMENT ON COLUMN public.teacher.birthday IS '誕生日';
COMMENT ON COLUMN public.teacher.gender_code IS '性別';
COMMENT ON COLUMN public.teacher.school_code IS '所属学校';
COMMENT ON COLUMN public.teacher.school_name IS '学校名';
COMMENT ON COLUMN public.teacher.school_grade_code IS '学年';
COMMENT ON COLUMN public.teacher.phone IS '電話番号';
COMMENT ON COLUMN public.teacher.email IS 'メールアドレス';
COMMENT ON COLUMN public.teacher.status IS '状態';
COMMENT ON COLUMN public.teacher.note IS '備考';
COMMENT ON COLUMN public.teacher.created_at IS '作成日時';
COMMENT ON COLUMN public.teacher.updated_at IS '更新日時';
COMMENT ON COLUMN public.teacher.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.teacher.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.teacher CASCADE;

--changeset codex:jukuops-phase1-main-7-create-teacher-branch
CREATE TABLE public.teacher_branch (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  teacher_id VARCHAR(21) NOT NULL,
  branch_id VARCHAR(21) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT teacher_branch_pkey PRIMARY KEY (id)
);
ALTER TABLE public.teacher_branch
  ADD CONSTRAINT uq_teacher_branch_company_teacher_branch UNIQUE (company_id, teacher_id, branch_id);
ALTER TABLE public.teacher_branch
  ADD CONSTRAINT teacher_branch_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.teacher_branch
  ADD CONSTRAINT teacher_branch_teacher_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teacher (id);
ALTER TABLE public.teacher_branch
  ADD CONSTRAINT teacher_branch_branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branch (id);
CREATE INDEX idx_teacher_branch_teacher ON public.teacher_branch (teacher_id);
CREATE INDEX idx_teacher_branch_branch ON public.teacher_branch (branch_id);
COMMENT ON TABLE public.teacher_branch IS '講師所属拠点';
COMMENT ON COLUMN public.teacher_branch.id IS 'ID';
COMMENT ON COLUMN public.teacher_branch.company_id IS '会社ID';
COMMENT ON COLUMN public.teacher_branch.teacher_id IS '講師ID';
COMMENT ON COLUMN public.teacher_branch.branch_id IS '拠点ID';
COMMENT ON COLUMN public.teacher_branch.is_primary IS '主所属フラグ';
COMMENT ON COLUMN public.teacher_branch.created_at IS '作成日時';
COMMENT ON COLUMN public.teacher_branch.updated_at IS '更新日時';
COMMENT ON COLUMN public.teacher_branch.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.teacher_branch.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.teacher_branch CASCADE;

--changeset codex:jukuops-phase1-main-8-create-teacher-subject
CREATE TABLE public.teacher_subject (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  teacher_id VARCHAR(21) NOT NULL,
  subject_id VARCHAR(21) NOT NULL,
  proficiency_level VARCHAR(20),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT teacher_subject_pkey PRIMARY KEY (id)
);
ALTER TABLE public.teacher_subject
  ADD CONSTRAINT uq_teacher_subject_company_teacher_subject UNIQUE (company_id, teacher_id, subject_id);
ALTER TABLE public.teacher_subject
  ADD CONSTRAINT teacher_subject_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.teacher_subject
  ADD CONSTRAINT teacher_subject_teacher_id_fk FOREIGN KEY (teacher_id) REFERENCES public.teacher (id);
ALTER TABLE public.teacher_subject
  ADD CONSTRAINT teacher_subject_subject_id_fk FOREIGN KEY (subject_id) REFERENCES public.subject (id);
COMMENT ON TABLE public.teacher_subject IS '講師対応科目';
COMMENT ON COLUMN public.teacher_subject.id IS 'ID';
COMMENT ON COLUMN public.teacher_subject.company_id IS '会社ID';
COMMENT ON COLUMN public.teacher_subject.teacher_id IS '講師ID';
COMMENT ON COLUMN public.teacher_subject.subject_id IS '科目ID';
COMMENT ON COLUMN public.teacher_subject.proficiency_level IS '習熟度';
COMMENT ON COLUMN public.teacher_subject.created_at IS '作成日時';
COMMENT ON COLUMN public.teacher_subject.updated_at IS '更新日時';
COMMENT ON COLUMN public.teacher_subject.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.teacher_subject.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.teacher_subject CASCADE;
