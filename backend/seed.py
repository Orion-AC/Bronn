from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models

def seed():
    db = SessionLocal()
    
    # Check if data exists
    if db.query(models.Agent).first():
        print("Database already seeded.")
        return

    # Seed Agents
    agents = [
        models.Agent(name="Nexus-7", role="Data Pipelines", status="active", uptime="12d 4h", tests_run="1.2k"),
        models.Agent(name="Viper-X", role="Security Audit", status="idle", uptime="4d 2h", tests_run="840"),
        models.Agent(name="Cobalt", role="UI Testing", status="running", uptime="1h 20m", tests_run="42"),
        models.Agent(name="Echo", role="Log Analysis", status="active", uptime="30d 1h", tests_run="14k"),
    ]
    
    for agent in agents:
        db.add(agent)

    # Seed Workflows
    workflows = [
        models.Workflow(name="Daily Build", description="Compiles and tests main branch", status="success", duration="4m 20s"),
        models.Workflow(name="Deploy to Staging", description="Auto-deployment trigger", status="success", duration="2m 15s"),
        models.Workflow(name="Security Scan", description="Vulnerability assessment", status="failed", duration="1m 05s"),
        models.Workflow(name="Data Backup", description="Snapshot database to S3", status="running", duration="--"),
    ]

    for wf in workflows:
        db.add(wf)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    seed()
