#!/bin/sh
set -e

# =============================================================================
# Activepieces Container Entrypoint (Bronn White-Label)
# =============================================================================
# Key Features:
# - Fail-fast secret validation (prevents silent crashes)
# - Startup health gate (Node.js must be ready before nginx accepts traffic)
# - Cloud SQL socket detection
# =============================================================================

# Set default values for Bronn white-label deployment
export AP_APP_TITLE="${AP_APP_TITLE:-Bronn Workflows}"
export AP_FAVICON_URL="${AP_FAVICON_URL:-/favicon.ico}"

# Set default PORT for Cloud Run (Cloud Run sets this, but default to 8080 for local)
export PORT="${PORT:-8080}"

# =============================================================================
# Debug: Print environment variables
# =============================================================================
echo "=== Activepieces Container Starting ==="
echo "AP_APP_TITLE: $AP_APP_TITLE"
echo "AP_FAVICON_URL: $AP_FAVICON_URL"
echo "PORT: $PORT"
echo "AP_POSTGRES_HOST: ${AP_POSTGRES_HOST:-not set}"
echo "AP_POSTGRES_DATABASE: ${AP_POSTGRES_DATABASE:-not set}"
echo "AP_DATABASE_TYPE: ${AP_DATABASE_TYPE:-not set}"
echo "AP_QUEUE_MODE: ${AP_QUEUE_MODE:-not set}"
echo "AP_EXECUTION_MODE: ${AP_EXECUTION_MODE:-not set}"

# =============================================================================
# CRITICAL: Fail-fast secret validation
# =============================================================================
# These secrets are REQUIRED. If missing or invalid, Node.js will crash silently.
# We fail fast here with a clear error message instead.

if [ -z "$AP_ENCRYPTION_KEY" ]; then
    echo "=============================================="
    echo "FATAL: AP_ENCRYPTION_KEY is not set!"
    echo "Generate with: openssl rand -hex 16"
    echo "=============================================="
    exit 1
fi

# Validate AP_ENCRYPTION_KEY is exactly 32 hex characters (16 bytes)
KEY_LENGTH=$(printf '%s' "$AP_ENCRYPTION_KEY" | wc -c | tr -d ' ')
if [ "$KEY_LENGTH" -ne 32 ]; then
    echo "=============================================="
    echo "FATAL: AP_ENCRYPTION_KEY must be exactly 32 hex characters"
    echo "Current length: $KEY_LENGTH characters"
    echo "Generate with: openssl rand -hex 16"
    echo "=============================================="
    exit 1
fi

if [ -z "$AP_JWT_SECRET" ]; then
    echo "=============================================="
    echo "FATAL: AP_JWT_SECRET is not set!"
    echo "Generate with: openssl rand -hex 32"
    echo "=============================================="
    exit 1
fi

echo "✓ Secret validation passed"

# =============================================================================
# Process Environment Variables in Config Files
# =============================================================================
# Process environment variables in index.html BEFORE starting services
envsubst '${AP_APP_TITLE} ${AP_FAVICON_URL}' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp && \
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# Process nginx config with PORT variable
envsubst '${PORT}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp && \
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf

# =============================================================================
# Wait for Cloud SQL socket if using Unix socket
# =============================================================================
if echo "$AP_POSTGRES_HOST" | grep -q "^/cloudsql/"; then
    echo "Waiting for Cloud SQL socket at $AP_POSTGRES_HOST..."
    SOCKET_PATH="${AP_POSTGRES_HOST}/.s.PGSQL.5432"
    MAX_WAIT=60
    WAITED=0
    while [ ! -S "$SOCKET_PATH" ] && [ $WAITED -lt $MAX_WAIT ]; do
        echo "  Socket not ready yet, waiting... ($WAITED/$MAX_WAIT seconds)"
        sleep 2
        WAITED=$((WAITED + 2))
    done
    if [ -S "$SOCKET_PATH" ]; then
        echo "✓ Cloud SQL socket is ready!"
    else
        echo "WARNING: Cloud SQL socket not found after ${MAX_WAIT}s, proceeding anyway..."
        ls -la "$AP_POSTGRES_HOST/" 2>/dev/null || echo "Cannot list socket directory"
    fi
fi

# =============================================================================
# STARTUP HEALTH GATE: Start Node.js FIRST, then Nginx
# =============================================================================
# This prevents 502 errors by ensuring Node.js is ready before nginx accepts traffic.

echo "=== Starting Node.js Backend ==="
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"

# Check if main.cjs exists
if [ ! -f "dist/packages/server/api/main.cjs" ]; then
    echo "FATAL: main.cjs not found!"
    ls -la dist/packages/server/ 2>&1
    exit 1
fi

echo "=== Key Config ==="
echo "AP_DATABASE_TYPE: ${AP_DATABASE_TYPE:-not set}"
echo "AP_POSTGRES_HOST: ${AP_POSTGRES_HOST:-not set}"
echo "AP_QUEUE_MODE: ${AP_QUEUE_MODE:-not set}"
echo "AP_EXECUTION_MODE: ${AP_EXECUTION_MODE:-not set}"
echo "AP_CONTAINER_TYPE: ${AP_CONTAINER_TYPE:-not set}"
echo "=================="

# Start Node.js in BACKGROUND first
echo "Starting Node.js process..."
node \
    --enable-source-maps \
    --max-old-space-size=1536 \
    --trace-uncaught \
    --unhandled-rejections=strict \
    dist/packages/server/api/main.cjs 2>&1 &
NODE_PID=$!

echo "Node.js started with PID $NODE_PID"

# =============================================================================
# Wait for Node.js to be ready (health gate)
# =============================================================================
MAX_WAIT=120
WAITED=0
echo "Waiting for Node.js health endpoint..."

while true; do
    # Check if Node.js process is still alive
    if ! kill -0 $NODE_PID 2>/dev/null; then
        echo "=============================================="
        echo "FATAL: Node.js crashed during startup!"
        echo "Check logs above for error details."
        echo "=============================================="
        exit 1
    fi
    
    # Try the health endpoint
    if curl -sf http://localhost:3000/v1/health >/dev/null 2>&1; then
        echo "✓ Node.js is ready on port 3000 (took ${WAITED}s)"
        break
    fi
    
    # Timeout check
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "=============================================="
        echo "FATAL: Node.js did not become ready within ${MAX_WAIT}s"
        echo "Killing process and exiting..."
        echo "=============================================="
        kill $NODE_PID 2>/dev/null || true
        exit 1
    fi
    
    echo "  Waiting for Node.js... ($WAITED/${MAX_WAIT}s)"
    sleep 3
    WAITED=$((WAITED + 3))
done

# =============================================================================
# NOW start Nginx (traffic can be served safely)
# =============================================================================
echo "=== Starting Nginx on port $PORT ==="
echo "Node.js is confirmed ready - now accepting traffic"

# Trap to cleanup Node.js if nginx exits
trap "kill $NODE_PID 2>/dev/null || true" EXIT INT TERM

# Run nginx in foreground (main process)
exec nginx -g "daemon off;"