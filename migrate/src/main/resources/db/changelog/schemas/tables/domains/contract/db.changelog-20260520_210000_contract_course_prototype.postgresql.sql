--liquibase formatted sql

--changeset codex:jukuops-course-prototype-1-extend-contract
ALTER TABLE public.contract
  ADD COLUMN course_type VARCHAR(30) NOT NULL DEFAULT 'regular',
  ADD COLUMN course_plan_name VARCHAR(100),
  ADD COLUMN seat_generation_eligible BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.contract
  ADD CONSTRAINT ck_contract_course_type CHECK (course_type IN ('regular', 'trial', 'seasonal', 'other'));

CREATE INDEX idx_contract_company_student_period ON public.contract (
  company_id,
  student_id,
  contract_start_date,
  contract_end_date
);

COMMENT ON COLUMN public.contract.course_type IS 'コース種別';
COMMENT ON COLUMN public.contract.course_plan_name IS 'コースプラン名';
COMMENT ON COLUMN public.contract.seat_generation_eligible IS '座席展開対象';
--rollback ALTER TABLE public.contract DROP CONSTRAINT IF EXISTS ck_contract_course_type;
--rollback DROP INDEX IF EXISTS public.idx_contract_company_student_period;
--rollback ALTER TABLE public.contract DROP COLUMN IF EXISTS seat_generation_eligible;
--rollback ALTER TABLE public.contract DROP COLUMN IF EXISTS course_plan_name;
--rollback ALTER TABLE public.contract DROP COLUMN IF EXISTS course_type;
