from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, database
from routers import activepieces, auth, agents, workflows, sso, live_logs, flows_proxy
import monitoring

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(
    title="Bronn API",
    description="Bronn Backend with Activepieces Integration",
    version="1.0.0"
)


# Setup Monitoring (OpenTelemetry)
monitoring.setup_monitoring(app, database.engine)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5000",
        "http://localhost:8080",
        "http://bronn-frontend:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "bronn-backend"}

# Agent endpoints moved to routers/agents.py

# Workflow endpoints moved to routers/workflows.py

