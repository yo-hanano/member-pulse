--liquibase formatted sql

--changeset codex:jukuops-phase1-main-10-create-billing
CREATE TABLE public.billing (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  billing_contact_id VARCHAR(21) NOT NULL,
  contract_id VARCHAR(21),
  billing_month DATE NOT NULL,
  issued_on DATE NOT NULL,
  due_on DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  total_amount BIGINT NOT NULL DEFAULT 0,
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT billing_pkey PRIMARY KEY (id)
);
ALTER TABLE public.billing
  ADD CONSTRAINT billing_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.billing
  ADD CONSTRAINT billing_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
ALTER TABLE public.billing
  ADD CONSTRAINT billing_billing_contact_id_fk FOREIGN KEY (billing_contact_id) REFERENCES public.billing_contact (id);
ALTER TABLE public.billing
  ADD CONSTRAINT billing_contract_id_fk FOREIGN KEY (contract_id) REFERENCES public.contract (id);
CREATE INDEX idx_billing_company_student_month ON public.billing (company_id, student_id, billing_month);
CREATE INDEX idx_billing_billing_contact ON public.billing (billing_contact_id);
COMMENT ON TABLE public.billing IS '請求ヘッダ';
COMMENT ON COLUMN public.billing.id IS 'ID';
COMMENT ON COLUMN public.billing.company_id IS '会社ID';
COMMENT ON COLUMN public.billing.student_id IS '生徒ID';
COMMENT ON COLUMN public.billing.billing_contact_id IS '請求先ID';
COMMENT ON COLUMN public.billing.contract_id IS '契約ID';
COMMENT ON COLUMN public.billing.billing_month IS '請求月';
COMMENT ON COLUMN public.billing.issued_on IS '発行日';
COMMENT ON COLUMN public.billing.due_on IS '支払期限';
COMMENT ON COLUMN public.billing.status IS '状態';
COMMENT ON COLUMN public.billing.total_amount IS '合計金額';
COMMENT ON COLUMN public.billing.note IS '備考';
COMMENT ON COLUMN public.billing.created_at IS '作成日時';
COMMENT ON COLUMN public.billing.updated_at IS '更新日時';
COMMENT ON COLUMN public.billing.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.billing.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.billing CASCADE;

--changeset codex:jukuops-phase1-main-11-create-billing-line
CREATE TABLE public.billing_line (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  billing_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  line_type VARCHAR(30) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price BIGINT NOT NULL DEFAULT 0,
  amount BIGINT NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT billing_line_pkey PRIMARY KEY (id)
);
ALTER TABLE public.billing_line
  ADD CONSTRAINT billing_line_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.billing_line
  ADD CONSTRAINT billing_line_billing_id_fk FOREIGN KEY (billing_id) REFERENCES public.billing (id);
ALTER TABLE public.billing_line
  ADD CONSTRAINT billing_line_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
CREATE INDEX idx_billing_line_billing ON public.billing_line (billing_id);
COMMENT ON TABLE public.billing_line IS '請求明細';
COMMENT ON COLUMN public.billing_line.id IS 'ID';
COMMENT ON COLUMN public.billing_line.company_id IS '会社ID';
COMMENT ON COLUMN public.billing_line.billing_id IS '請求ヘッダID';
COMMENT ON COLUMN public.billing_line.student_id IS '生徒ID';
COMMENT ON COLUMN public.billing_line.line_type IS '明細種別';
COMMENT ON COLUMN public.billing_line.description IS '明細内容';
COMMENT ON COLUMN public.billing_line.quantity IS '数量';
COMMENT ON COLUMN public.billing_line.unit_price IS '単価';
COMMENT ON COLUMN public.billing_line.amount IS '金額';
COMMENT ON COLUMN public.billing_line.sort_order IS '表示順';
COMMENT ON COLUMN public.billing_line.created_at IS '作成日時';
COMMENT ON COLUMN public.billing_line.updated_at IS '更新日時';
COMMENT ON COLUMN public.billing_line.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.billing_line.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.billing_line CASCADE;

--changeset codex:jukuops-phase1-main-12-create-payment
CREATE TABLE public.payment (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  billing_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  received_on DATE NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT payment_pkey PRIMARY KEY (id)
);
ALTER TABLE public.payment
  ADD CONSTRAINT payment_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.payment
  ADD CONSTRAINT payment_billing_id_fk FOREIGN KEY (billing_id) REFERENCES public.billing (id);
ALTER TABLE public.payment
  ADD CONSTRAINT payment_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
CREATE INDEX idx_payment_company_student ON public.payment (company_id, student_id);
COMMENT ON TABLE public.payment IS '入金';
COMMENT ON COLUMN public.payment.id IS 'ID';
COMMENT ON COLUMN public.payment.company_id IS '会社ID';
COMMENT ON COLUMN public.payment.billing_id IS '請求ヘッダID';
COMMENT ON COLUMN public.payment.student_id IS '生徒ID';
COMMENT ON COLUMN public.payment.received_on IS '入金日';
COMMENT ON COLUMN public.payment.amount IS '入金額';
COMMENT ON COLUMN public.payment.payment_method IS '入金方法';
COMMENT ON COLUMN public.payment.status IS '状態';
COMMENT ON COLUMN public.payment.note IS '備考';
COMMENT ON COLUMN public.payment.created_at IS '作成日時';
COMMENT ON COLUMN public.payment.updated_at IS '更新日時';
COMMENT ON COLUMN public.payment.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.payment.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.payment CASCADE;
