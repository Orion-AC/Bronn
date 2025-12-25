"""
Activepieces Managed Authentication

Handles authentication between Bronn and Activepieces using the managed-auth
flow. Instead of creating users in Activepieces' native auth system, we:

1. Generate a JWT using Bronn's signing key (via signing_key.py)
2. Exchange the JWT with Activepieces' /v1/managed-authn/external-token endpoint
3. Get back an Activepieces session token

This approach:
- Keeps Bronn as the single source of truth for auth
- Works with AP_BRONN_AUTH_MODE=managed (native auth disabled)
- Aligns with Activepieces embedding spec v3
"""

import os
import httpx
from typing import Optional, Tuple

from auth.signing_key import create_activepieces_jwt


ACTIVEPIECES_URL = os.getenv("ACTIVEPIECES_URL", "")

# Check if Activepieces is available in this environment
_is_cloud_run = os.getenv("K_SERVICE") is not None
_has_local_ap_url = "activepieces:80" in ACTIVEPIECES_URL or "localhost" in ACTIVEPIECES_URL
ACTIVEPIECES_AVAILABLE = bool(ACTIVEPIECES_URL) and not (_is_cloud_run and _has_local_ap_url)


async def get_activepieces_session(
    user_id: str,
    project_id: str,
    first_name: str = "User",
    last_name: str = "",
    role: str = "EDITOR"
) -> Tuple[Optional[str], Optional[str]]:
    """
    Get an Activepieces session token using managed authentication.
    
    This is the PRIMARY and ONLY way to authenticate with Activepieces
    when AP_BRONN_AUTH_MODE=managed is set.
    
    Args:
        user_id: Bronn user ID (becomes externalUserId)
        project_id: Bronn project/workspace ID (becomes externalProjectId)
        first_name: User's first name
        last_name: User's last name
        role: User role (EDITOR, VIEWER, ADMIN)
    
    Returns:
        (token, error_message) tuple
    """
    if not ACTIVEPIECES_AVAILABLE:
        return None, "Activepieces not configured"
    
    try:
        # Step 1: Generate JWT using Bronn's signing key
        external_token = create_activepieces_jwt(
            user_id=user_id,
            project_id=project_id,
            first_name=first_name,
            last_name=last_name,
            role=role,
            expires_in_minutes=5
        )
        
        # Step 2: Exchange JWT for Activepieces session
        # NOTE: Activepieces nginx routes /api/* to the Node.js backend
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{ACTIVEPIECES_URL}/api/v1/managed-authn/external-token",
                json={"externalAccessToken": external_token}
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("token"), None
            else:
                error_detail = response.text[:200] if response.text else "Unknown error"
                return None, f"Managed auth failed: {response.status_code} - {error_detail}"
                
    except Exception as e:
        return None, f"Could not authenticate with Activepieces: {e}"


async def ensure_user_in_activepieces(
    user_id: str,
    project_id: str,
    first_name: str,
    last_name: str
) -> Optional[str]:
    """
    Ensure user can access Activepieces and return their session token.
    
    Uses managed auth - user is automatically created in Activepieces
    if they don't exist (handled by the managed-authn endpoint).
    """
    token, error = await get_activepieces_session(
        user_id=user_id,
        project_id=project_id,
        first_name=first_name,
        last_name=last_name
    )
    
    if error:
        print(f"Warning: Could not get Activepieces session: {error}")
    
    return token


# =============================================================================
# DEPRECATED: Legacy functions - DO NOT USE
# =============================================================================
# The following functions are kept for backward compatibility but will
# fail when AP_BRONN_AUTH_MODE=managed is set (which blocks native auth).

async def sync_user_to_activepieces(email: str, password: str, first_name: str, last_name: str) -> Tuple[bool, Optional[str]]:
    """DEPRECATED: Use get_activepieces_session() with managed auth instead."""
    print("Warning: sync_user_to_activepieces is deprecated and will fail with managed auth")
    return False, "Native auth is disabled - use managed auth"


async def get_activepieces_token(email: str, password: str) -> Tuple[Optional[str], Optional[str]]:
    """DEPRECATED: Use get_activepieces_session() with managed auth instead."""
    print("Warning: get_activepieces_token is deprecated and will fail with managed auth")
    return None, "Native auth is disabled - use managed auth"

