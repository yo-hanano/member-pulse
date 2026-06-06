--liquibase formatted sql

--changeset claude:member-pulse-add-member-zip-code-1
-- 会員の住所を郵便番号付きで管理できるようにする。location.zip_code と同じ形式。
ALTER TABLE public.member
  ADD COLUMN zip_code VARCHAR(8);
COMMENT ON COLUMN public.member.zip_code IS '郵便番号';
--rollback ALTER TABLE public.member DROP COLUMN zip_code;
