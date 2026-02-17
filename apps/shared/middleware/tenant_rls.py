from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator, Callable, Protocol
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

TENANT_GUC = "app.current_tenant_id"


class AsyncSessionFactory(Protocol):
    """Compatível com sqlalchemy.ext.asyncio.async_sessionmaker."""

    def __call__(self) -> AsyncSession: ...


async def set_tenant_guc(session: AsyncSession, tenant_id: UUID) -> None:
    """Aplica o tenant no escopo da transação/conexão atual via SET LOCAL."""
    await session.execute(text(f"SET LOCAL {TENANT_GUC} = :tenant_id"), {"tenant_id": str(tenant_id)})


@asynccontextmanager
async def tenant_scoped_session(
    session_factory: AsyncSessionFactory, tenant_id: UUID
) -> AsyncIterator[AsyncSession]:
    """Context manager padrão para uso em endpoints tenant-scoped."""
    session = session_factory()
    try:
        async with session.begin():
            await set_tenant_guc(session, tenant_id)
            yield session
    finally:
        await session.close()


def require_tenant_scope(session_factory: AsyncSessionFactory) -> Callable[[UUID], AsyncIterator[AsyncSession]]:
    """Helper para integrar com frameworks web como dependency (sem importar FastAPI aqui)."""

    @asynccontextmanager
    async def _dep(tenant_id: UUID) -> AsyncIterator[AsyncSession]:
        async with tenant_scoped_session(session_factory, tenant_id) as session:
            yield session

    return _dep
