--liquibase formatted sql

--changeset codex:jukuops-phase1-main-2-create-student
CREATE TABLE public.student (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  lead_id VARCHAR(21),
  enrollment_date DATE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  kana VARCHAR(100) NOT NULL,
  birthday DATE NOT NULL,
  gender_code VARCHAR(32) NOT NULL,
  school_code VARCHAR(16) NOT NULL,
  school_name VARCHAR(120),
  school_grade_code VARCHAR(32) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT student_pkey PRIMARY KEY (id)
);
ALTER TABLE public.student
  ADD CONSTRAINT student_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.student
  ADD CONSTRAINT student_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.lead (id);
ALTER TABLE public.student
  ADD CONSTRAINT student_gender_code_fk FOREIGN KEY (gender_code) REFERENCES public.gender (code);
ALTER TABLE public.student
  ADD CONSTRAINT student_school_grade_code_fk FOREIGN KEY (school_grade_code) REFERENCES public.school_grade (code);
ALTER TABLE public.student
  ADD CONSTRAINT student_school_code_fk FOREIGN KEY (school_code) REFERENCES public.school (code);
CREATE INDEX idx_student_company_status ON public.student (company_id, status);
CREATE INDEX idx_student_company_code ON public.student (company_id, code);
CREATE INDEX idx_student_gender_code ON public.student (gender_code);
CREATE INDEX idx_student_school_code ON public.student (school_code);
CREATE INDEX idx_student_school_grade_code ON public.student (school_grade_code);
COMMENT ON TABLE public.student IS '生徒';
COMMENT ON COLUMN public.student.id IS 'ID';
COMMENT ON COLUMN public.student.company_id IS '会社ID';
COMMENT ON COLUMN public.student.lead_id IS 'リードID';
COMMENT ON COLUMN public.student.enrollment_date IS '入会日';
COMMENT ON COLUMN public.student.code IS '生徒NO';
COMMENT ON COLUMN public.student.name IS '生徒名';
COMMENT ON COLUMN public.student.kana IS 'フリガナ';
COMMENT ON COLUMN public.student.birthday IS '誕生日';
COMMENT ON COLUMN public.student.gender_code IS '性別';
COMMENT ON COLUMN public.student.school_code IS '所属学校';
COMMENT ON COLUMN public.student.school_name IS '学校名';
COMMENT ON COLUMN public.student.school_grade_code IS '学年';
COMMENT ON COLUMN public.student.status IS '状態';
COMMENT ON COLUMN public.student.note IS '備考';
COMMENT ON COLUMN public.student.created_at IS '作成日時';
COMMENT ON COLUMN public.student.updated_at IS '更新日時';
COMMENT ON COLUMN public.student.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.student.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.student CASCADE;

--changeset codex:jukuops-phase1-main-3-create-guardian
CREATE TABLE public.guardian (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  kana VARCHAR(100) NOT NULL,
  relationship_code VARCHAR(32) NOT NULL,
  prefecture_code VARCHAR(21) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  postal_code VARCHAR(10) NOT NULL,
  address VARCHAR(255) NOT NULL,
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT guardian_pkey PRIMARY KEY (id)
);
ALTER TABLE public.guardian
  ADD CONSTRAINT guardian_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.guardian
  ADD CONSTRAINT guardian_relationship_code_fk FOREIGN KEY (relationship_code) REFERENCES public.relationship (code);
ALTER TABLE public.guardian
  ADD CONSTRAINT guardian_prefecture_code_fk FOREIGN KEY (prefecture_code) REFERENCES public.prefecture (code);
CREATE INDEX idx_guardian_company_name ON public.guardian (company_id, name);
CREATE INDEX idx_guardian_relationship_code ON public.guardian (relationship_code);
CREATE INDEX idx_guardian_prefecture_code ON public.guardian (prefecture_code);
COMMENT ON TABLE public.guardian IS '保護者';
COMMENT ON COLUMN public.guardian.id IS 'ID';
COMMENT ON COLUMN public.guardian.company_id IS '会社ID';
COMMENT ON COLUMN public.guardian.name IS '保護者名';
COMMENT ON COLUMN public.guardian.kana IS 'フリガナ';
COMMENT ON COLUMN public.guardian.relationship_code IS '続柄';
COMMENT ON COLUMN public.guardian.prefecture_code IS '都道府県';
COMMENT ON COLUMN public.guardian.phone IS '電話番号';
COMMENT ON COLUMN public.guardian.email IS 'メールアドレス';
COMMENT ON COLUMN public.guardian.postal_code IS '郵便番号';
COMMENT ON COLUMN public.guardian.address IS '住所';
COMMENT ON COLUMN public.guardian.note IS '備考';
COMMENT ON COLUMN public.guardian.created_at IS '作成日時';
COMMENT ON COLUMN public.guardian.updated_at IS '更新日時';
COMMENT ON COLUMN public.guardian.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.guardian.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.guardian CASCADE;

