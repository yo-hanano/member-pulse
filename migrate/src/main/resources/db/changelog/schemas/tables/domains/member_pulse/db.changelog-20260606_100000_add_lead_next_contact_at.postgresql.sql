--liquibase formatted sql

--changeset claude:member-pulse-add-lead-next-contact-at-1
ALTER TABLE public.lead
  ADD COLUMN next_contact_at TIMESTAMP WITHOUT TIME ZONE;
COMMENT ON COLUMN public.lead.next_contact_at IS '次回連絡予定日時';
--rollback ALTER TABLE public.lead DROP COLUMN next_contact_at;
