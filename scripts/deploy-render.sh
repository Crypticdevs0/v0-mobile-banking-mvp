#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Premier America Credit Union - Render Deployment          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Installing Render CLI..."
    npm install -g @render-oss/cli
fi

# Get project name
read -p "Enter your Render project name (or press Enter for 'premier-banking'): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-premier-banking}

# Create render.yaml if doesn't exist
if [ ! -f "render.yaml" ]; then
    echo "render.yaml not found. Creating from template..."
    cp render.yaml.example render.yaml 2>/dev/null || echo "render.yaml template not found"
fi

echo ""
echo "Deploying to Render..."
echo "Project: $PROJECT_NAME"
echo ""

# Deploy using git push (Render auto-detects render.yaml)
git add .
git commit -m "Deploy to Render" || true
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo "Monitor your deployment at: https://dashboard.render.com"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Find your service: $PROJECT_NAME"
echo "3. Configure environment variables"
echo "4. View deployment logs"
echo ""
