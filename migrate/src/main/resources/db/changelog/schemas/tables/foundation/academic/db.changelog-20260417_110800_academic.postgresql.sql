--liquibase formatted sql

--changeset codex:jukuops-init-base-10-create-school
CREATE TABLE public.school (
  code VARCHAR(16) NOT NULL,
  school_type_code VARCHAR(8) NOT NULL,
  prefecture_code VARCHAR(21) NOT NULL,
  establishment_kbn INTEGER NOT NULL,
  hon_bun_ko INTEGER NOT NULL,
  name VARCHAR(128) NOT NULL,
  address VARCHAR(256) NOT NULL,
  zip_code VARCHAR(16),
  settei_date DATE NOT NULL,
  haishi_date DATE,
  old_chosa_no VARCHAR(16),
  iko_code VARCHAR(16),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT school_pkey PRIMARY KEY (code)
);
ALTER TABLE public.school
  ADD CONSTRAINT school_school_type_code_fk FOREIGN KEY (school_type_code) REFERENCES public.school_type (code);
ALTER TABLE public.school
  ADD CONSTRAINT school_prefecture_code_fk FOREIGN KEY (prefecture_code) REFERENCES public.prefecture (code);
CREATE INDEX idx_school_school_type_code ON public.school (school_type_code);
CREATE INDEX idx_school_prefecture_code ON public.school (prefecture_code);
CREATE INDEX idx_school_name ON public.school (name);
COMMENT ON TABLE public.school IS '学校マスタ';
COMMENT ON COLUMN public.school.code IS '学校コード';
COMMENT ON COLUMN public.school.school_type_code IS '学校種';
COMMENT ON COLUMN public.school.prefecture_code IS '都道府県';
COMMENT ON COLUMN public.school.establishment_kbn IS '設置区分';
COMMENT ON COLUMN public.school.hon_bun_ko IS '本分校区分';
COMMENT ON COLUMN public.school.name IS '学校名';
COMMENT ON COLUMN public.school.address IS '住所';
COMMENT ON COLUMN public.school.zip_code IS '郵便番号';
COMMENT ON COLUMN public.school.settei_date IS '設置日';
COMMENT ON COLUMN public.school.haishi_date IS '廃止日';
COMMENT ON COLUMN public.school.old_chosa_no IS '旧調査番号';
COMMENT ON COLUMN public.school.iko_code IS '移行コード';
COMMENT ON COLUMN public.school.created_at IS '作成日時';
COMMENT ON COLUMN public.school.updated_at IS '更新日時';
COMMENT ON COLUMN public.school.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.school.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.school CASCADE;

--changeset codex:jukuops-init-base-11-create-subject
CREATE TABLE public.subject (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  code VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  school_category VARCHAR(40),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT subject_pkey PRIMARY KEY (id)
);
ALTER TABLE public.subject
  ADD CONSTRAINT subject_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
CREATE INDEX idx_subject_company_name ON public.subject (company_id, name);
COMMENT ON TABLE public.subject IS '科目';
COMMENT ON COLUMN public.subject.id IS 'ID';
COMMENT ON COLUMN public.subject.company_id IS '会社ID';
COMMENT ON COLUMN public.subject.code IS '科目コード';
COMMENT ON COLUMN public.subject.name IS '科目名';
COMMENT ON COLUMN public.subject.school_category IS '学校カテゴリ';
COMMENT ON COLUMN public.subject.is_active IS '有効フラグ';
COMMENT ON COLUMN public.subject.created_at IS '作成日時';
COMMENT ON COLUMN public.subject.updated_at IS '更新日時';
COMMENT ON COLUMN public.subject.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.subject.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.subject CASCADE;
