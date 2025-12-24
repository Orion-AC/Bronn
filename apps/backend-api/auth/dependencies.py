"""
Authentication Dependencies

Common dependencies for FastAPI routes to handle Firebase authentication.
"""

from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from database import get_db, set_db_context
from auth.firebase_auth import verify_firebase_token
from models.user import User

async def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from a Firebase ID token.
    
    Verifies the token, fetches/syncs the user to the database, and sets
    the database context for RLS/Auditing.
    """
    # Extract token from "Bearer <token>"
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    # Verify with Firebase
    decoded = verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    firebase_uid = decoded["uid"]
    email = decoded.get("email", "")
    
    # Find user in database
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not user:
        # Auto-provision user on first access if they authenticated with Firebase
        from datetime import datetime
        user = User.from_firebase_token(decoded)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Set DB context for RLS and auditing
    # Default to 'default' tenant if not specified in claims
    tenant_id = decoded.get("tenant_id", "default")
    set_db_context(db, tenant_id, user.email)
    
    return user
