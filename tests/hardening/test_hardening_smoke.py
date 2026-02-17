from __future__ import annotations

import os
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


def _pg_dsn() -> str | None:
    # Decisão fixa: o smoke roda apenas quando HARDENING_PG_DSN estiver definido.
    return os.getenv("HARDENING_PG_DSN")


@pytest.mark.asyncio
async def test_hardening_smoke_rls_and_hashchain() -> None:
    dsn = _pg_dsn()
    if not dsn:
        pytest.skip("HARDENING_PG_DSN not set; skipping Postgres hardening smoke test")

    engine: AsyncEngine = create_async_engine(dsn, pool_pre_ping=True)

    try:
        # 1) Confirma audit_events existe + trigger de imutabilidade funciona + hashchain preenche hashes
        async with engine.begin() as conn:
            exists = await conn.scalar(
                text(
                    "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
                    "WHERE table_schema='public' AND table_name='audit_events')"
                )
            )
            assert exists is True

        tenant_id = uuid4()

        async with engine.begin() as conn:
            await conn.execute(text("SET LOCAL app.current_tenant_id = :t"), {"t": str(tenant_id)})

            # Insere 2 eventos e valida prev_hash/event_hash
            await conn.execute(
                text(
                    """
                    INSERT INTO public.audit_events (tenant_id, occurred_at, actor, action, resource_ref, correlation_id, trace_id, payload_json)
                    VALUES (:tenant_id, now(), 'system', 'SMOKE_1', 'hardening', 'c1', 't1', '{"k":1}'::jsonb)
                    """
                ),
                {"tenant_id": tenant_id},
            )
            await conn.execute(
                text(
                    """
                    INSERT INTO public.audit_events (tenant_id, occurred_at, actor, action, resource_ref, correlation_id, trace_id, payload_json)
                    VALUES (:tenant_id, now(), 'system', 'SMOKE_2', 'hardening', 'c2', 't2', '{"k":2}'::jsonb)
                    """
                ),
                {"tenant_id": tenant_id},
            )

            rows = (
                await conn.execute(
                    text(
                        """
                        SELECT id, prev_hash, event_hash
                        FROM public.audit_events
                        WHERE tenant_id = :tenant_id
                        ORDER BY id DESC
                        LIMIT 2
                        """
                    ),
                    {"tenant_id": tenant_id},
                )
            ).all()

            assert len(rows) == 2
            newest = rows[0]
            older = rows[1]
            assert older.event_hash is not None and len(older.event_hash) == 64
            assert newest.prev_hash == older.event_hash
            assert newest.event_hash is not None and len(newest.event_hash) == 64

        # 2) verify_audit_chain deve retornar TRUE
        async with engine.begin() as conn:
            ok = await conn.scalar(
                text(
                    """
                    SELECT public.verify_audit_chain(
                      :tenant_id,
                      now() - interval '1 day',
                      now() + interval '1 day'
                    )
                    """
                ),
                {"tenant_id": tenant_id},
            )
            assert ok is True

        # 3) UPDATE/DELETE em audit_events deve falhar (append-only)
        async with engine.begin() as conn:
            with pytest.raises(Exception):
                await conn.execute(
                    text("UPDATE public.audit_events SET actor='tamper' WHERE tenant_id = :tenant_id"),
                    {"tenant_id": tenant_id},
                )

        # 4) RLS: valida isolamento A vs B em tabela tenant-scoped
        tenant_a = uuid4()
        tenant_b = uuid4()

        table = "tenant_source_configs"

        async with engine.begin() as conn:
            await conn.execute(text("SET LOCAL app.current_tenant_id = :tid"), {"tid": str(tenant_a)})
            await conn.execute(text(f"INSERT INTO public.{table} (tenant_id) VALUES (:tid)"), {"tid": tenant_a})

        async with engine.begin() as conn:
            await conn.execute(text("SET LOCAL app.current_tenant_id = :tid"), {"tid": str(tenant_a)})
            count_a = await conn.scalar(
                text(f"SELECT count(*) FROM public.{table} WHERE tenant_id = :tid"),
                {"tid": tenant_a},
            )
            assert (count_a or 0) >= 1

        async with engine.begin() as conn:
            await conn.execute(text("SET LOCAL app.current_tenant_id = :tid"), {"tid": str(tenant_b)})
            count_b = await conn.scalar(
                text(f"SELECT count(*) FROM public.{table} WHERE tenant_id = :tid"),
                {"tid": tenant_a},
            )
            assert (count_b or 0) == 0

        # 5) Fail-closed: sem tenant context retorna zero rows
        async with engine.begin() as conn:
            count_no_ctx = await conn.scalar(text(f"SELECT count(*) FROM public.{table}"))
            assert (count_no_ctx or 0) == 0

    finally:
        await engine.dispose()
