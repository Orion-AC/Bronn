from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Any
import logging
import models, database
from auth.users import get_current_user
from auth.signing_key import get_public_key

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/workflows",
    tags=["workflows"]
)


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


@router.get("", response_model=List[Any])
def read_workflows(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Set DB context for RLS
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    return db.query(models.Workflow).all()

@router.post("", response_model=Any)
def create_workflow(
    name: str, 
    description: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Set DB context for RLS & auditing
    tenant_id = user.get("tenant_id", "default")
    database.set_db_context(db, tenant_id, user["email"])
    
    workflow = models.Workflow(
        name=name, 
        description=description, 
        status="pending", 
        duration="--",
        tenant_id=tenant_id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow
