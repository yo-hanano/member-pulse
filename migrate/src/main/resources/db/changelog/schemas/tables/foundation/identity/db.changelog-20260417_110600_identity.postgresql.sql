--liquibase formatted sql

--changeset codex:jukuops-init-base-1-create-company
CREATE TABLE public.company (
  id VARCHAR(21) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT company_pkey PRIMARY KEY (id),
  CONSTRAINT uq_company_code UNIQUE (code)
);
COMMENT ON TABLE public.company IS '塾運営会社';
COMMENT ON COLUMN public.company.id IS 'ID';
COMMENT ON COLUMN public.company.code IS '会社コード';
COMMENT ON COLUMN public.company.name IS '会社名';
COMMENT ON COLUMN public.company.status IS '状態';
COMMENT ON COLUMN public.company.created_at IS '作成日時';
COMMENT ON COLUMN public.company.updated_at IS '更新日時';
COMMENT ON COLUMN public.company.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.company.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.company CASCADE;

--changeset codex:jukuops-init-base-3-create-employee
CREATE TABLE public.employee (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  gender_code VARCHAR(32),
  password VARCHAR(255),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'invited',
  password_set_at TIMESTAMP WITHOUT TIME ZONE,
  last_login_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT employee_pkey PRIMARY KEY (id)
);
ALTER TABLE public.employee
  ADD CONSTRAINT uq_employee_company_email UNIQUE (company_id, email);
ALTER TABLE public.employee
  ADD CONSTRAINT employee_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.employee
  ADD CONSTRAINT employee_gender_code_fk FOREIGN KEY (gender_code) REFERENCES public.gender (code);
CREATE INDEX idx_employee_company_id ON public.employee (company_id);
CREATE INDEX idx_employee_gender_code ON public.employee (gender_code);
COMMENT ON TABLE public.employee IS '管理画面ログイン用ユーザー';
COMMENT ON COLUMN public.employee.id IS 'ID';
COMMENT ON COLUMN public.employee.company_id IS '会社ID';
COMMENT ON COLUMN public.employee.name IS '氏名';
COMMENT ON COLUMN public.employee.email IS 'メールアドレス';
COMMENT ON COLUMN public.employee.gender_code IS '性別';
COMMENT ON COLUMN public.employee.password IS 'パスワードハッシュ';
COMMENT ON COLUMN public.employee.is_admin IS '管理者フラグ';
COMMENT ON COLUMN public.employee.status IS '状態';
COMMENT ON COLUMN public.employee.password_set_at IS 'パスワード設定日時';
COMMENT ON COLUMN public.employee.last_login_at IS '最終ログイン日時';
COMMENT ON COLUMN public.employee.created_at IS '作成日時';
COMMENT ON COLUMN public.employee.updated_at IS '更新日時';
COMMENT ON COLUMN public.employee.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.employee.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.employee CASCADE;

--changeset codex:jukuops-init-base-4-create-employee-token
CREATE TABLE public.employee_token (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  employee_id VARCHAR(21) NOT NULL,
  employee_company_id VARCHAR(21),
  type VARCHAR(30) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_by_employee_id VARCHAR(21),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT employee_token_pkey PRIMARY KEY (id)
);
ALTER TABLE public.employee_token
  ADD CONSTRAINT employee_token_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.employee_token
  ADD CONSTRAINT employee_token_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employee (id);
ALTER TABLE public.employee_token
  ADD CONSTRAINT employee_token_created_by_employee_id_fk FOREIGN KEY (created_by_employee_id) REFERENCES public.employee (id);
CREATE UNIQUE INDEX ux_employee_token_token_hash ON public.employee_token (token_hash);
CREATE INDEX ix_employee_token_employee_type ON public.employee_token (employee_id, type, created_at);
CREATE INDEX ix_employee_token_expires_at ON public.employee_token (expires_at);
COMMENT ON TABLE public.employee_token IS '従業員招待・パスワード再設定トークン';
COMMENT ON COLUMN public.employee_token.id IS 'ID';
COMMENT ON COLUMN public.employee_token.company_id IS '会社ID';
COMMENT ON COLUMN public.employee_token.employee_id IS '従業員ID';
COMMENT ON COLUMN public.employee_token.employee_company_id IS '従業員会社ID';
COMMENT ON COLUMN public.employee_token.type IS 'トークン種別';
COMMENT ON COLUMN public.employee_token.token_hash IS 'トークンハッシュ';
COMMENT ON COLUMN public.employee_token.expires_at IS '有効期限';
COMMENT ON COLUMN public.employee_token.used_at IS '使用日時';
COMMENT ON COLUMN public.employee_token.revoked_at IS '失効日時';
COMMENT ON COLUMN public.employee_token.created_by_employee_id IS '作成者従業員ID';
COMMENT ON COLUMN public.employee_token.created_at IS '作成日時';
COMMENT ON COLUMN public.employee_token.updated_at IS '更新日時';
--rollback DROP TABLE IF EXISTS public.employee_token CASCADE;
