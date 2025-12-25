"""
Database Configuration

Supports:
- Local development: SQLite or local PostgreSQL
- Cloud Run: Google Cloud SQL via Python Connector
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from google.cloud.sql.connector import Connector, IPTypes

logger = logging.getLogger(__name__)

# Initialize Connector for Cloud SQL
connector = Connector()

def getconn():
    """
    Connection creator for Cloud SQL Python Connector.
    """
    cloud_sql_connection = os.getenv("CLOUD_SQL_CONNECTION_NAME")
    if not cloud_sql_connection:
        raise ValueError("CLOUD_SQL_CONNECTION_NAME environment variable not set")
        
    conn = connector.connect(
        cloud_sql_connection,
        "pg8000",
        user=os.getenv("DB_USER", "bronn"),
        password=os.getenv("DB_PASS", ""),
        db=os.getenv("DB_NAME", "bronn"),
        ip_type=IPTypes.PUBLIC
    )
    return conn

def get_database_url() -> str:
    """
    Get the appropriate database URL or placeholder.
    """
    # Check for Cloud SQL connection (Cloud Run)
    if os.getenv("CLOUD_SQL_CONNECTION_NAME"):
        # Dummy URL, actual connection handled by creator=getconn
        return "postgresql+pg8000://"
    
    # Check for Cloud SQL Auth Proxy (local dev with real Cloud SQL)
    db_host = os.getenv("DB_HOST")
    if db_host and db_host.startswith("127.0.0.1"):
        db_user = os.getenv("DB_USER", "bronn")
        db_pass = os.getenv("DB_PASS", "")
        db_name = os.getenv("DB_NAME", "bronn")
        db_port = os.getenv("DB_PORT", "5432")
        
        return f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
    
    # Check for explicit DATABASE_URL
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # Fallback to local SQLite
    return "sqlite:///./bronn.db"


# Get database identifier
SQLALCHEMY_DATABASE_URL = get_database_url()

# Create engine with appropriate settings
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
elif SQLALCHEMY_DATABASE_URL == "postgresql+pg8000://":
    # Production Cloud Run using Connector
    logger.info("Using Cloud SQL Python Connector (Production)")
    engine = create_engine(
        "postgresql+pg8000://",
        creator=getconn,
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800,
    )
else:
    # Standard PostgreSQL or local proxy
    logger.info(f"Using standard PostgreSQL connection: {SQLALCHEMY_DATABASE_URL.split('@')[-1]}")
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
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def set_db_context(db: Session, tenant_id: str, user_email: str):
    """
    Set the PostgreSQL session variables for RLS and Auditing.
    """
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
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
