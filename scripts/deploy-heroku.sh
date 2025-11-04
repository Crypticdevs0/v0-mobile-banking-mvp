#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Premier America Credit Union - Heroku Deployment          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "Heroku CLI not found. Installing..."
    npm install -g heroku
fi

# Login to Heroku
echo "Logging in to Heroku..."
heroku login

# Get app name
read -p "Enter Heroku app name (or press Enter to create new): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "Creating new Heroku app..."
    heroku create
else
    echo "Using existing app: $APP_NAME"
    heroku apps:info -a $APP_NAME
fi

# Get the actual app name
if [ -z "$APP_NAME" ]; then
    APP_NAME=$(heroku apps --json | jq -r '.[-1].name')
fi

echo ""
echo "Configuring environment variables..."
echo ""

read -p "Enter Supabase URL: " SUPABASE_URL
read -p "Enter Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Enter Fineract URL (default: http://localhost:8080): " FINERACT_URL
read -p "Enter Fineract Username (default: mifos): " FINERACT_USERNAME
read -p "Enter Fineract Password: " FINERACT_PASSWORD
read -p "Enter Fineract Tenant (default: default): " FINERACT_TENANT
read -p "Enter JWT Secret (or press Enter to generate): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi

echo ""
echo "Setting environment variables on Heroku..."

heroku config:set -a $APP_NAME \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  FINERACT_URL="${FINERACT_URL:-http://localhost:8080}" \
  FINERACT_USERNAME="${FINERACT_USERNAME:-mifos}" \
  FINERACT_PASSWORD="$FINERACT_PASSWORD" \
  FINERACT_TENANT="${FINERACT_TENANT:-default}" \
  FINERACT_PRODUCT_ID="1" \
  JWT_SECRET="$JWT_SECRET" \
  NODE_ENV="production"

echo ""
echo "Deploying to Heroku..."
git push heroku main

echo ""
echo "✅ Deployment complete!"
echo "App URL: https://$APP_NAME.herokuapp.com"
echo ""
echo "View logs:"
echo "  heroku logs --tail -a $APP_NAME"
echo ""