--changeset codex:jukuops-phase1-main-3b-create-billing-contact
CREATE TABLE public.billing_contact (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  name VARCHAR(100) NOT NULL,
  kana VARCHAR(100) NOT NULL,
  billing_method VARCHAR(30) NOT NULL DEFAULT 'credit_card',
  prefecture_code VARCHAR(21) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  address VARCHAR(255) NOT NULL,
  note VARCHAR(1000),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT billing_contact_pkey PRIMARY KEY (id)
);
ALTER TABLE public.billing_contact
  ADD CONSTRAINT billing_contact_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.billing_contact
  ADD CONSTRAINT billing_contact_prefecture_code_fk FOREIGN KEY (prefecture_code) REFERENCES public.prefecture (code);
CREATE INDEX idx_billing_contact_company_name ON public.billing_contact (company_id, name);
CREATE INDEX idx_billing_contact_prefecture_code ON public.billing_contact (prefecture_code);
COMMENT ON TABLE public.billing_contact IS '請求先';
COMMENT ON COLUMN public.billing_contact.id IS 'ID';
COMMENT ON COLUMN public.billing_contact.company_id IS '会社ID';
COMMENT ON COLUMN public.billing_contact.name IS '請求先名';
COMMENT ON COLUMN public.billing_contact.kana IS 'フリガナ';
COMMENT ON COLUMN public.billing_contact.billing_method IS '請求方法';
COMMENT ON COLUMN public.billing_contact.prefecture_code IS '都道府県';
COMMENT ON COLUMN public.billing_contact.phone IS '電話番号';
COMMENT ON COLUMN public.billing_contact.email IS 'メールアドレス';
COMMENT ON COLUMN public.billing_contact.postal_code IS '郵便番号';
COMMENT ON COLUMN public.billing_contact.address IS '住所';
COMMENT ON COLUMN public.billing_contact.note IS '備考';
COMMENT ON COLUMN public.billing_contact.created_at IS '作成日時';
COMMENT ON COLUMN public.billing_contact.updated_at IS '更新日時';
COMMENT ON COLUMN public.billing_contact.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.billing_contact.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.billing_contact CASCADE;

--changeset codex:jukuops-phase1-main-4-create-student-guardian
CREATE TABLE public.student_guardian (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  guardian_id VARCHAR(21) NOT NULL,
  relationship_code VARCHAR(32) NOT NULL,
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT student_guardian_pkey PRIMARY KEY (id)
);
ALTER TABLE public.student_guardian
  ADD CONSTRAINT uq_student_guardian_company_student_guardian UNIQUE (company_id, student_id, guardian_id);
ALTER TABLE public.student_guardian
  ADD CONSTRAINT student_guardian_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.student_guardian
  ADD CONSTRAINT student_guardian_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
ALTER TABLE public.student_guardian
  ADD CONSTRAINT student_guardian_guardian_id_fk FOREIGN KEY (guardian_id) REFERENCES public.guardian (id);
ALTER TABLE public.student_guardian
  ADD CONSTRAINT student_guardian_relationship_code_fk FOREIGN KEY (relationship_code) REFERENCES public.relationship (code);
CREATE INDEX idx_student_guardian_student ON public.student_guardian (student_id);
CREATE INDEX idx_student_guardian_guardian ON public.student_guardian (guardian_id);
CREATE INDEX idx_student_guardian_relationship_code ON public.student_guardian (relationship_code);
COMMENT ON TABLE public.student_guardian IS '生徒と保護者の紐付け';
COMMENT ON COLUMN public.student_guardian.id IS 'ID';
COMMENT ON COLUMN public.student_guardian.company_id IS '会社ID';
COMMENT ON COLUMN public.student_guardian.student_id IS '生徒ID';
COMMENT ON COLUMN public.student_guardian.guardian_id IS '保護者ID';
COMMENT ON COLUMN public.student_guardian.relationship_code IS '続柄';
COMMENT ON COLUMN public.student_guardian.is_primary_contact IS '主連絡先フラグ';
COMMENT ON COLUMN public.student_guardian.created_at IS '作成日時';
COMMENT ON COLUMN public.student_guardian.updated_at IS '更新日時';
COMMENT ON COLUMN public.student_guardian.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.student_guardian.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.student_guardian CASCADE;

