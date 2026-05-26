--liquibase formatted sql

-- =========================================================
-- company_user / student_user ロールと RLS 自動設定
--
-- この changelog の責務:
--   1. company_user / student_user ロール作成
--   2. 既存テーブル・シーケンスへの初期権限付与
--   3. CREATE TABLE 時のイベントトリガーによる RLS / 権限自動設定
--
-- 現行ルール:
--   - company_id を持つテーブル
--       -> company_user 用ポリシーを自動作成
--   - student_id を持つテーブル
--       -> student_user 用ポリシーを自動作成
--   - student テーブル
--       -> company_user は company_id ベース
--       -> student_user は id (主キー) ベースで本人絞り込み
--
-- 補足:
--   - 判定の本体はカラム存在ベース (company_id / student_id)
-- =========================================================

--changeset yo-hanano:users-create-company-role splitStatements:false endDelimiter:$$

-- ---------------------------------------------------------
-- 1. ロール作成と初期権限
-- ---------------------------------------------------------
--
-- company_user の作成
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'company_user') THEN
    -- 本番ではパスワードは別管理推奨
    CREATE USER company_user WITH PASSWORD 'company_user';
  END IF;
END
$$;

--changeset yo-hanano:users-grant-company-role

-- company_user は B2B バックエンド用の DB ロール。
-- public スキーマ配下のテーブル/シーケンスを利用できる前提で権限を付与する。
GRANT USAGE ON SCHEMA public TO company_user;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO company_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO company_user;

-- 以降作成されるテーブル/シーケンスにも自動で付与
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO company_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO company_user;

--changeset yo-hanano:users-create-student-role splitStatements:false endDelimiter:$$
-- student_user の作成
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'student_user') THEN
    CREATE USER student_user WITH PASSWORD 'student_user';
  END IF;
END
$$;

--changeset yo-hanano:users-grant-student-schema

-- student_user は B2C / Expo バックエンド用の DB ロール。
-- スキーマ利用権限のみを先に付与し、実テーブル権限は後続 changeset と
-- CREATE TABLE 時の event trigger で個別に与える。
GRANT USAGE ON SCHEMA public TO student_user;

--changeset yo-hanano:users-grant-existing-student-tables splitStatements:false endDelimiter:$$

-- 既存の student_id を持つテーブルと student テーブルへ student_user 権限を補完する。
DO $$
DECLARE
  r record;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student') THEN
    GRANT SELECT, INSERT, UPDATE ON TABLE public.student TO student_user;
  END IF;

  FOR r IN
    SELECT c.table_name AS tablename
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name  = 'student_id'
    GROUP BY c.table_name
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON TABLE public.%I TO student_user', r.tablename);
  END LOOP;
END
$$;

--changeset yo-hanano:users-clean-old-triggers splitStatements:false endDelimiter:$$

-- ---------------------------------------------------------
-- 2. 旧実装の整理
-- ---------------------------------------------------------
--
-- 旧イベントトリガー/関数を片付けて users_auto_rls に一本化する。
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'company_enable_rls_on_create') THEN
    DROP EVENT TRIGGER company_enable_rls_on_create;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'student_enable_rls_on_create') THEN
    DROP EVENT TRIGGER student_enable_rls_on_create;
  END IF;
END
$$;

--changeset yo-hanano:users-drop-legacy-functions
DROP FUNCTION IF EXISTS company_auto_rls();
DROP FUNCTION IF EXISTS student_auto_rls();

--changeset yo-hanano:users-create-auto-rls-function splitStatements:false endDelimiter:$$

-- ---------------------------------------------------------
-- 3. CREATE TABLE 時の自動 RLS / 権限付与
-- ---------------------------------------------------------
--
-- users_auto_rls() は ddl_command_end の event trigger から呼ばれる。
-- CREATE TABLE / CREATE TABLE AS の直後に、対象テーブルのカラム構成を見て
-- 必要な RLS policy と student_user 権限を補完する。
--
-- 自動判定ルール:
--   - company_id を持つ:
--       company_user 用 policy を作成
--   - student_id を持つ:
--       student_user 用 policy を作成し、SELECT/INSERT/UPDATE を付与
--   - student テーブル:
--       company_id ベースの company_user policy に加えて、
--       id ベースの student_user policy を特例として作成
CREATE OR REPLACE FUNCTION users_auto_rls()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  rec                 record;
  v_schema            text;
  v_table             text;
  v_has_company       boolean;
  v_has_student       boolean;
  v_polname           text;
  v_student_polname   text;
  v_exists            boolean;
  idents              text[];
