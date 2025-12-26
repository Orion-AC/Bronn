from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import models, database
from routers import activepieces, auth, agents, workflows, workspaces, sso, live_logs, flows_proxy
import logging

logger = logging.getLogger(__name__)


def get_cors_origins() -> List[str]:
    """
    Get CORS origins from environment variable or use defaults.
    
    In production: Set CORS_ORIGINS env var (comma-separated)
    In development: Falls back to localhost + production defaults
    """
    custom_origins = os.getenv("CORS_ORIGINS", "")
    if custom_origins:
        origins = [o.strip() for o in custom_origins.split(",") if o.strip()]
        logger.info(f"CORS origins from environment: {origins}")
        return origins
    
    # Default origins - includes production and local development
    return [
        # Production
        "https://bronn.dev",
        "https://www.bronn.dev",
        "https://studio.bronn.dev",
        # Cloud Run frontend
        "https://bronn-frontend-480969272523.us-central1.run.app",
        # Local development
        "http://localhost:5173",
        "http://localhost:5000",
        "http://localhost:8080",
    ]


# Create FastAPI app FIRST
app = FastAPI(
    title="Bronn API",
    description="Bronn Backend with Activepieces Integration",
    version="1.0.0"
)

# Enable CORS with configurable origins - MUST be before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Global OPTIONS handler - catches all preflight requests BEFORE route matching
# =============================================================================
@app.options("/{path:path}")
async def options_handler(path: str):
    """
    Handle all OPTIONS preflight requests globally.
    This ensures CORS preflight succeeds even if route validation would fail.
    """
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Origin, X-Requested-With",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400",
        }
    )


# =============================================================================
# Exception handler to ensure CORS headers on errors
# =============================================================================
@app.exception_handler(StarletteHTTPException)
async def cors_exception_handler(request: Request, exc: StarletteHTTPException):
    """Ensure CORS headers are present even on error responses."""
    origin = request.headers.get("origin", "")
    allowed_origins = get_cors_origins()
    
    # Check if origin is allowed
    allow_origin = origin if origin in allowed_origins else allowed_origins[0] if allowed_origins else "*"
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Credentials": "true",
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler with CORS headers."""
    origin = request.headers.get("origin", "")
    allowed_origins = get_cors_origins()
    allow_origin = origin if origin in allowed_origins else "*"
    
    logger.error(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Credentials": "true",
        }
    )


# Initialize database tables (non-blocking for health checks)
try:
    from sqlalchemy import text
    
    # Drop legacy tables with wrong schema (INTEGER id instead of UUID)
    # This is needed because production has old schema that conflicts with new UUID-based models
    with database.engine.connect() as conn:
        # Check if workflows table exists with wrong column type
        result = conn.execute(text("""
            SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'workflows' AND column_name = 'id'
        """))
        row = result.fetchone()
        
        if row and row[0] == 'integer':
            logger.warning("Detected legacy INTEGER-based tables, dropping for UUID migration...")
            conn.execute(text("DROP TABLE IF EXISTS workflow_runs CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS workflows CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS workspaces CASCADE"))
            conn.commit()
            logger.info("Legacy tables dropped successfully")
    
    # Now create tables with correct UUID schema
    models.Base.metadata.create_all(bind=database.engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to initialize database tables: {e}")
    logger.info("App will start anyway - database may connect later")


# Include routers AFTER middleware and exception handlers
app.include_router(auth.router)
app.include_router(activepieces.router)
app.include_router(agents.router)
app.include_router(workflows.router)
app.include_router(workspaces.router)
app.include_router(sso.router)
app.include_router(live_logs.router)
app.include_router(flows_proxy.router)


# Health check
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "bronn-backend"}
