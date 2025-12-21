#!/bin/bash
set -e

# Variables (passed from SSM or environment)
REPO_URL=$1
IMAGE_TAG=$2
CONTAINER_NAME="antigravity-agent"
PORT=8000

# Login to ECR
aws ecr get-login-password --region $(echo $REPO_URL | cut -d. -f4) | docker login --username AWS --password-stdin $(echo $REPO_URL | cut -d/ -f1)

# Pull the image
docker pull $REPO_URL:$IMAGE_TAG

# Stop and remove existing container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping and removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Run the new container
echo "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart always \
    -p $PORT:$PORT \
    $REPO_URL:$IMAGE_TAG

# Cleanup old images
docker image prune -af

echo "Deployment of $REPO_URL:$IMAGE_TAG successful!"
