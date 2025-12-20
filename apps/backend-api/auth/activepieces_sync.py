"""
Activepieces User Sync and SSO

Handles syncing users between Bronn and Activepieces,
and provides SSO login tokens.
"""

import os
import httpx
from typing import Optional, Tuple


ACTIVEPIECES_URL = os.getenv("ACTIVEPIECES_URL", "http://activepieces:80")


async def sync_user_to_activepieces(email: str, password: str, first_name: str, last_name: str) -> Tuple[bool, Optional[str]]:
    """
    Create or update a user in Activepieces.
    Returns (success, error_message)
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Try to sign up the user in Activepieces
            response = await client.post(
                f"{ACTIVEPIECES_URL}/v1/authentication/sign-up",
                json={
                    "email": email,
                    "password": password,
                    "firstName": first_name,
                    "lastName": last_name,
                    "trackEvents": False,
                    "newsLetter": False
                }
            )
            
            if response.status_code == 200 or response.status_code == 201:
                return True, None
            elif response.status_code == 409:
                # User already exists, that's fine
                return True, None
            else:
                return False, f"Failed to sync user: {response.status_code}"
        except Exception as e:
            # Don't fail Bronn registration if Activepieces is down
            print(f"Warning: Could not sync user to Activepieces: {e}")
            return True, None


async def get_activepieces_token(email: str, password: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Get an Activepieces access token for a user.
    Returns (token, error_message)
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(
                f"{ACTIVEPIECES_URL}/v1/authentication/sign-in",
                json={
                    "email": email,
                    "password": password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("token"), None
            else:
                return None, f"Invalid credentials for Activepieces"
        except Exception as e:
            return None, f"Could not connect to Activepieces: {e}"


async def ensure_user_in_activepieces(email: str, password: str, first_name: str, last_name: str) -> Optional[str]:
    """
    Ensure user exists in Activepieces and return their token.
    If user doesn't exist, create them first.
    """
    # First try to login
    token, _ = await get_activepieces_token(email, password)
    if token:
        return token
    
    # User doesn't exist, create them
    success, _ = await sync_user_to_activepieces(email, password, first_name, last_name)
    if not success:
        return None
    
    # Now login again
    token, _ = await get_activepieces_token(email, password)
    return token
