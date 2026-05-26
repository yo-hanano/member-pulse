--liquibase formatted sql

--changeset codex:jukuops-maintenance-alter-placeholder-1
-- maintenance/alter 用のプレースホルダ。
-- 領域横断の補正や最後に回す必要がある変更だけをここへ積む。
--rollback SELECT 1;
