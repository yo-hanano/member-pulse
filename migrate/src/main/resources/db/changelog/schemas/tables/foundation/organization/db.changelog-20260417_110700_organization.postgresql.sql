--liquibase formatted sql

--changeset codex:jukuops-init-base-6-create-area
CREATE TABLE public.area (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  disp_order INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT area_pkey PRIMARY KEY (id)
);
ALTER TABLE public.area
  ADD CONSTRAINT area_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
CREATE INDEX idx_area_company_id ON public.area (company_id);
COMMENT ON TABLE public.area IS 'エリア';
COMMENT ON COLUMN public.area.id IS 'ID';
COMMENT ON COLUMN public.area.company_id IS '会社ID';
COMMENT ON COLUMN public.area.name IS 'エリア名';
COMMENT ON COLUMN public.area.disp_order IS '表示順';
COMMENT ON COLUMN public.area.created_at IS '作成日時';
COMMENT ON COLUMN public.area.updated_at IS '更新日時';
COMMENT ON COLUMN public.area.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.area.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.area CASCADE;

--changeset codex:jukuops-init-base-7-create-branch
CREATE TABLE public.branch (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  area_id VARCHAR(21) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  zip_code VARCHAR(8) NOT NULL,
  prefecture_code VARCHAR(21) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT branch_pkey PRIMARY KEY (id)
);
ALTER TABLE public.branch
  ADD CONSTRAINT uq_branch_company_code UNIQUE (company_id, code);
ALTER TABLE public.branch
  ADD CONSTRAINT branch_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.branch
  ADD CONSTRAINT branch_area_id_fk FOREIGN KEY (area_id) REFERENCES public.area (id);
ALTER TABLE public.branch
  ADD CONSTRAINT branch_prefecture_code_fk FOREIGN KEY (prefecture_code) REFERENCES public.prefecture (code);
CREATE INDEX idx_branch_company_id ON public.branch (company_id);
CREATE INDEX idx_branch_area_id ON public.branch (area_id);
COMMENT ON TABLE public.branch IS '拠点・教室';
COMMENT ON COLUMN public.branch.id IS 'ID';
COMMENT ON COLUMN public.branch.company_id IS '会社ID';
COMMENT ON COLUMN public.branch.area_id IS 'エリアID';
COMMENT ON COLUMN public.branch.code IS '拠点コード';
COMMENT ON COLUMN public.branch.name IS '拠点名';
COMMENT ON COLUMN public.branch.zip_code IS '郵便番号';
COMMENT ON COLUMN public.branch.prefecture_code IS '都道府県';
COMMENT ON COLUMN public.branch.address IS '住所';
COMMENT ON COLUMN public.branch.created_at IS '作成日時';
COMMENT ON COLUMN public.branch.updated_at IS '更新日時';
COMMENT ON COLUMN public.branch.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.branch.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.branch CASCADE;
