--liquibase formatted sql

--changeset codex:member-pulse-add-contracted-lead-status-1
ALTER TABLE public.lead DROP CONSTRAINT ck_lead_status;
ALTER TABLE public.lead
  ADD CONSTRAINT ck_lead_status CHECK (status IN ('new', 'contacted', 'trial_scheduled', 'trial_completed', 'contracted', 'enrolled', 'lost'));
--rollback ALTER TABLE public.lead DROP CONSTRAINT ck_lead_status;
--rollback ALTER TABLE public.lead ADD CONSTRAINT ck_lead_status CHECK (status IN ('new', 'contacted', 'trial_scheduled', 'trial_completed', 'enrolled', 'lost'));
