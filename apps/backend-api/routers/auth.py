"""
Authentication Router

Handles Firebase Auth token verification and user session management.
Syncs Firebase users to Cloud SQL database.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from database import get_db
from auth.firebase_auth import (
    verify_firebase_token,
    create_firebase_user,
    get_firebase_user_by_email
)
from models.user import User
from auth.signing_key import create_activepieces_jwt
from auth.activepieces_sync import (
    sync_user_to_activepieces,
    get_activepieces_token,
    ensure_user_in_activepieces
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# =============================================================================
# Request/Response Models
# =============================================================================

class VerifyTokenRequest(BaseModel):
    """Request to verify a Firebase ID token."""
    id_token: str


class RegisterRequest(BaseModel):
    """Request to register a new user (creates in Firebase and syncs to DB)."""
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserResponse(BaseModel):
    """User data response."""
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    display_name: Optional[str]
    avatar_url: Optional[str]
    is_admin: bool = False


class AuthResponse(BaseModel):
    """Authentication response with user data."""
    user: UserResponse
    valid: bool
    activepieces_token: Optional[str] = None


# =============================================================================
# Firebase Token Verification
# =============================================================================

@router.post("/verify-token", response_model=AuthResponse)
async def verify_token(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """
    Verify a Firebase ID token and sync user to database.
    
    This is the main authentication endpoint. The frontend should:
    1. Authenticate with Firebase (signInWithEmailAndPassword, etc.)
    2. Get the ID token from Firebase
    3. Call this endpoint with the token
    4. Receive user data and optional Activepieces token
    """
    # Extract token from "Bearer <token>"
    token = authorization.replace("Bearer ", "").strip()
    
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    # Verify with Firebase
    decoded = verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    firebase_uid = decoded["uid"]
    email = decoded.get("email", "")
    
    # Find or create user in database
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not user:
        # First time login - create user in database
        user = User.from_firebase_token(decoded)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update last login time
        user.last_login_at = datetime.utcnow()
        
        # Update profile from Firebase if changed
        if decoded.get("picture") and user.avatar_url != decoded.get("picture"):
            user.avatar_url = decoded.get("picture")
        if decoded.get("name") and user.display_name != decoded.get("name"):
            user.display_name = decoded.get("name")
        
        db.commit()
    
    # Get Activepieces token for SSO (optional, may fail if not configured)
    ap_token = None
    try:
        # For Activepieces SSO, we need to ensure user exists there too
        ap_token = await ensure_user_in_activepieces(
            email=email,
            password=firebase_uid[:16],  # Use part of Firebase UID as password
            first_name=user.first_name or "",
            last_name=user.last_name or ""
        )
    except Exception as e:
        # Don't fail auth if Activepieces sync fails
        print(f"Activepieces sync warning: {e}")
    
    return AuthResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            is_admin=user.is_admin
        ),
        valid=True,
        activepieces_token=ap_token
    )


# =============================================================================
# Server-side User Registration (Optional)
# =============================================================================

@router.post("/register")
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user via server-side Firebase Admin SDK.
    
    Note: Typically, user registration should be done client-side using
    Firebase Auth SDK. This endpoint is for cases where server-side
    registration is needed (e.g., admin creating users).
    """
    # Check if user already exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user in Firebase
    display_name = f"{request.first_name or ''} {request.last_name or ''}".strip()
    firebase_uid = create_firebase_user(
        email=request.email,
        password=request.password,
        display_name=display_name or None
    )
    
    if not firebase_uid:
        raise HTTPException(status_code=500, detail="Failed to create user in Firebase")
    
    # Create user in database
    user = User(
        firebase_uid=firebase_uid,
        email=request.email,
        first_name=request.first_name,
        last_name=request.last_name,
        display_name=display_name or request.email.split('@')[0]
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Sync to Activepieces
    try:
        await sync_user_to_activepieces(
            request.email,
            request.password,
            request.first_name or "",
            request.last_name or ""
        )
    except Exception as e:
        print(f"Activepieces sync warning: {e}")
    
    return {
        "message": "User registered successfully",
        "user": user.to_dict()
    }


# =============================================================================
# Get Current User
# =============================================================================

@router.get("/me")
async def get_me(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get current user info from Firebase token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Verify with Firebase
    decoded = verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user = db.query(User).filter(User.firebase_uid == decoded["uid"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    return user.to_dict()


# =============================================================================
# Activepieces Token (for SSO)
# =============================================================================

@router.get("/activepieces-token")
async def get_ap_token(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Get Activepieces access token for the current user.
    
    Used for SSO between Bronn and Activepieces.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Verify with Firebase
    decoded = verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user = db.query(User).filter(User.firebase_uid == decoded["uid"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get Activepieces token
    try:
        ap_token = await ensure_user_in_activepieces(
            email=user.email,
            password=decoded["uid"][:16],
            first_name=user.first_name or "",
            last_name=user.last_name or ""
        )
        
        if not ap_token:
            raise HTTPException(
                status_code=500,
                detail="Could not authenticate with Activepieces"
            )
        
        return {
            "token": ap_token,
            "redirect_url": "http://localhost:8080"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Activepieces authentication failed: {str(e)}"
        )


# =============================================================================
# Health Check
# =============================================================================

@router.get("/health")
async def auth_health():
    """Check if auth service is healthy."""
    return {"status": "healthy", "service": "auth"}