--changeset codex:jukuops-phase1-main-4b-create-student-billing-contact
CREATE TABLE public.student_billing_contact (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  billing_contact_id VARCHAR(21) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT student_billing_contact_pkey PRIMARY KEY (id)
);
ALTER TABLE public.student_billing_contact
  ADD CONSTRAINT uq_student_billing_contact_company_student_contact UNIQUE (company_id, student_id, billing_contact_id);
ALTER TABLE public.student_billing_contact
  ADD CONSTRAINT student_billing_contact_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.student_billing_contact
  ADD CONSTRAINT student_billing_contact_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
ALTER TABLE public.student_billing_contact
  ADD CONSTRAINT student_billing_contact_billing_contact_id_fk FOREIGN KEY (billing_contact_id) REFERENCES public.billing_contact (id);
CREATE INDEX idx_student_billing_contact_student ON public.student_billing_contact (student_id);
CREATE INDEX idx_student_billing_contact_contact ON public.student_billing_contact (billing_contact_id);
COMMENT ON TABLE public.student_billing_contact IS '生徒と請求先の紐付け';
COMMENT ON COLUMN public.student_billing_contact.id IS 'ID';
COMMENT ON COLUMN public.student_billing_contact.company_id IS '会社ID';
COMMENT ON COLUMN public.student_billing_contact.student_id IS '生徒ID';
COMMENT ON COLUMN public.student_billing_contact.billing_contact_id IS '請求先ID';
COMMENT ON COLUMN public.student_billing_contact.is_primary IS '主請求先フラグ';
COMMENT ON COLUMN public.student_billing_contact.created_at IS '作成日時';
COMMENT ON COLUMN public.student_billing_contact.updated_at IS '更新日時';
COMMENT ON COLUMN public.student_billing_contact.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.student_billing_contact.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.student_billing_contact CASCADE;

--changeset codex:jukuops-phase1-main-5-create-student-branch
CREATE TABLE public.student_branch (
  id VARCHAR(21) NOT NULL,
  company_id VARCHAR(21) NOT NULL,
  student_id VARCHAR(21) NOT NULL,
  branch_id VARCHAR(21) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT student_branch_pkey PRIMARY KEY (id)
);
ALTER TABLE public.student_branch
  ADD CONSTRAINT uq_student_branch_company_student_branch UNIQUE (company_id, student_id, branch_id);
ALTER TABLE public.student_branch
  ADD CONSTRAINT student_branch_company_id_fk FOREIGN KEY (company_id) REFERENCES public.company (id);
ALTER TABLE public.student_branch
  ADD CONSTRAINT student_branch_student_id_fk FOREIGN KEY (student_id) REFERENCES public.student (id);
ALTER TABLE public.student_branch
  ADD CONSTRAINT student_branch_branch_id_fk FOREIGN KEY (branch_id) REFERENCES public.branch (id);
CREATE INDEX idx_student_branch_student ON public.student_branch (student_id);
CREATE INDEX idx_student_branch_branch ON public.student_branch (branch_id);
COMMENT ON TABLE public.student_branch IS '生徒所属拠点';
COMMENT ON COLUMN public.student_branch.id IS 'ID';
COMMENT ON COLUMN public.student_branch.company_id IS '会社ID';
COMMENT ON COLUMN public.student_branch.student_id IS '生徒ID';
COMMENT ON COLUMN public.student_branch.branch_id IS '拠点ID';
COMMENT ON COLUMN public.student_branch.is_primary IS '主所属フラグ';
COMMENT ON COLUMN public.student_branch.created_at IS '作成日時';
COMMENT ON COLUMN public.student_branch.updated_at IS '更新日時';
COMMENT ON COLUMN public.student_branch.is_deleted IS '削除フラグ';
COMMENT ON COLUMN public.student_branch.deleted_at IS '削除日時';
--rollback DROP TABLE IF EXISTS public.student_branch CASCADE;
