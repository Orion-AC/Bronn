"""
Activepieces Authentication - Signing Key Management

This module handles RSA key generation and JWT token creation
for authenticating Bronn users with the embedded Activepieces instance.
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from jose import jwt

# Directory to store signing keys
KEYS_DIR = Path(os.getenv("SIGNING_KEYS_DIR", "/app/data/keys"))


def ensure_keys_dir():
    """Ensure the keys directory exists."""
    KEYS_DIR.mkdir(parents=True, exist_ok=True)


def generate_signing_key() -> tuple[str, str, str]:
    """
    Generate a new RSA key pair for signing Activepieces JWTs.
    
    Returns:
        Tuple of (key_id, private_key_pem, public_key_pem)
    """
    # Generate RSA key pair
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Serialize private key to PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    # Serialize public key to PEM format
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    # Generate a unique key ID
    key_id = f"bronn-key-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    return key_id, private_pem, public_pem


def get_or_create_signing_key() -> tuple[str, str]:
    """
    Get the current signing key or create one if it doesn't exist.
    
    Returns:
        Tuple of (key_id, private_key_pem)
    """
    ensure_keys_dir()
    key_file = KEYS_DIR / "current_key.json"
    
    if key_file.exists():
        with open(key_file, "r") as f:
            data = json.load(f)
            return data["key_id"], data["private_key"]
    
    # Generate new key
    key_id, private_pem, public_pem = generate_signing_key()
    
    # Save key
    with open(key_file, "w") as f:
        json.dump({
            "key_id": key_id,
            "private_key": private_pem,
            "public_key": public_pem,
            "created_at": datetime.utcnow().isoformat()
        }, f, indent=2)
    
    return key_id, private_pem


def create_activepieces_jwt(
    user_id: str,
    project_id: str,
    first_name: str = "User",
    last_name: str = "",
    role: str = "EDITOR",
    expires_in_hours: int = 24
) -> str:
    """
    Create a JWT token for Activepieces authentication.
    
    Args:
        user_id: The Bronn user ID (will be externalUserId in AP)
        project_id: The Bronn workspace/project ID (will be externalProjectId in AP)
        first_name: User's first name
        last_name: User's last name
        role: User role - EDITOR, VIEWER, or ADMIN
        expires_in_hours: Token expiration time
        
    Returns:
        Signed JWT token string
    """
    key_id, private_key = get_or_create_signing_key()
    
    # Calculate expiration
    exp = datetime.utcnow() + timedelta(hours=expires_in_hours)
    
    # Build payload according to Activepieces embedding spec
    payload = {
        "version": "v3",
        "externalUserId": user_id,
        "externalProjectId": project_id,
        "firstName": first_name,
        "lastName": last_name,
        "role": role,
        "piecesFilterType": "NONE",
        "exp": int(exp.timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }
    
    # Sign the token with RS256
    token = jwt.encode(
        payload,
        private_key,
        algorithm="RS256",
        headers={"kid": key_id}
    )
    
    return token


def get_public_key() -> tuple[str, str]:
    """
    Get the public key for Activepieces to verify JWTs.
    
    Returns:
        Tuple of (key_id, public_key_pem)
    """
    ensure_keys_dir()
    key_file = KEYS_DIR / "current_key.json"
    
    if not key_file.exists():
        # Generate key if it doesn't exist
        get_or_create_signing_key()
    
    with open(key_file, "r") as f:
        data = json.load(f)
        return data["key_id"], data["public_key"]
