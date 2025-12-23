"""
Activepieces Flows Proxy Router

This router acts as a proxy between the Bronn Studio UI and the
Activepieces headless engine, enabling custom workflow management
without relying on the Activepieces UI.
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Any, Dict, List
import httpx
import os

router = APIRouter(
    prefix="/api/flows-proxy",
    tags=["flows-proxy"]
)

ACTIVEPIECES_URL = os.getenv("ACTIVEPIECES_URL", "http://localhost:8080")
# This should be an API key generated in the Activepieces admin console
ACTIVEPIECES_API_KEY = os.getenv("ACTIVEPIECES_API_KEY", "")

async def _ap_request(method: str, path: str, data: Optional[Dict] = None) -> Any:
    """Helper to make authenticated requests to Activepieces."""
    headers = {
        "Authorization": f"Bearer {ACTIVEPIECES_API_KEY}",
        "Content-Type": "application/json"
    }
    url = f"{ACTIVEPIECES_URL}/api/v1{path}"
    
    async with httpx.AsyncClient() as client:
        if method == "GET":
            response = await client.get(url, headers=headers)
        elif method == "POST":
            response = await client.post(url, headers=headers, json=data)
        elif method == "DELETE":
            response = await client.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        return response.json()


@router.get("/flows")
async def list_flows(
    folder_id: Optional[str] = None,
    limit: int = 20,
    status: Optional[str] = None
):
    """List all flows from the Activepieces engine."""
    query_params = f"?limit={limit}"
    if folder_id:
        query_params += f"&folderId={folder_id}"
    if status:
        query_params += f"&status={status}"
    
    return await _ap_request("GET", f"/flows{query_params}")


@router.get("/flows/{flow_id}")
async def get_flow(flow_id: str):
    """Get a specific flow's details."""
    return await _ap_request("GET", f"/flows/{flow_id}")


@router.post("/flows/{flow_id}/run")
async def trigger_flow_run(flow_id: str, payload: Optional[Dict] = None):
    """Trigger a flow run manually."""
    # This endpoint might vary based on the AP version / trigger type
    # For webhook triggers, you'd typically POST to the webhook URL
    # This is a placeholder for the general concept
    return await _ap_request("POST", f"/flow-runs", data={
        "flowId": flow_id,
        "payload": payload or {}
    })


@router.get("/flow-runs")
async def list_flow_runs(
    flow_id: Optional[str] = None,
    limit: int = 20
):
    """List recent flow runs."""
    query_params = f"?limit={limit}"
    if flow_id:
        query_params += f"&flowId={flow_id}"
    
    return await _ap_request("GET", f"/flow-runs{query_params}")


@router.get("/flow-runs/{run_id}")
async def get_flow_run(run_id: str):
    """Get details of a specific flow run."""
    return await _ap_request("GET", f"/flow-runs/{run_id}")