BEGIN
  -- CREATE TABLE / CREATE TABLE AS のみを対象とする。
  FOR rec IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE','CREATE TABLE AS')
  LOOP
    -- object_identity は "schema.table" 形式
    idents   := parse_ident(rec.object_identity);
    v_schema := CASE
                  WHEN array_length(idents,1) >= 2 THEN idents[1]
                  ELSE 'public'
                END;
    v_table  := idents[array_length(idents,1)];

    -- public 以外や一時スキーマは対象外。
    IF v_schema IS NULL OR v_schema <> 'public' OR v_schema LIKE 'pg_temp%' THEN
      CONTINUE;
    END IF;

    -- RLS 対象判定は命名規約ではなくカラム存在で行う。
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = v_schema
        AND table_name   = v_table
        AND column_name  = 'company_id'
    ) INTO v_has_company;

    -- student_id を持つかどうか
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = v_schema
        AND table_name   = v_table
        AND column_name  = 'student_id'
    ) INTO v_has_student;

    -- company_id を持つテーブルには company_user 用 policy を付与する。
    IF v_has_company THEN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', v_schema, v_table);

      -- company_user は app.current_company_id と一致する行のみ参照・更新可能。
      v_polname := format('rls_%s_company', v_table);

      SELECT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = v_schema
          AND tablename  = v_table
          AND policyname = v_polname
      ) INTO v_exists;

      IF NOT v_exists THEN
        EXECUTE format(
          'CREATE POLICY %I ON %I.%I
             TO company_user
             USING (current_setting(''app.current_company_id'', true) IS NOT NULL AND company_id = current_setting(''app.current_company_id'', true))
             WITH CHECK (company_id = current_setting(''app.current_company_id'', true))',
          v_polname, v_schema, v_table
        );
      END IF;

      -- student テーブルだけは student_user に対して主キー(id)ベースで
      -- 本人レコードだけを見せる特例 policy を付与する。
      IF v_table = 'student' THEN
        EXECUTE format('GRANT SELECT, INSERT, UPDATE ON TABLE %I.%I TO student_user', v_schema, v_table);

        v_student_polname := 'rls_student_by_student_user';

        SELECT EXISTS (
          SELECT 1
          FROM pg_policies
          WHERE schemaname = v_schema
            AND tablename  = v_table
            AND policyname = v_student_polname
        ) INTO v_exists;

        IF NOT v_exists THEN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I
               TO student_user
               USING (current_setting(''app.current_student_id'', true) IS NOT NULL AND id = current_setting(''app.current_student_id'', true))
               WITH CHECK (id = current_setting(''app.current_student_id'', true))',
            v_student_polname, v_schema, v_table
          );
        END IF;
      END IF;
    END IF;

    -- student_id を持つテーブルには student_user 用 policy を付与する。
    -- company_id と student_id を両方持つテーブルでは、両方の policy が作られる。
    IF v_has_student THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE ON TABLE %I.%I TO student_user', v_schema, v_table);

      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', v_schema, v_table);

      v_student_polname := format('rls_%s_student', v_table);

      SELECT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = v_schema
          AND tablename  = v_table
          AND policyname = v_student_polname
      ) INTO v_exists;

      IF NOT v_exists THEN
        EXECUTE format(
          'CREATE POLICY %I ON %I.%I
             TO student_user
             USING (current_setting(''app.current_student_id'', true) IS NOT NULL AND student_id = current_setting(''app.current_student_id'', true))
             WITH CHECK (student_id = current_setting(''app.current_student_id'', true))',
          v_student_polname, v_schema, v_table
        );
      END IF;
    END IF;
  END LOOP;
END
$$;

--changeset yo-hanano:users-create-auto-rls-trigger

-- CREATE TABLE / CREATE TABLE AS 完了時に users_auto_rls() を呼ぶ。
CREATE EVENT TRIGGER users_enable_rls_on_create
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE','CREATE TABLE AS')
EXECUTE FUNCTION users_auto_rls();

-- NOTE (運用イメージ)
--   - B2B バックエンド
--       DB ロール       : company_user
--       セッション変数 : set_config('app.current_company_id', <companyId>, true)
--       見えるデータ   : company_id が一致する行
--
--   - B2C / Expo バックエンド
--       DB ロール       : student_user
--       セッション変数 : set_config('app.current_student_id', <studentId>, true)
--       見えるデータ   : student_id が一致する行
--                        student テーブルは id が一致する本人レコード
--
--   - 共通事項
--       セッション変数未設定時は USING 条件の IS NOT NULL により不可視。
--       CREATE TABLE 時に event trigger が自動で RLS / 権限を補完する。
