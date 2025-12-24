"""
Database Configuration

Supports:
- Local development: SQLite or local PostgreSQL
- Cloud Run: Google Cloud SQL via Unix socket
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

logger = logging.getLogger(__name__)


def get_database_url() -> str:
    """
    Get the appropriate database URL based on environment.
    
    Supports three connection modes:
    1. Cloud SQL Unix Socket (Cloud Run production)
    2. Cloud SQL Auth Proxy (Local dev with real Cloud SQL)
    3. Standard TCP/SQLite (Local dev with local database)
    
    Priority:
    1. Cloud SQL Unix socket (if CLOUD_SQL_CONNECTION_NAME is set)
    2. Cloud SQL Auth Proxy (if DB_HOST starts with 127.0.0.1)
    3. DATABASE_URL environment variable
    4. Local SQLite fallback
    """
    # Check for Cloud SQL connection (Cloud Run)
    cloud_sql_connection = os.getenv("CLOUD_SQL_CONNECTION_NAME")
    
    if cloud_sql_connection:
        # Running on Cloud Run with Cloud SQL via Unix socket
        db_user = os.getenv("DB_USER", "bronn")
        db_pass = os.getenv("DB_PASS", "")
        db_name = os.getenv("DB_NAME", "bronn")
        
        # Cloud SQL uses Unix socket on Cloud Run
        socket_path = f"/cloudsql/{cloud_sql_connection}"
        
        url = f"postgresql+pg8000://{db_user}:{db_pass}@/{db_name}?unix_sock={socket_path}/.s.PGSQL.5432"
        logger.info(f"Using Cloud SQL Unix socket (Cloud Run): {cloud_sql_connection}")
        return url
    
    # Check for Cloud SQL Auth Proxy (local dev with real Cloud SQL)
    db_host = os.getenv("DB_HOST")
    if db_host and db_host.startswith("127.0.0.1"):
        db_user = os.getenv("DB_USER", "bronn")
        db_pass = os.getenv("DB_PASS", "")
        db_name = os.getenv("DB_NAME", "bronn")
        db_port = os.getenv("DB_PORT", "5432")
        
        url = f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        logger.info("Using Cloud SQL Auth Proxy (Local Development)")
        return url
    
    # Check for explicit DATABASE_URL
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        logger.info("Using DATABASE_URL from environment (standard TCP connection)")
        return database_url
    
    # Fallback to local SQLite
    logger.info("Using local SQLite database (fallback)")
    return "sqlite:///./bronn.db"


# Get database URL
SQLALCHEMY_DATABASE_URL = get_database_url()

# Create engine with appropriate settings
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
elif "pg8000" in SQLALCHEMY_DATABASE_URL:
    # Cloud SQL with pg8000 driver
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800,
    )
else:
    # Standard PostgreSQL
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Database session dependency for FastAPI.
    
    Usage:
        @app.get("/items")
        async def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def set_db_context(db: Session, tenant_id: str, user_email: str):
    """
    Set the PostgreSQL session variables for RLS and Auditing.
    
    Args:
        db: SQLAlchemy session
        tenant_id: Current tenant ID for RLS
        user_email: Current user email for audit logging
    """
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        # SQLite doesn't support session variables
        return
    
    try:
        db.execute(
            text("SELECT set_config('app.current_tenant', :tenant, false)"), 
            {"tenant": tenant_id or ""}
        )
        db.execute(
            text("SELECT set_config('app.current_user', :user, false)"), 
            {"user": user_email or ""}
        )
    except Exception as e:
        logger.warning(f"Failed to set db context: {e}")

