#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       Premier America Credit Union - Fly.io Deployment        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Fly CLI is installed
if ! command -v flyctl &> /dev/null; then
    echo "Installing Fly CLI..."
    curl -L https://fly.io/install.sh | sh
    export PATH=$PATH:$HOME/.fly/bin
fi

# Login to Fly
echo "Logging in to Fly.io..."
flyctl auth login

# Get app name
read -p "Enter Fly app name (or press Enter to create new): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "Creating new Fly app..."
    flyctl launch --name premier-banking-mvp
else
    echo "Using existing app: $APP_NAME"
fi

# Get the actual app name
if [ -z "$APP_NAME" ]; then
    APP_NAME="premier-banking-mvp"
fi

echo ""
echo "Configuring environment variables..."
echo ""

read -p "Enter Supabase URL: " SUPABASE_URL
read -p "Enter Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Enter Fineract URL: " FINERACT_URL
read -p "Enter Fineract Username: " FINERACT_USERNAME
read -p "Enter Fineract Password: " FINERACT_PASSWORD
read -p "Enter JWT Secret (or press Enter to generate): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi

echo ""
echo "Setting secrets on Fly..."

flyctl secrets set -a $APP_NAME \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  FINERACT_URL="$FINERACT_URL" \
  FINERACT_USERNAME="$FINERACT_USERNAME" \
  FINERACT_PASSWORD="$FINERACT_PASSWORD" \
  JWT_SECRET="$JWT_SECRET"

echo ""
echo "Deploying to Fly.io..."
flyctl deploy

echo ""
echo "✅ Deployment complete!"
echo "App URL: https://$APP_NAME.fly.dev"
echo ""
echo "View logs:"
echo "  flyctl logs -a $APP_NAME"
echo ""
