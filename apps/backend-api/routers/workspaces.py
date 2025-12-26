"""
Workspaces API Router

Full CRUD for workspaces and workspace-scoped workflow operations.
All data persisted to Cloud SQL.
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import logging

import models
import database
from auth.firebase_auth import verify_firebase_token

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/workspaces",
    tags=["workspaces"]
)


# ============================================================================
# Pydantic Models for Request/Response
# ============================================================================

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    visibility: Optional[str] = "private"


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    visibility: str
    owner_id: str
    created_at: Optional[str]
    updated_at: Optional[str]
    workflow_count: int

    class Config:
        from_attributes = True


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: Optional[str]
    status: str
    created_by: str
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# Helper Functions
# ============================================================================

def get_authenticated_user(authorization: Optional[str] = Header(None)):
    """Extract and validate user from Firebase authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "").strip()
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    # Verify with Firebase
    decoded = verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Return user info from Firebase token
    return {
        "uid": decoded.get("uid"),
        "email": decoded.get("email", ""),
        "email_verified": decoded.get("email_verified", False),
        "tenant_id": decoded.get("tenant_id", "default")
    }


# ============================================================================
# Workspace CRUD Endpoints
# ============================================================================

@router.post("", response_model=WorkspaceResponse)
def create_workspace(
    workspace: WorkspaceCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Create a new workspace."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    new_workspace = models.Workspace(
        name=workspace.name,
        description=workspace.description,
        visibility=workspace.visibility or "private",
        owner_id=user["uid"],
        tenant_id=tenant_id
    )
    
    db.add(new_workspace)
    db.commit()
    db.refresh(new_workspace)
    
    return new_workspace.to_dict()


@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List all workspaces for the authenticated user."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    workspaces = db.query(models.Workspace)\
        .filter(models.Workspace.owner_id == user["uid"])\
        .order_by(models.Workspace.updated_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return [w.to_dict() for w in workspaces]


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Get a specific workspace by ID."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workspace_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID format")
    
    workspace = db.query(models.Workspace)\
        .filter(models.Workspace.id == workspace_uuid)\
        .first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Check ownership
    if workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return workspace.to_dict()


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: str,
    update: WorkspaceUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Update a workspace."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workspace_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID format")
    
    workspace = db.query(models.Workspace)\
        .filter(models.Workspace.id == workspace_uuid)\
        .first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    if update.name is not None:
        workspace.name = update.name
    if update.description is not None:
        workspace.description = update.description
    if update.visibility is not None:
        workspace.visibility = update.visibility
    
    workspace.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(workspace)
    
    return workspace.to_dict()


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Delete a workspace and all its workflows (cascade)."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workspace_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID format")
    
    workspace = db.query(models.Workspace)\
        .filter(models.Workspace.id == workspace_uuid)\
        .first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(workspace)  # Cascade deletes workflows
    db.commit()
    
    return {"status": "deleted", "id": workspace_id}


# ============================================================================
# Workspace-Scoped Workflow Endpoints
# ============================================================================

@router.post("/{workspace_id}/workflows", response_model=WorkflowResponse)
def create_workflow_in_workspace(
    workspace_id: str,
    workflow: WorkflowCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Create a new workflow within a workspace."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workspace_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID format")
    
    # Verify workspace exists and user has access
    workspace = db.query(models.Workspace)\
        .filter(models.Workspace.id == workspace_uuid)\
        .first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied to workspace")
    
    new_workflow = models.Workflow(
        workspace_id=workspace_uuid,
        name=workflow.name,
        description=workflow.description,
        status="draft",
        created_by=user["uid"],
        tenant_id=tenant_id
    )
    
    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)
    
    return new_workflow.to_dict()


@router.get("/{workspace_id}/workflows", response_model=List[WorkflowResponse])
def list_workflows_in_workspace(
    workspace_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List all workflows in a workspace."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workspace_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID format")
    
    # Verify workspace exists and user has access
    workspace = db.query(models.Workspace)\
        .filter(models.Workspace.id == workspace_uuid)\
        .first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = db.query(models.Workflow)\
        .filter(models.Workflow.workspace_id == workspace_uuid)
    
    if status:
        query = query.filter(models.Workflow.status == status)
    
    workflows = query\
        .order_by(models.Workflow.updated_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return [w.to_dict() for w in workflows]
