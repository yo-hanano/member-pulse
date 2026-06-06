--liquibase formatted sql

--changeset claude:member-pulse-add-member-prefecture-code-1
-- 会員の住所を拠点と同じ構造（郵便番号・都道府県・住所）で管理する。
ALTER TABLE public.member
  ADD COLUMN prefecture_code VARCHAR(21);
ALTER TABLE public.member
  ADD CONSTRAINT member_prefecture_code_fk FOREIGN KEY (prefecture_code) REFERENCES public.prefecture (code);
CREATE INDEX ix_member_prefecture_code ON public.member (prefecture_code);
COMMENT ON COLUMN public.member.prefecture_code IS '都道府県コード';
--rollback DROP INDEX ix_member_prefecture_code;
--rollback ALTER TABLE public.member DROP CONSTRAINT member_prefecture_code_fk;
--rollback ALTER TABLE public.member DROP COLUMN prefecture_code;
