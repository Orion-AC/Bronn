"""
Firebase Authentication Module

Handles Firebase Admin SDK initialization and token verification.
Integrates with Google Cloud Run and Cloud SQL.
"""

import os
import firebase_admin
from firebase_admin import auth, credentials
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Track initialization state
_firebase_initialized = False


def init_firebase() -> bool:
    """
    Initialize Firebase Admin SDK with appropriate credentials.
    
    Works with:
    - Local development: GOOGLE_APPLICATION_CREDENTIALS env var
    - Cloud Run: Application Default Credentials
    
    Returns True if initialization successful.
    """
    global _firebase_initialized
    
    if _firebase_initialized or firebase_admin._apps:
        return True
    
    try:
        # Check for explicit service account file
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        if cred_path and os.path.exists(cred_path):
            logger.info(f"Initializing Firebase with service account: {cred_path}")
            cred = credentials.Certificate(cred_path)
        else:
            # Use default credentials (works on Cloud Run automatically)
            logger.info("Initializing Firebase with Application Default Credentials")
            cred = credentials.ApplicationDefault()
        
        firebase_admin.initialize_app(cred, {
            'projectId': os.getenv('GCP_PROJECT_ID', 'salesos-473014')
        })
        
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return False


def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token.
    
    Args:
        id_token: The Firebase ID token from the client
        
    Returns:
        Decoded token payload if valid, None otherwise.
        Payload includes: uid, email, email_verified, name, picture, etc.
    """
    if not init_firebase():
        logger.error("Firebase not initialized, cannot verify token")
        return None
    
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(id_token)
        logger.debug(f"Token verified for user: {decoded_token.get('email')}")
        return decoded_token
        
    except auth.ExpiredIdTokenError:
        logger.warning("Token has expired")
        return None
    except auth.RevokedIdTokenError:
        logger.warning("Token has been revoked")
        return None
    except auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None


def get_firebase_user(uid: str) -> Optional[Dict[str, Any]]:
    """
    Get Firebase user by UID.
    
    Returns user data dict or None if not found.
    """
    if not init_firebase():
        return None
    
    try:
        user = auth.get_user(uid)
        return {
            'uid': user.uid,
            'email': user.email,
            'email_verified': user.email_verified,
            'display_name': user.display_name,
            'photo_url': user.photo_url,
            'disabled': user.disabled,
            'provider_data': [
                {'provider_id': p.provider_id, 'email': p.email}
                for p in user.provider_data
            ]
        }
    except auth.UserNotFoundError:
        logger.warning(f"User not found: {uid}")
        return None
    except Exception as e:
        logger.error(f"Failed to get user: {e}")
        return None


def get_firebase_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get Firebase user by email.
    
    Returns user data dict or None if not found.
    """
    if not init_firebase():
        return None
    
    try:
        user = auth.get_user_by_email(email)
        return {
            'uid': user.uid,
            'email': user.email,
            'email_verified': user.email_verified,
            'display_name': user.display_name,
            'photo_url': user.photo_url,
            'disabled': user.disabled
        }
    except auth.UserNotFoundError:
        return None
    except Exception as e:
        logger.error(f"Failed to get user by email: {e}")
        return None


def create_firebase_user(
    email: str,
    password: str,
    display_name: Optional[str] = None
) -> Optional[str]:
    """
    Create a new Firebase user.
    
    Args:
        email: User's email address
        password: User's password
        display_name: Optional display name
        
    Returns:
        Firebase UID if successful, None otherwise.
    """
    if not init_firebase():
        return None
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name or email.split('@')[0],
            email_verified=False
        )
        logger.info(f"Created Firebase user: {user.uid}")
        return user.uid
        
    except auth.EmailAlreadyExistsError:
        logger.warning(f"User already exists: {email}")
        # Return existing user's UID
        existing = get_firebase_user_by_email(email)
        return existing.get('uid') if existing else None
    except Exception as e:
        logger.error(f"Failed to create user: {e}")
        return None


def update_firebase_user(
    uid: str,
    email: Optional[str] = None,
    password: Optional[str] = None,
    display_name: Optional[str] = None,
    disabled: Optional[bool] = None
) -> bool:
    """
    Update a Firebase user.
    
    Returns True if successful.
    """
    if not init_firebase():
        return False
    
    try:
        update_args = {}
        if email is not None:
            update_args['email'] = email
        if password is not None:
            update_args['password'] = password
        if display_name is not None:
            update_args['display_name'] = display_name
        if disabled is not None:
            update_args['disabled'] = disabled
        
        if update_args:
            auth.update_user(uid, **update_args)
            logger.info(f"Updated Firebase user: {uid}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        return False


def delete_firebase_user(uid: str) -> bool:
    """
    Delete a Firebase user by UID.
    
    Returns True if successful.
    """
    if not init_firebase():
        return False
    
    try:
        auth.delete_user(uid)
        logger.info(f"Deleted Firebase user: {uid}")
        return True
    except auth.UserNotFoundError:
        logger.warning(f"User not found for deletion: {uid}")
        return True  # Already deleted
    except Exception as e:
        logger.error(f"Failed to delete user: {e}")
        return False


def create_custom_token(uid: str, claims: Optional[Dict] = None) -> Optional[str]:
    """
    Create a custom token for a user.
    
    Useful for creating tokens for server-side authentication.
    
    Args:
        uid: User's Firebase UID
        claims: Optional custom claims to include
        
    Returns:
        Custom token string or None.
    """
    if not init_firebase():
        return None
    
    try:
        token = auth.create_custom_token(uid, claims or {})
        return token.decode('utf-8') if isinstance(token, bytes) else token
    except Exception as e:
        logger.error(f"Failed to create custom token: {e}")
        return None


def set_custom_claims(uid: str, claims: Dict) -> bool:
    """
    Set custom claims on a Firebase user.
    
    Custom claims are included in the ID token and can be used
    for role-based access control.
    
    Args:
        uid: User's Firebase UID
        claims: Claims dict (e.g., {'admin': True, 'tenant_id': 'abc'})
        
    Returns:
        True if successful.
    """
    if not init_firebase():
        return False
    
    try:
        auth.set_custom_user_claims(uid, claims)
        logger.info(f"Set custom claims for user {uid}: {claims}")
        return True
    except Exception as e:
        logger.error(f"Failed to set custom claims: {e}")
        return False


# Initialize Firebase on module import
init_firebase()
