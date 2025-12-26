"""
Agent and Workflow Models

These models represent the core automation entities in Bronn.
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Agent(Base):
    """
    Agent model - represents an AI agent configuration.
    """
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    role = Column(String(100))
    status = Column(String(20))  # 'active', 'idle', 'deploying'
    uptime = Column(String(50))
    tests_run = Column(String(50))
    avatar_url = Column(String(500), nullable=True)
    skills = Column(JSON, default=[])
    tenant_id = Column(String(255), index=True, nullable=True)

    def __repr__(self):
        return f"<Agent(id={self.id}, name='{self.name}')>"


class Workflow(Base):
    """
    Workflow model - represents an automation workflow.
    
    A workflow MUST belong to a workspace (workspace_id is NOT NULL).
    Deleting a workspace cascades to delete all its workflows.
    """
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("workspaces.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="draft")  # draft, active, archived
    definition_json = Column(JSON, nullable=True)  # Workflow definition (e.g., from Activepieces)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tenant_id = Column(String(255), index=True, nullable=True)

    # Relationships
    workspace = relationship("Workspace", back_populates="workflows")

    # Indexes for common queries
    __table_args__ = (
        Index('idx_workflows_workspace_status', 'workspace_id', 'status'),
        Index('idx_workflows_updated', 'updated_at'),
    )

    def __repr__(self):
        return f"<Workflow(id={self.id}, name='{self.name}')>"

    def to_dict(self, include_workspace=False):
        """Convert to dictionary for API responses."""
        result = {
            "id": str(self.id),
            "workspace_id": str(self.workspace_id),
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_workspace and self.workspace:
            result["workspace"] = {
                "id": str(self.workspace.id),
                "name": self.workspace.name
            }
        return result


class WorkflowRun(Base):
    """
    WorkflowRun model - represents a single execution of a workflow.
    Future-proofing for run history and logs.
    """
    __tablename__ = "workflow_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("workflows.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    status = Column(String(20), default="pending")  # pending, running, success, failed
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    logs_location = Column(String(500), nullable=True)  # S3/GCS path for logs
    error_message = Column(Text, nullable=True)
    tenant_id = Column(String(255), index=True, nullable=True)

    # Indexes
    __table_args__ = (
        Index('idx_workflow_runs_workflow_status', 'workflow_id', 'status'),
        Index('idx_workflow_runs_started', 'started_at'),
    )

    def __repr__(self):
        return f"<WorkflowRun(id={self.id}, status='{self.status}')>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "workflow_id": str(self.workflow_id),
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "error_message": self.error_message,
        }
