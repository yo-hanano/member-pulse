--liquibase formatted sql

--changeset codex:jukuops-init-base-2-create-gender
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

--changeset codex:jukuops-init-base-5-create-prefecture
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

--changeset codex:jukuops-init-base-8-create-school-type
CREATE TABLE public.school_type (
  code VARCHAR(8) NOT NULL,
  name VARCHAR(16) NOT NULL,
  sort_order INTEGER NOT NULL,
  CONSTRAINT school_type_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.school_type IS '学校種マスタ';
COMMENT ON COLUMN public.school_type.code IS 'コード';
COMMENT ON COLUMN public.school_type.name IS '学校種';
COMMENT ON COLUMN public.school_type.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.school_type CASCADE;

--changeset codex:jukuops-init-base-9-create-school-grade
CREATE TABLE public.school_grade (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(16) NOT NULL,
  sort_order INTEGER NOT NULL,
  CONSTRAINT school_grade_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.school_grade IS '学年マスタ';
COMMENT ON COLUMN public.school_grade.code IS 'コード';
COMMENT ON COLUMN public.school_grade.name IS '学年';
COMMENT ON COLUMN public.school_grade.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.school_grade CASCADE;

--changeset codex:jukuops-init-base-12-create-schedule-event-type
CREATE TABLE public.schedule_event_type (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(40) NOT NULL,
  sort_order INT NOT NULL,
  CONSTRAINT schedule_event_type_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.schedule_event_type IS '予定種別マスタ';
COMMENT ON COLUMN public.schedule_event_type.code IS 'コード';
COMMENT ON COLUMN public.schedule_event_type.name IS '予定種別';
COMMENT ON COLUMN public.schedule_event_type.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.schedule_event_type CASCADE;

--changeset codex:jukuops-init-base-13-create-schedule-event-status
CREATE TABLE public.schedule_event_status (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(40) NOT NULL,
  sort_order INT NOT NULL,
  CONSTRAINT schedule_event_status_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.schedule_event_status IS '予定ステータスマスタ';
COMMENT ON COLUMN public.schedule_event_status.code IS 'コード';
COMMENT ON COLUMN public.schedule_event_status.name IS '予定ステータス';
COMMENT ON COLUMN public.schedule_event_status.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.schedule_event_status CASCADE;

--changeset codex:jukuops-init-base-14-create-relationship
CREATE TABLE public.relationship (
  code VARCHAR(32) NOT NULL,
  name VARCHAR(40) NOT NULL,
  sort_order INTEGER NOT NULL,
  CONSTRAINT relationship_pkey PRIMARY KEY (code)
);
COMMENT ON TABLE public.relationship IS '続柄マスタ';
COMMENT ON COLUMN public.relationship.code IS 'コード';
COMMENT ON COLUMN public.relationship.name IS '続柄';
COMMENT ON COLUMN public.relationship.sort_order IS '表示順';
--rollback DROP TABLE IF EXISTS public.relationship CASCADE;
