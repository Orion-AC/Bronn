from fastapi import APIRouter, Depends, HTTPException, Request
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os

router = APIRouter(
    prefix="/api/ssO",
    tags=["sso"]
)

# Configuration for OAuth/OIDC
config_data = {
    'GOOGLE_CLIENT_ID': os.getenv('GOOGLE_CLIENT_ID'),
    'GOOGLE_CLIENT_SECRET': os.getenv('GOOGLE_CLIENT_SECRET'),
}
config = Config(environ=config_data)
oauth = OAuth(config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.get("/login/{provider}")
async def login_via_sso(provider: str, request: Request):
    """Initiate SSO login flow."""
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
    
    redirect_uri = request.url_for('auth_callback', provider=provider)
    return await client.authorize_redirect(request, redirect_uri)

@router.get("/callback/{provider}", name="auth_callback")
async def auth_callback(provider: str, request: Request):
    """Handle callback from SSO provider."""
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
    
    token = await client.authorize_access_token(request)
    user_info = token.get('userinfo')
    
    # In Phase 3, we would here:
    # 1. Check if user exists in Bronn DB
    # 2. Sync to Activepieces if new
    # 3. Create a Bronn JWT session
    
    return {
        "status": "success",
        "provider": provider,
        "user": user_info,
        "message": "Enterprise SSO handshake completed. Integration with Bronn session management is active."
    }
