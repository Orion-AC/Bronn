"""
Workflows API Router

Global workflow operations across all workspaces.
All data persisted to Cloud SQL.
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid
import logging

import models
import database
from auth.users import get_current_user
from auth.signing_key import get_public_key

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/workflows",
    tags=["workflows"]
)


# ============================================================================
# Pydantic Models
# ============================================================================

class WorkflowResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: Optional[str]
    status: str
    created_by: str
    created_at: Optional[str]
    updated_at: Optional[str]
    workspace: Optional[dict] = None

    class Config:
        from_attributes = True


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    definition_json: Optional[dict] = None


# ============================================================================
# Helper Functions
# ============================================================================

def get_authenticated_user(authorization: Optional[str] = Header(None)):
    """Extract and validate user from authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user


# ============================================================================
# Activepieces Integration Endpoints
# ============================================================================

@router.get("/engine/public-key")
def get_engine_public_key():
    """
    Retrieve the public key for Activepieces to verify JWTs.
    This endpoint is called by Activepieces to fetch the signing key.
    """
    try:
        key_id, public_key = get_public_key()
        return {"keyId": key_id, "publicKey": public_key}
    except Exception as e:
        logger.error(f"Failed to retrieve public key: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve public key: {str(e)}"
        )


# ============================================================================
# Global Workflow Endpoints
# ============================================================================

@router.get("", response_model=List[WorkflowResponse])
def list_all_workflows(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """
    List all workflows across all workspaces for the authenticated user.
    This is the global workflow index.
    """
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    # Get all workflows for user's workspaces
    query = db.query(models.Workflow)\
        .join(models.Workspace)\
        .filter(models.Workspace.owner_id == user["uid"])
    
    if status:
        query = query.filter(models.Workflow.status == status)
    
    workflows = query\
        .order_by(models.Workflow.updated_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return [w.to_dict(include_workspace=True) for w in workflows]


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(
    workflow_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Get a specific workflow by ID."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workflow_uuid = uuid.UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workflow ID format")
    
    workflow = db.query(models.Workflow)\
        .join(models.Workspace)\
        .filter(models.Workflow.id == workflow_uuid)\
        .first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check ownership via workspace
    if workflow.workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return workflow.to_dict(include_workspace=True)


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: str,
    update: WorkflowUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Update a workflow."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workflow_uuid = uuid.UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workflow ID format")
    
    workflow = db.query(models.Workflow)\
        .join(models.Workspace)\
        .filter(models.Workflow.id == workflow_uuid)\
        .first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    if workflow.workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    if update.name is not None:
        workflow.name = update.name
    if update.description is not None:
        workflow.description = update.description
    if update.status is not None:
        workflow.status = update.status
    if update.definition_json is not None:
        workflow.definition_json = update.definition_json
    
    db.commit()
    db.refresh(workflow)
    
    return workflow.to_dict(include_workspace=True)


@router.delete("/{workflow_id}")
def delete_workflow(
    workflow_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """Delete a workflow."""
    user = get_authenticated_user(authorization)
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    try:
        workflow_uuid = uuid.UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workflow ID format")
    
    workflow = db.query(models.Workflow)\
        .join(models.Workspace)\
        .filter(models.Workflow.id == workflow_uuid)\
        .first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    if workflow.workspace.owner_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(workflow)
    db.commit()
    
    return {"status": "deleted", "id": workflow_id}
