"""
Activepieces Proxy Router

This router proxies requests to the embedded Activepieces instance
and handles JWT authentication for embedded access.
"""

import os
import httpx
from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import JSONResponse
from typing import Optional

from auth.users import get_current_user
from auth.signing_key import create_activepieces_jwt, get_public_key

router = APIRouter(prefix="/api/workflows/engine", tags=["activepieces"])

# Activepieces internal URL
ACTIVEPIECES_URL = os.getenv("ACTIVEPIECES_URL", "http://activepieces:80")

@router.get("/token")
async def get_embed_token(
    request: Request,
    project_id: str = "default"
):
    """
    Generate a JWT token for embedding Activepieces using authenticated user info.
    """
    # Get token from header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token_str = authorization.split(" ")[1]
    user = get_current_user(token_str)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        token = create_activepieces_jwt(
            user_id=user["email"],
            project_id=project_id,
            first_name=user["first_name"],
            last_name=user["last_name"],
            role="EDITOR"
        )
        return {"token": token, "instanceUrl": ACTIVEPIECES_URL}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")


@router.get("/public-key")
async def get_signing_public_key():
    """
    Get the public key for Activepieces to verify JWTs.
    
    This endpoint should be called during Activepieces setup to register
    the signing key.
    """
    try:
        key_id, public_key = get_public_key()
        return {
            "keyId": key_id,
            "publicKey": public_key
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get public key: {str(e)}")


@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_to_activepieces(request: Request, path: str):
    """
    Proxy requests to the Activepieces API.
    
    This allows Bronn frontend to communicate with Activepieces
    through the Bronn backend, maintaining security boundaries.
    """
    # Build the target URL
    target_url = f"{ACTIVEPIECES_URL}/v1/{path}"
    
    # Get query parameters
    query_params = dict(request.query_params)
    
    # Get headers (forward most, but not host)
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ["host", "content-length"]:
            headers[key] = value
    
    # Get body if present
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                params=query_params,
                headers=headers,
                content=body
            )
            
            # Return the proxied response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to Activepieces: {str(e)}"
        )


# Flow-specific endpoints for convenience

@router.get("/flows")
async def list_flows(request: Request):
    """List all flows for the current project."""
    return await proxy_to_activepieces(request, "flows")


@router.post("/flows")
async def create_flow(request: Request):
    """Create a new flow."""
    return await proxy_to_activepieces(request, "flows")


@router.get("/flows/{flow_id}")
async def get_flow(request: Request, flow_id: str):
    """Get a specific flow."""
    return await proxy_to_activepieces(request, f"flows/{flow_id}")


@router.post("/flows/{flow_id}/test")
async def test_flow(request: Request, flow_id: str):
    """Execute a test run of a flow."""
    return await proxy_to_activepieces(request, f"flows/{flow_id}/test")


@router.get("/flow-runs")
async def list_flow_runs(request: Request):
    """List flow runs."""
    return await proxy_to_activepieces(request, "flow-runs")


@router.get("/flow-runs/{run_id}")
async def get_flow_run(request: Request, run_id: str):
    """Get a specific flow run."""
    return await proxy_to_activepieces(request, f"flow-runs/{run_id}")


@router.get("/flow-runs/{run_id}/steps")
async def get_flow_run_steps(request: Request, run_id: str):
    """Get the execution steps/logs for a flow run."""
    return await proxy_to_activepieces(request, f"flow-runs/{run_id}/steps")
