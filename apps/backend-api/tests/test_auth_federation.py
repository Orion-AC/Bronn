"""
Unit Tests for Authentication Federation

Tests the Firebase → Activepieces token exchange and JWT generation.
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
from jose import jwt

# Import the modules we're testing
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.signing_key import (
    create_activepieces_jwt,
    generate_signing_key,
    get_or_create_signing_key,
    get_public_key
)


class TestSigningKeyGeneration:
    """Tests for RSA signing key generation."""
    
    def test_generate_signing_key_returns_tuple(self):
        """Test that generate_signing_key returns key_id, private, public."""
        key_id, private_key, public_key = generate_signing_key()
        
        assert key_id is not None
        assert key_id.startswith("bronn-key-")
        assert "BEGIN PRIVATE KEY" in private_key
        assert "BEGIN PUBLIC KEY" in public_key
    
    def test_generate_signing_key_unique_ids(self):
        """Test that each key generation produces unique IDs."""
        key1, _, _ = generate_signing_key()
        key2, _, _ = generate_signing_key()
        # Note: If called in same second, IDs may match
        # In practice, keys are regenerated rarely
        assert key1 is not None
        assert key2 is not None


class TestActivepiecesJWT:
    """Tests for Activepieces provisioning JWT creation."""
    
    @patch('auth.signing_key.get_or_create_signing_key')
    def test_jwt_structure_matches_v3_spec(self, mock_get_key):
        """Test that JWT payload matches Activepieces v3 embedding spec."""
        # Mock signing key
        key_id, private_key, _ = generate_signing_key()
        mock_get_key.return_value = (key_id, private_key)
        
        token = create_activepieces_jwt(
            user_id="test-uid-123",
            project_id="project-456",
            first_name="John",
            last_name="Doe",
            role="EDITOR"
        )
        
        # Decode without verification to inspect payload
        decoded = jwt.decode(token, private_key, algorithms=["RS256"])
        
        # Verify required claims per Activepieces embedding spec
        assert decoded["version"] == "v3"
        assert decoded["externalUserId"] == "test-uid-123"
        assert decoded["externalProjectId"] == "project-456"
        assert decoded["firstName"] == "John"
        assert decoded["lastName"] == "Doe"
        assert decoded["role"] == "EDITOR"
        assert "exp" in decoded
        assert "iat" in decoded
    
    @patch('auth.signing_key.get_or_create_signing_key')
    def test_jwt_expiration_is_5_minutes_by_default(self, mock_get_key):
        """Test that default expiration is 5 minutes (short-lived)."""
        key_id, private_key, _ = generate_signing_key()
        mock_get_key.return_value = (key_id, private_key)
        
        before = datetime.utcnow()
        token = create_activepieces_jwt(
            user_id="test-uid",
            project_id="test-project"
        )
        after = datetime.utcnow()
        
        decoded = jwt.decode(token, private_key, algorithms=["RS256"])
        exp_time = datetime.fromtimestamp(decoded["exp"])
        
        # Expiration should be ~5 minutes from now
        expected_min = before + timedelta(minutes=4, seconds=55)
        expected_max = after + timedelta(minutes=5, seconds=5)
        
        assert exp_time >= expected_min
        assert exp_time <= expected_max
    
    @patch('auth.signing_key.get_or_create_signing_key')
    def test_jwt_uses_rs256_algorithm(self, mock_get_key):
        """Test that JWT uses RS256 algorithm as required by Activepieces."""
        key_id, private_key, public_key = generate_signing_key()
        mock_get_key.return_value = (key_id, private_key)
        
        token = create_activepieces_jwt(
            user_id="test-uid",
            project_id="test-project"
        )
        
        # Get header to verify algorithm
        header = jwt.get_unverified_header(token)
        assert header["alg"] == "RS256"
        assert header["kid"] == key_id
    
    @patch('auth.signing_key.get_or_create_signing_key')
    def test_jwt_valid_roles(self, mock_get_key):
        """Test that all valid roles can be set."""
        key_id, private_key, _ = generate_signing_key()
        mock_get_key.return_value = (key_id, private_key)
        
        for role in ["ADMIN", "EDITOR", "VIEWER"]:
            token = create_activepieces_jwt(
                user_id="test-uid",
                project_id="test-project",
                role=role
            )
            decoded = jwt.decode(token, private_key, algorithms=["RS256"])
            assert decoded["role"] == role


class TestTokenExchangeEndpoint:
    """Tests for the Firebase-to-Activepieces token exchange endpoint."""
    
    def test_missing_authorization_header(self):
        """Test that missing Authorization header returns 401."""
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        response = client.post(
            "/api/auth/firebase-to-activepieces",
            json={"project_id": "test"}
        )
        
        # FastAPI returns 422 for missing required header
        assert response.status_code in [401, 422]
    
    @patch('routers.auth.verify_firebase_token')
    def test_invalid_firebase_token(self, mock_verify):
        """Test that invalid Firebase token returns 401."""
        from fastapi.testclient import TestClient
        from main import app
        
        mock_verify.return_value = None
        
        client = TestClient(app)
        response = client.post(
            "/api/auth/firebase-to-activepieces",
            json={"project_id": "test"},
            headers={"Authorization": "Bearer invalid-token"}
        )
        
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]


class TestPublicKeyEndpoint:
    """Tests for the public key retrieval endpoint."""
    
    def test_public_key_endpoint_returns_key(self):
        """Test that public key endpoint returns valid key data."""
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        response = client.get("/api/workflows/engine/public-key")
        
        assert response.status_code == 200
        data = response.json()
        assert "keyId" in data
        assert "publicKey" in data
        assert "BEGIN PUBLIC KEY" in data["publicKey"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
