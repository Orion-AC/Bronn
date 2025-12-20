"""
Authentication Router

Handles login, register, and user session endpoints.
Also syncs users to Activepieces for SSO.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from typing import Optional

from ..auth.users import (
    login_user,
    register_user,
    get_current_user,
    authenticate_user,
    users_db
)
from ..auth.signing_key import create_activepieces_jwt
from ..auth.activepieces_sync import (
    sync_user_to_activepieces,
    get_activepieces_token,
    ensure_user_in_activepieces
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Store passwords temporarily for SSO (in production, use secure session storage)
user_passwords = {}


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    activepieces_token: Optional[str] = None


@router.post("/login")
async def login(request: LoginRequest):
    """Login with email and password."""
    result = login_user(request.email, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Store password for SSO (encrypted in production)
    user_passwords[request.email] = request.password
    
    # Get Activepieces token for SSO
    user = result["user"]
    ap_token = await ensure_user_in_activepieces(
        request.email,
        request.password,
        user["first_name"],
        user["last_name"]
    )
    
    result["activepieces_token"] = ap_token
    return result


@router.post("/register")
async def register(request: RegisterRequest):
    """Register a new user."""
    try:
        user = register_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name
        )
        
        # Sync user to Activepieces
        await sync_user_to_activepieces(
            request.email,
            request.password,
            request.first_name,
            request.last_name
        )
        
        # Store password for SSO
        user_passwords[request.email] = request.password
        
        # Auto-login after registration
        result = login_user(request.email, request.password)
        
        # Get Activepieces token
        ap_token = await get_activepieces_token(request.email, request.password)
        result["activepieces_token"] = ap_token[0] if ap_token[0] else None
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """Get current user info."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user


@router.get("/activepieces-token")
async def get_ap_token(authorization: Optional[str] = Header(None)):
    """Get Activepieces access token for the current user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    email = user["email"]
    password = user_passwords.get(email)
    
    if not password:
        raise HTTPException(
            status_code=400, 
            detail="Session expired. Please login again to access Activepieces."
        )
    
    # Get Activepieces token
    ap_token = await ensure_user_in_activepieces(
        email,
        password,
        user["first_name"],
        user["last_name"]
    )
    
    if not ap_token:
        raise HTTPException(
            status_code=500,
            detail="Could not authenticate with Activepieces"
        )
    
    return {
        "token": ap_token,
        "redirect_url": f"http://localhost:8080"
    }
