from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import models, database
from auth.dependencies import get_current_user

router = APIRouter(
    prefix="/api/agents",
    tags=["agents"]
)

class AgentInvokeRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = {}

class AgentInvokeResponse(BaseModel):
    agent_id: str
    response: str
    status: str
    metadata: Optional[Dict[str, Any]] = {}

@router.get("", response_model=List[Any])
def read_agents(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Agent).all()

class AgentCreate(BaseModel):
    name: str
    role: str
    status: str
    skills: Optional[List[str]] = []

@router.post("", response_model=Any)
def create_agent(
    agent_data: AgentCreate, 
    user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    tenant_id = "default"  # In a multi-tenant setup, this would come from user profile/header
    
    agent = models.Agent(
        name=agent_data.name, 
        role=agent_data.role, 
        status=agent_data.status, 
        uptime="0m", 
        tests_run="0", 
        skills=agent_data.skills,
        tenant_id=tenant_id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.post("/{agent_id}/invoke", response_model=AgentInvokeResponse)
async def invoke_agent(
    agent_id: str,
    request: AgentInvokeRequest,
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    """
    Invoke a Bronn Agent. 
    In Phase 2, this is a mock implementation that will later bridge to CrewAI/LangGraph.
    """
    # Simple API Key validation (In production, use a more robust mechanism)
    expected_api_key = os.getenv("BRONN_INTERNAL_API_KEY", "bronn-secret-123")
    if x_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    # Note: If agent_id is a string name like 'nexus-7', we might need to handle that.
    # For now, let's assume it's the ID or name.
    
    # Mock synergy response
    response_text = f"Agent {agent_id} processed your prompt: '{request.prompt}'. "
    response_text += "Integration with Activepieces workflow is active."

    return AgentInvokeResponse(
        agent_id=agent_id,
        response=response_text,
        status="success",
        metadata={"processed_by": "Bronn-Engine-v1"}
    )
