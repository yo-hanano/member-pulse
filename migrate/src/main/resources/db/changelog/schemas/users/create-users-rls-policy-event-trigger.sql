--liquibase formatted sql

-- =========================================================
-- company_user role and automatic RLS setup
--
-- Rules:
--   - Tables with company_id get a company_user RLS policy.
--   - The policy scopes rows by app.current_company_id.
--   - Tables without company_id are treated as global/reference tables.
-- =========================================================

--changeset yo-hanano:users-create-company-role splitStatements:false endDelimiter:$$
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'company_user') THEN
    CREATE USER company_user WITH PASSWORD 'company_user';
  END IF;
END
$$;

--changeset yo-hanano:users-grant-company-role
GRANT USAGE ON SCHEMA public TO company_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO company_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO company_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO company_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO company_user;

--changeset yo-hanano:users-clean-old-triggers splitStatements:false endDelimiter:$$
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'company_enable_rls_on_create') THEN
    DROP EVENT TRIGGER company_enable_rls_on_create;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'users_enable_rls_on_create') THEN
    DROP EVENT TRIGGER users_enable_rls_on_create;
  END IF;
END
$$;

--changeset yo-hanano:users-drop-legacy-functions
DROP FUNCTION IF EXISTS company_auto_rls();
DROP FUNCTION IF EXISTS users_auto_rls();

--changeset yo-hanano:users-create-auto-rls-function splitStatements:false endDelimiter:$$
CREATE OR REPLACE FUNCTION users_auto_rls()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  rec record;
  v_schema text;
  v_table text;
  v_has_company boolean;
  v_policy_name text;
  v_exists boolean;
  idents text[];
BEGIN
  FOR rec IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS')
  LOOP
    idents := parse_ident(rec.object_identity);
    v_schema := CASE
      WHEN array_length(idents, 1) >= 2 THEN idents[1]
      ELSE 'public'
    END;
    v_table := idents[array_length(idents, 1)];

    IF v_schema IS NULL OR v_schema <> 'public' OR v_schema LIKE 'pg_temp%' THEN
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = v_schema
        AND table_name = v_table
        AND column_name = 'company_id'
    ) INTO v_has_company;

    IF NOT v_has_company THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', v_schema, v_table);

    v_policy_name := format('rls_%s_company', v_table);

    SELECT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = v_schema
        AND tablename = v_table
        AND policyname = v_policy_name
    ) INTO v_exists;

    IF NOT v_exists THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I
           TO company_user
           USING (
             current_setting(''app.current_company_id'', true) IS NOT NULL
             AND company_id = current_setting(''app.current_company_id'', true)
           )
           WITH CHECK (
             company_id = current_setting(''app.current_company_id'', true)
           )',
        v_policy_name, v_schema, v_table
      );
    END IF;
  END LOOP;
END
$$;

--changeset yo-hanano:users-create-auto-rls-trigger
CREATE EVENT TRIGGER users_enable_rls_on_create
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS')
EXECUTE FUNCTION users_auto_rls();
