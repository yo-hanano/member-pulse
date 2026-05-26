--liquibase formatted sql

--changeset codex:memberpulse-common-master-1-create-gender
CREATE TABLE public.gender (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(40) NOT NULL,
  sort_order INT NOT NULL,
  CONSTRAINT gender_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.gender IS '性別マスタ';
COMMENT ON COLUMN public.gender.code IS 'コード';
COMMENT ON COLUMN public.gender.name IS '性別';
COMMENT ON COLUMN public.gender.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.gender CASCADE;

--changeset codex:memberpulse-common-master-2-create-prefecture
CREATE TABLE public.prefecture (
  code VARCHAR(21) NOT NULL,
  name VARCHAR(8) NOT NULL,
  sort_order INTEGER NOT NULL,
  CONSTRAINT prefecture_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.prefecture IS '都道府県マスタ';
COMMENT ON COLUMN public.prefecture.code IS 'コード';
COMMENT ON COLUMN public.prefecture.name IS '都道府県名';
COMMENT ON COLUMN public.prefecture.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.prefecture CASCADE;
