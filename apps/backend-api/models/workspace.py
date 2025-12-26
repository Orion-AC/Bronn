"""
Workspace Model

Represents a container for workflows, agents, and other resources.
A workspace must exist before workflows can be created.
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Workspace(Base):
    """
    Workspace model - the primary container for all user resources.
    
    Hierarchy:
    - User owns multiple Workspaces
    - Workspace contains multiple Workflows
    - Deleting a Workspace cascades to all its Workflows
    """
    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    visibility = Column(String(20), default="private")  # private, team, public
    owner_id = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tenant_id = Column(String(255), index=True, nullable=True)

    # Relationships
    workflows = relationship(
        "Workflow", 
        back_populates="workspace", 
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    # Indexes for common queries
    __table_args__ = (
        Index('idx_workspaces_owner_tenant', 'owner_id', 'tenant_id'),
        Index('idx_workspaces_updated', 'updated_at'),
    )

    def __repr__(self):
        return f"<Workspace(id={self.id}, name='{self.name}')>"
    
    @property
    def workflow_count(self) -> int:
        """Get the number of workflows in this workspace."""
        return self.workflows.count()
    
    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "visibility": self.visibility,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "workflow_count": self.workflow_count
        }
