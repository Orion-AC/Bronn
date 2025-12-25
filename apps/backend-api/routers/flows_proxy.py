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

# ACTIVEPIECES_URL must be set via environment - no localhost fallback
ACTIVEPIECES_URL = os.getenv("ACTIVEPIECES_URL", "")
# This should be an API key generated in the Activepieces admin console
ACTIVEPIECES_API_KEY = os.getenv("ACTIVEPIECES_API_KEY", "")

# Startup validation
if not ACTIVEPIECES_URL:
    import logging
    logging.getLogger(__name__).warning(
        "ACTIVEPIECES_URL not configured. Flows proxy will not work."
    )

async def _ap_request(method: str, path: str, data: Optional[Dict] = None) -> Any:
    """Helper to make authenticated requests to Activepieces."""
    if not ACTIVEPIECES_API_KEY:
        # Don't crash with "Bearer " header, return a clear error instead
        raise HTTPException(
            status_code=503, 
            detail="Activepieces is not configured in this environment (missing ACTIVEPIECES_API_KEY)"
        )

    headers = {
        "Authorization": f"Bearer {ACTIVEPIECES_API_KEY}",
        "Content-Type": "application/json"
    }
    url = f"{ACTIVEPIECES_URL}/api/v1{path}"
    
    try:
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
                # Provide cleaner error message for the frontend
                error_detail = response.text
                try:
                    error_json = response.json()
                    if "message" in error_json:
                        error_detail = error_json["message"]
                except:
                    pass
                raise HTTPException(status_code=response.status_code, detail=error_detail)
            
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to Activepieces: {str(e)}")


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
