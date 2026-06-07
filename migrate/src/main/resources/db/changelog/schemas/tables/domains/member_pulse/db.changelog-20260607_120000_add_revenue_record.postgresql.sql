--liquibase formatted sql

--changeset claude:member-pulse-add-revenue-record-1
-- 売上台帳。月謝は契約から自動生成（source_type=auto）、入会金・物販・その他は手入力する。
-- 月次レビューの売上参考値の供給源とする（手入力値が最終的な正である構造は維持）。
CREATE TABLE public.revenue_record (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  location_id VARCHAR(21),
  member_id VARCHAR(21),
  membership_subscription_id VARCHAR(21),
  revenue_date DATE NOT NULL,
  revenue_type VARCHAR(40) NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  source_type VARCHAR(40) NOT NULL DEFAULT 'manual',
  note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT revenue_record_pkey PRIMARY KEY (id),
  CONSTRAINT revenue_record_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id),
  CONSTRAINT revenue_record_location_id_fk FOREIGN KEY (location_id) REFERENCES public.location (id),
  CONSTRAINT revenue_record_member_id_fk FOREIGN KEY (member_id) REFERENCES public.member (id),
  CONSTRAINT revenue_record_subscription_id_fk FOREIGN KEY (membership_subscription_id) REFERENCES public.membership_subscription (id),
  CONSTRAINT ck_revenue_record_revenue_type CHECK (revenue_type IN ('membership_fee', 'enrollment_fee', 'goods', 'other')),
  CONSTRAINT ck_revenue_record_source_type CHECK (source_type IN ('manual', 'auto'))
);
CREATE INDEX ix_revenue_record_company_id ON public.revenue_record (company_id);
CREATE INDEX ix_revenue_record_location_id ON public.revenue_record (location_id);
CREATE INDEX ix_revenue_record_member_id ON public.revenue_record (member_id);
CREATE INDEX ix_revenue_record_revenue_date ON public.revenue_record (revenue_date);
-- 自動生成の月謝は「契約 × 対象月（revenue_date は月初日）」で1件に保ち、再生成しても重複しない。
CREATE UNIQUE INDEX ux_revenue_record_auto_subscription_month
  ON public.revenue_record (membership_subscription_id, revenue_date)
  WHERE source_type = 'auto' AND deleted_at IS NULL;

COMMENT ON TABLE public.revenue_record IS '売上台帳';
COMMENT ON COLUMN public.revenue_record.id IS 'ID';
COMMENT ON COLUMN public.revenue_record.company_id IS '会社ID';
COMMENT ON COLUMN public.revenue_record.location_id IS '拠点ID';
COMMENT ON COLUMN public.revenue_record.member_id IS '会員ID';
COMMENT ON COLUMN public.revenue_record.membership_subscription_id IS 'コース契約ID（自動生成月謝の生成元）';
COMMENT ON COLUMN public.revenue_record.revenue_date IS '売上日（自動生成月謝は対象月の月初日）';
COMMENT ON COLUMN public.revenue_record.revenue_type IS '売上種別';
COMMENT ON COLUMN public.revenue_record.amount IS '金額';
COMMENT ON COLUMN public.revenue_record.source_type IS '入力元（manual=手入力 / auto=契約から自動生成）';
COMMENT ON COLUMN public.revenue_record.note IS 'メモ';
COMMENT ON COLUMN public.revenue_record.created_at IS '作成日時';
COMMENT ON COLUMN public.revenue_record.updated_at IS '更新日時';
COMMENT ON COLUMN public.revenue_record.deleted_at IS '削除日時';
--rollback DROP TABLE public.revenue_record;
