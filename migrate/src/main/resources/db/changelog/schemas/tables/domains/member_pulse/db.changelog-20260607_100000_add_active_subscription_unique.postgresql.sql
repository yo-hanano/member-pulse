--liquibase formatted sql

--changeset claude:member-pulse-add-active-subscription-unique-1
-- 1会員1契約の方針を DB で担保する。終了済み・論理削除済みを除き、会員ごとにアクティブ契約は1件のみ。
CREATE UNIQUE INDEX ux_membership_subscription_active_member
  ON public.membership_subscription (member_id)
  WHERE status != 'ended' AND deleted_at IS NULL;
--rollback DROP INDEX ux_membership_subscription_active_member;
