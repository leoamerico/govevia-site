-- 20260216_122_compliance_shield_rls.sql
-- Objetivo: ativar RLS de forma robusta em TODA tabela public.* que tenha coluna tenant_id,
-- criando policy padrão "tenant_isolation" (USING/WITH CHECK) baseada em GUC app.current_tenant_id.
--
-- Fail-closed: se a GUC não estiver setada, current_setting(..., true) retorna NULL;
-- a comparação tenant_id = NULL resulta em NULL → tratado como FALSE em RLS (zero rows).

DO $$
DECLARE
  r RECORD;
  pol_exists BOOLEAN;
  tenant_udt TEXT;
  using_expr TEXT;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'tenant_id'
  LOOP
    -- Descobre tipo da coluna tenant_id (uuid vs texto)
    SELECT c.udt_name
      INTO tenant_udt
    FROM information_schema.columns c
    WHERE c.table_schema = r.table_schema
      AND c.table_name = r.table_name
      AND c.column_name = 'tenant_id'
    LIMIT 1;

    -- 1) Enable + Force RLS
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.table_schema, r.table_name);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', r.table_schema, r.table_name);

    -- 2) Create policy if not exists
    SELECT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = r.table_schema
        AND tablename  = r.table_name
        AND policyname = 'tenant_isolation'
    ) INTO pol_exists;

    IF NOT pol_exists THEN
      IF tenant_udt = 'uuid' THEN
        using_expr := 'tenant_id = current_setting(''app.current_tenant_id'', true)::uuid';
      ELSE
        using_expr := 'tenant_id::text = current_setting(''app.current_tenant_id'', true)';
      END IF;

      EXECUTE format(
        'CREATE POLICY tenant_isolation ON %I.%I
         USING (%s)
         WITH CHECK (%s)',
        r.table_schema, r.table_name, using_expr, using_expr
      );
    END IF;
  END LOOP;
END $$;

-- Observação operacional:
-- A aplicação DEVE executar `SET LOCAL app.current_tenant_id = '<uuid>'` na MESMA transação/conexão
-- antes de qualquer SELECT/INSERT/UPDATE em tabelas tenant-scoped.
