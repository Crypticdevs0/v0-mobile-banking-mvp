#!/bin/bash

echo "[Migration] Starting database migrations..."

# Check if Supabase credentials exist
if [ -z "$SUPABASE_POSTGRES_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "[Migration] ⚠️  Skipping - Supabase credentials not found"
  echo "[Migration] This is normal for first-time setup"
  exit 0
fi

# Run the Node.js migration script
node scripts/run-migrations.js

exit $?
