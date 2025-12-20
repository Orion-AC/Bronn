"""
User Authentication Module

Handles user registration, login, and session management.
Also syncs users to Activepieces.
"""

import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Simple in-memory user store (replace with database in production)
users_db = {
    "dev@ap.com": {
        "email": "dev@ap.com",
        "password_hash": hashlib.sha256("12345678".encode()).hexdigest(),
        "first_name": "Dev",
        "last_name": "User",
        "created_at": datetime.utcnow().isoformat()
    }
}

# Session store
sessions = {}


def hash_password(password: str) -> str:
    """Hash a password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return hash_password(password) == password_hash


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token and return the payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def register_user(email: str, password: str, first_name: str, last_name: str) -> dict:
    """Register a new user."""
    if email in users_db:
        raise ValueError("User already exists")
    
    users_db[email] = {
        "email": email,
        "password_hash": hash_password(password),
        "first_name": first_name,
        "last_name": last_name,
        "created_at": datetime.utcnow().isoformat()
    }
    return {"email": email, "first_name": first_name, "last_name": last_name}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate a user and return user data if valid."""
    user = users_db.get(email)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return {
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"]
    }


def login_user(email: str, password: str) -> Optional[dict]:
    """Login a user and return access token."""
    user = authenticate_user(email, password)
    if not user:
        return None
    
    access_token = create_access_token(
        data={"sub": user["email"], "email": user["email"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


def get_current_user(token: str) -> Optional[dict]:
    """Get the current user from a token."""
    payload = verify_token(token)
    if not payload:
        return None
    
    email = payload.get("email")
    if not email:
        return None
    
    user = users_db.get(email)
    if not user:
        return None
    
    return {
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"]
    }
