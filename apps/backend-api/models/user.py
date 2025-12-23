"""
User Model for Cloud SQL

SQLAlchemy model for storing user data synced from Firebase Auth.
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text, Index
from sqlalchemy.sql import func
from database import Base
import uuid


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


class User(Base):
    """
    User model for storing user profile data.
    
    The primary authentication is handled by Firebase Auth.
    This model stores additional profile data and links to Firebase via firebase_uid.
    """
    __tablename__ = "users"
    
    # Primary key - our internal user ID
    id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Firebase UID - links to Firebase Auth
    firebase_uid = Column(String(128), unique=True, index=True, nullable=False)
    
    # User email - also stored in Firebase, but useful for queries
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    # Profile information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    display_name = Column(String(200), nullable=True)
    avatar_url = Column(Text, nullable=True)
    
    # Multi-tenancy support
    tenant_id = Column(String(36), index=True, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_users_tenant_active', 'tenant_id', 'is_active'),
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
    
    def to_dict(self) -> dict:
        """Convert user to dictionary for API responses."""
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "display_name": self.display_name or f"{self.first_name or ''} {self.last_name or ''}".strip(),
            "avatar_url": self.avatar_url,
            "tenant_id": self.tenant_id,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None
        }
    
    @classmethod
    def from_firebase_token(cls, token_data: dict, tenant_id: str = None) -> "User":
        """
        Create a User instance from Firebase token data.
        
        Args:
            token_data: Decoded Firebase ID token
            tenant_id: Optional tenant ID for multi-tenancy
            
        Returns:
            User instance (not yet committed to database)
        """
        # Parse display name into first/last name
        display_name = token_data.get('name', '')
        name_parts = display_name.split(' ', 1) if display_name else ['', '']
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        return cls(
            firebase_uid=token_data['uid'],
            email=token_data.get('email', ''),
            first_name=first_name,
            last_name=last_name,
            display_name=display_name,
            avatar_url=token_data.get('picture'),
            tenant_id=tenant_id,
            is_active=True
        )
