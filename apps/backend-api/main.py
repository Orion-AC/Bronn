from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, database
from routers import activepieces, auth, agents, workflows, sso, live_logs, flows_proxy
import logging

logger = logging.getLogger(__name__)

# Initialize database tables (non-blocking for health checks)
try:
    # This might fail on first run if DB is not ready, handled by try-except
    models.Base.metadata.create_all(bind=database.engine)
    logger.info(\"Database tables created successfully\")
except Exception as e:
    logger.error(f\"Failed to initialize database tables: {e}\")
    logger.info(\"App will start anyway - database may connect later\")

app = FastAPI(
    title=\"Bronn API\",
    description=\"Bronn Backend with Activepieces Integration\",
    version=\"1.0.0\"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        \"http://localhost:5173\",
        \"http://localhost:5000\",
        \"http://localhost:8080\",
        \"https://bronn-frontend-480969272523.us-central1.run.app\",
    ],
    allow_credentials=True,
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Include routers
app.include_router(auth.router)
app.include_router(activepieces.router)
app.include_router(agents.router)
app.include_router(workflows.router)
app.include_router(sso.router)
app.include_router(live_logs.router)
app.include_router(flows_proxy.router)


# Health check
@app.get(\"/api/health\")
def health_check():
    return {\"status\": \"healthy\", \"service\": \"bronn-backend\"}

# Agent endpoints moved to routers/agents.py

# Workflow endpoints moved to routers/workflows.py
