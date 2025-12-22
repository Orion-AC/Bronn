from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    status = Column(String)  # 'active', 'idle', 'deploying'
    uptime = Column(String)
    tests_run = Column(String)
    avatar_url = Column(String, nullable=True)
    skills = Column(JSON, default=[])
    tenant_id = Column(String, index=True, nullable=True)

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    status = Column(String)  # 'success', 'failed', 'running'
    duration = Column(String)
    last_run = Column(DateTime, default=datetime.utcnow)
    tenant_id = Column(String, index=True, nullable=True)
