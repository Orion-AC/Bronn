#!/bin/sh
set -e

# Set default values for Bronn white-label deployment
export AP_APP_TITLE="${AP_APP_TITLE:-Bronn Workflows}"
export AP_FAVICON_URL="${AP_FAVICON_URL:-/favicon.ico}"

# Set default PORT for Cloud Run (Cloud Run sets this, but default to 8080 for local)
export PORT="${PORT:-8080}"

# Debug: Print environment variables
echo "=== Activepieces Container Starting ==="
echo "AP_APP_TITLE: $AP_APP_TITLE"
echo "AP_FAVICON_URL: $AP_FAVICON_URL"
echo "PORT: $PORT"
echo "AP_POSTGRES_HOST: ${AP_POSTGRES_HOST:-not set}"
echo "AP_POSTGRES_DATABASE: ${AP_POSTGRES_DATABASE:-not set}"
echo "AP_DATABASE_TYPE: ${AP_DATABASE_TYPE:-not set}"
echo "AP_QUEUE_MODE: ${AP_QUEUE_MODE:-not set}"
echo "AP_EXECUTION_MODE: ${AP_EXECUTION_MODE:-not set}"

# Check required secrets
if [ -z "$AP_ENCRYPTION_KEY" ]; then
    echo "ERROR: AP_ENCRYPTION_KEY is not set! Node.js will crash."
fi
if [ -z "$AP_JWT_SECRET" ]; then
    echo "WARNING: AP_JWT_SECRET is not set"
fi

# Process environment variables in index.html BEFORE starting services
envsubst '${AP_APP_TITLE} ${AP_FAVICON_URL}' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp && \
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# Process nginx config with PORT variable
envsubst '${PORT}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp && \
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf

# Wait for Cloud SQL socket if using Unix socket
if echo "$AP_POSTGRES_HOST" | grep -q "^/cloudsql/"; then
    echo "Waiting for Cloud SQL socket at $AP_POSTGRES_HOST..."
    SOCKET_PATH="${AP_POSTGRES_HOST}/.s.PGSQL.5432"
    MAX_WAIT=30
    WAITED=0
    while [ ! -S "$SOCKET_PATH" ] && [ $WAITED -lt $MAX_WAIT ]; do
        echo "  Socket not ready yet, waiting... ($WAITED/$MAX_WAIT seconds)"
        sleep 1
        WAITED=$((WAITED + 1))
    done
    if [ -S "$SOCKET_PATH" ]; then
        echo "Cloud SQL socket is ready!"
    else
        echo "WARNING: Cloud SQL socket not found after ${MAX_WAIT}s, proceeding anyway..."
        ls -la "$AP_POSTGRES_HOST/" 2>/dev/null || echo "Cannot list socket directory"
    fi
fi

# Start Nginx server in background
echo "Starting Nginx on port $PORT..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Give nginx a moment to start
sleep 1

# Start backend server
echo "=== Starting Node.js Backend ==="
if [ "$AP_CONTAINER_TYPE" = "APP" ] && [ "$AP_PM2_ENABLED" = "true" ]; then
    echo "Starting backend server with PM2 (APP mode)"
    pm2-runtime start dist/packages/server/api/main.cjs --name "activepieces-app" --node-args="--enable-source-maps" -i 0
else
    echo "Starting backend server with Node.js (WORKER mode or default)"
    echo "Working directory: $(pwd)"
    echo "Node version: $(node --version)"
    echo "Listing dist/packages/server/api/:"
    ls -la dist/packages/server/api/ 2>&1 | head -10
    
    # Check if main.cjs exists
    if [ ! -f "dist/packages/server/api/main.cjs" ]; then
        echo "ERROR: main.cjs not found!"
        ls -la dist/packages/server/ 2>&1
        exit 1
    fi
    
    # Print key AP_ environment variables for debugging (no secrets)
    echo "=== Key Config ==="
    echo "AP_DATABASE_TYPE: ${AP_DATABASE_TYPE:-not set}"
    echo "AP_POSTGRES_HOST: ${AP_POSTGRES_HOST:-not set}"
    echo "AP_QUEUE_MODE: ${AP_QUEUE_MODE:-not set}"
    echo "AP_EXECUTION_MODE: ${AP_EXECUTION_MODE:-not set}"
    echo "=================="
    
    # Run Node.js with standard error handling
    echo "Starting Node.js process..."
    node --enable-source-maps --max-old-space-size=3072 dist/packages/server/api/main.cjs 2>&1 || {
        EXIT_CODE=$?
        echo "=== NODE.JS CRASHED WITH EXIT CODE $EXIT_CODE ==="
        echo "Please check the logs above for the actual error message."
        sleep 30
        exit $EXIT_CODE
    }
fi