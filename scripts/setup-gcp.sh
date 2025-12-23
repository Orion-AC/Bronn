#!/bin/bash
# =============================================================================
# Bronn GCP Infrastructure Setup Script
# =============================================================================
# This script sets up all required GCP resources for the Bronn platform.
# 
# Prerequisites:
#   - gcloud CLI installed and configured
#   - Billing account linked to project
#   - $40K cloud credits applied
#
# Usage:
#   chmod +x scripts/setup-gcp.sh
#   ./scripts/setup-gcp.sh
# =============================================================================

set -e  # Exit on error

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-salesos-473014}"
REGION="${GCP_REGION:-us-central1}"
DB_INSTANCE_NAME="bronn-db"
DB_NAME="bronn"
DB_USER="bronn"
ARTIFACT_REPO="bronn"
SERVICE_ACCOUNT_NAME="github-actions"

echo "=============================================="
echo "  Bronn GCP Infrastructure Setup"
echo "=============================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "📌 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs..."
gcloud services enable \
    sqladmin.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    firebase.googleapis.com \
    iam.googleapis.com \
    cloudresourcemanager.googleapis.com

echo "✅ APIs enabled"

# Create Artifact Registry repository
echo ""
echo "📦 Creating Artifact Registry repository..."
if gcloud artifacts repositories describe $ARTIFACT_REPO --location=$REGION &> /dev/null; then
    echo "  Repository already exists, skipping..."
else
    gcloud artifacts repositories create $ARTIFACT_REPO \
        --repository-format=docker \
        --location=$REGION \
        --description="Bronn container images"
    echo "✅ Artifact Registry repository created"
fi

# Create Cloud SQL instance
echo ""
echo "🗄️ Creating Cloud SQL instance..."
if gcloud sql instances describe $DB_INSTANCE_NAME &> /dev/null; then
    echo "  Instance already exists, skipping..."
else
    # Generate a random password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
    
    echo "  Creating PostgreSQL 14 instance (this may take a few minutes)..."
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-size=10GB \
        --storage-type=SSD \
        --no-assign-ip
    
    echo "  Setting root password..."
    gcloud sql users set-password postgres \
        --instance=$DB_INSTANCE_NAME \
        --password=$DB_PASSWORD
    
    echo "  Creating database user..."
    gcloud sql users create $DB_USER \
        --instance=$DB_INSTANCE_NAME \
        --password=$DB_PASSWORD
    
    echo "  Creating database..."
    gcloud sql databases create $DB_NAME \
        --instance=$DB_INSTANCE_NAME
    
    # Store password in Secret Manager
    echo "  Storing database password in Secret Manager..."
    echo -n "$DB_PASSWORD" | gcloud secrets create bronn-db-password \
        --replication-policy="automatic" \
        --data-file=-
    
    echo ""
    echo "⚠️  IMPORTANT: Save this password securely!"
    echo "  Database Password: $DB_PASSWORD"
    echo "  (Also stored in Secret Manager as 'bronn-db-password')"
    echo ""
fi

# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(connectionName)')
echo "  Cloud SQL Connection: $CONNECTION_NAME"

# Create service account for GitHub Actions
echo ""
echo "🔐 Creating service account for GitHub Actions..."
SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SA_EMAIL &> /dev/null 2>&1; then
    echo "  Service account already exists, skipping creation..."
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="GitHub Actions CI/CD"
fi

# Grant permissions
echo "  Granting permissions..."
ROLES=(
    "roles/run.admin"
    "roles/artifactregistry.writer"
    "roles/cloudsql.client"
    "roles/iam.serviceAccountUser"
    "roles/secretmanager.secretAccessor"
)

for role in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$role" \
        --quiet
done

# Grant Secret Manager access to the Default Compute Service Account (required for Cloud Run runtime)
echo "  Granting Secret Manager access to Default Compute Service Account..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
COMPUTE_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

echo "✅ Permissions granted"

# Create and download service account key
echo ""
echo "🔑 Creating service account key..."
KEY_FILE="gcp-service-account-key.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL

echo "✅ Service account key saved to: $KEY_FILE"

# Base64 encode for GitHub secrets
echo ""
echo "📋 Preparing GitHub Secrets..."
GCP_SA_KEY_B64=$(base64 < $KEY_FILE | tr -d '\n')

echo ""
echo "=============================================="
echo "  🎉 Setup Complete!"
echo "=============================================="
echo ""
echo "Add these secrets to your GitHub repository:"
echo "(Settings → Secrets and variables → Actions → New repository secret)"
echo ""
echo "┌────────────────────────┬─────────────────────────────────────────────┐"
echo "│ Secret Name            │ Value                                       │"
echo "├────────────────────────┼─────────────────────────────────────────────┤"
echo "│ GCP_PROJECT_ID         │ $PROJECT_ID                                 │"
echo "│ GCP_REGION             │ $REGION                                     │"
echo "│ CLOUD_SQL_CONNECTION   │ $CONNECTION_NAME                            │"
echo "│ GCP_SA_KEY             │ (contents of $KEY_FILE, base64 encoded)     │"
echo "└────────────────────────┴─────────────────────────────────────────────┘"
echo ""
echo "The base64-encoded service account key has been copied to your clipboard"
echo "(if pbcopy is available) or you can encode it manually with:"
echo "  base64 < $KEY_FILE | tr -d '\\n'"
echo ""
echo "Next steps:"
echo "  1. Set up Firebase: https://console.firebase.google.com"
echo "  2. Add GitHub secrets (see table above)"
echo "  3. Push to main branch to trigger deployment"
echo ""

# Try to copy to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    echo "$GCP_SA_KEY_B64" | pbcopy
    echo "✅ GCP_SA_KEY copied to clipboard!"
fi
