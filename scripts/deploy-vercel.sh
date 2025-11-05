#!/bin/bash

# Deploy Frontend to Vercel
# Usage: npm run deploy:vercel

echo "🚀 Deploying Premier America Credit Union to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
echo "📝 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to production
echo "🏗️  Building and deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Copy your Vercel URL"
echo "2. Update CLIENT_URL in your Render backend"
echo "3. Test the application end-to-end"
