--liquibase formatted sql

--changeset claude:member-pulse-rework-lead-failure-statuses-1
-- 連絡済み(contacted)を廃止し、不通(unreachable)と体験前の失敗(canceled)を導入する。
-- キャンセル = 体験前の失敗（再予約で復帰可能）、不成約(lost) = 体験後の失敗（終端）。
UPDATE public.lead SET status = 'new' WHERE status = 'contacted';
ALTER TABLE public.lead DROP CONSTRAINT ck_lead_status;
ALTER TABLE public.lead
  ADD CONSTRAINT ck_lead_status CHECK (status IN ('new', 'unreachable', 'trial_scheduled', 'trial_completed', 'canceled', 'contracted', 'enrolled', 'lost'));
--rollback ALTER TABLE public.lead DROP CONSTRAINT ck_lead_status;
--rollback ALTER TABLE public.lead ADD CONSTRAINT ck_lead_status CHECK (status IN ('new', 'contacted', 'trial_scheduled', 'trial_completed', 'contracted', 'enrolled', 'lost'));
