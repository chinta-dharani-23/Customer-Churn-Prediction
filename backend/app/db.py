"""
db.py
-----
Async SQLAlchemy engine/session. Works with:
  * Neon Postgres  - DATABASE_URL=postgresql://...neon.tech/db?sslmode=require
  * local SQLite   - no DATABASE_URL needed (file: backend/churn.db)

Neon connection strings use `sslmode=require`, which the asyncpg driver does
NOT understand (it raises "unexpected keyword argument 'sslmode'"). So the URL
is rewritten here: driver -> postgresql+asyncpg, sslmode/channel_binding
dropped, and SSL switched on through connect_args instead.
"""

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

Base = declarative_base()


def _build_engine_args(raw_url: str):
    url = make_url(raw_url)
    connect_args: dict = {}
    kwargs: dict = {}

    if url.drivername in ("postgres", "postgresql", "postgresql+psycopg2", "postgresql+asyncpg"):
        query = dict(url.query)
        sslmode = query.pop("sslmode", None)
        query.pop("channel_binding", None)
        ssl_q = query.pop("ssl", None)
        url = url.set(drivername="postgresql+asyncpg", query=query)

        wants_ssl = (sslmode in ("require", "verify-ca", "verify-full")) or ssl_q in ("true", "require", "1")
        if wants_ssl or (url.host and url.host not in ("localhost", "127.0.0.1")):
            connect_args["ssl"] = True
        # Neon suspends idle compute; pre-ping drops dead pooled connections instead of failing a request.
        kwargs.update(pool_pre_ping=True, pool_recycle=300)

    return url, connect_args, kwargs


_url, _connect_args, _kwargs = _build_engine_args(settings.DATABASE_URL)
engine = create_async_engine(_url, echo=False, connect_args=_connect_args, **_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


def describe_database() -> str:
    """Safe-to-print description (no password)."""
    return _url.render_as_string(hide_password=True)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Creates tables if they don't exist. Convenience for first-time setup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)