from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agents Endpoints
@app.get("/api/agents")
def read_agents(db: Session = Depends(database.get_db)):
    return db.query(models.Agent).all()

@app.post("/api/agents")
def create_agent(name: str, role: str, status: str, db: Session = Depends(database.get_db)):
    agent = models.Agent(name=name, role=role, status=status, uptime="0m", tests_run="0")
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

# Workflows Endpoints
@app.get("/api/workflows")
def read_workflows(db: Session = Depends(database.get_db)):
    return db.query(models.Workflow).all()

@app.post("/api/workflows")
def create_workflow(name: str, description: str, db: Session = Depends(database.get_db)):
    # Mock data for auto-fields
    workflow = models.Workflow(
        name=name, 
        description=description, 
        status="pending", 
        duration="--",
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow
