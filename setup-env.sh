#!/bin/bash

# Premier America Credit Union - Environment Setup Script
# This script creates .env files for both frontend and backend

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Premier America Credit Union - Environment Setup           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Using existing configuration."
    echo ""
    read -p "Do you want to reconfigure? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Frontend Environment Variables
echo "📱 Configuring Frontend Environment..."
echo ""

read -p "Enter Supabase Project URL (https://[project].supabase.co): " SUPABASE_URL
read -p "Enter Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Enter Socket.io Server URL (default: http://localhost:3001): " SOCKET_URL
SOCKET_URL=${SOCKET_URL:-http://localhost:3001}

# Create .env.local for frontend
cat > .env.local << EOF
# Supabase Configuration (Frontend)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Socket.io Configuration (Frontend)
NEXT_PUBLIC_SOCKET_URL=$SOCKET_URL
EOF

echo "✅ Frontend .env.local created"
echo ""

# Backend Environment Variables
echo "⚙️  Configuring Backend Environment..."
echo ""

read -p "Enter Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Enter Fineract API URL (default: http://localhost:8080): " FINERACT_URL
FINERACT_URL=${FINERACT_URL:-http://localhost:8080}
read -p "Enter Fineract Username (default: mifos): " FINERACT_USERNAME
FINERACT_USERNAME=${FINERACT_USERNAME:-mifos}
read -p "Enter Fineract Password: " FINERACT_PASSWORD
read -p "Enter Fineract Tenant (default: default): " FINERACT_TENANT
FINERACT_TENANT=${FINERACT_TENANT:-default}
read -p "Enter Fineract Product ID (default: 1): " FINERACT_PRODUCT_ID
FINERACT_PRODUCT_ID=${FINERACT_PRODUCT_ID:-1}

# Generate JWT Secret if not provided
read -p "Enter JWT Secret (or press Enter to generate): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT Secret: $JWT_SECRET"
fi

read -p "Enter Node Environment (default: development): " NODE_ENV
NODE_ENV=${NODE_ENV:-development}
read -p "Enter Backend Port (default: 3001): " PORT
PORT=${PORT:-3001}
read -p "Enter Client URL for CORS (default: http://localhost:3000): " CLIENT_URL
CLIENT_URL=${CLIENT_URL:-http://localhost:3000}

# Create .env for backend
cat > backend/.env << EOF
# Database Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Fineract Configuration
FINERACT_URL=$FINERACT_URL
FINERACT_USERNAME=$FINERACT_USERNAME
FINERACT_PASSWORD=$FINERACT_PASSWORD
FINERACT_TENANT=$FINERACT_TENANT
FINERACT_PRODUCT_ID=$FINERACT_PRODUCT_ID

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Server Configuration
NODE_ENV=$NODE_ENV
PORT=$PORT
CLIENT_URL=$CLIENT_URL
EOF

echo "✅ Backend .env created"
echo ""

# Display summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   ✅ Setup Complete                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Environment files created:"
echo "   • .env.local (Frontend)"
echo "   • backend/.env (Backend)"
echo ""
echo "🚀 Next steps:"
echo "   1. Review the .env files for accuracy"
echo "   2. Run database migrations:"
echo "      npm run migrate"
echo "   3. Start development servers:"
echo "      npm run dev:backend &"
echo "      npm run dev:frontend"
echo ""
echo "💡 Keep these credentials secure and never commit to git!"
echo ""
