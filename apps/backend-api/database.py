from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database URL - Use PostgreSQL from environment, fallback to SQLite for local dev
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./bronn.db"
)

# Create engine with appropriate settings
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def set_db_context(db: Session, tenant_id: str, user_email: str):
    """Set the PostgreSQL session variables for RLS and Auditing."""
    # Note: In production, ensure these values are properly sanitized or use bind parameters if supported by the driver for SET
    db.execute(text("SELECT set_config('app.current_tenant', :tenant, false)"), {"tenant": tenant_id})
    db.execute(text("SELECT set_config('app.current_user', :user, false)"), {"user": user_email})

