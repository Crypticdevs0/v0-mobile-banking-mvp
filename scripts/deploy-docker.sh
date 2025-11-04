#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      Premier America Credit Union - Docker Deployment         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get Docker registry details
read -p "Enter Docker registry (default: docker.io): " REGISTRY
REGISTRY=${REGISTRY:-docker.io}

read -p "Enter Docker username: " USERNAME
read -p "Enter Docker password or token: " -s PASSWORD
echo ""

read -p "Enter image name (default: premier-banking): " IMAGE_NAME
IMAGE_NAME=${IMAGE_NAME:-premier-banking}

read -p "Enter image tag (default: latest): " IMAGE_TAG
IMAGE_TAG=${IMAGE_TAG:-latest}

echo ""
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

echo ""
echo "Tagging for registry..."
docker tag $IMAGE_NAME:$IMAGE_TAG $REGISTRY/$USERNAME/$IMAGE_NAME:$IMAGE_TAG

echo ""
echo "Logging in to Docker registry..."
echo $PASSWORD | docker login -u $USERNAME --password-stdin $REGISTRY

echo ""
echo "Pushing image..."
docker push $REGISTRY/$USERNAME/$IMAGE_NAME:$IMAGE_TAG

echo ""
echo "✅ Docker image pushed successfully!"
echo "Image: $REGISTRY/$USERNAME/$IMAGE_NAME:$IMAGE_TAG"
echo ""
echo "To run locally:"
echo "  docker run -p 3000:3000 -p 3001:3001 $REGISTRY/$USERNAME/$IMAGE_NAME:$IMAGE_TAG"
echo ""
