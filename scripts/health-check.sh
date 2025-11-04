#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Premier America Credit Union - Health Check               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check backend
echo "Checking backend health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAILED"
fi

# Check frontend
echo "Checking frontend health..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

# Check Socket.io
echo "Checking Socket.io connection..."
if curl -f http://localhost:3001/socket.io/ > /dev/null 2>&1; then
    echo "✅ Socket.io: OK"
else
    echo "❌ Socket.io: FAILED"
fi

# Check database connectivity (if you have a health endpoint)
echo ""
echo "Run detailed health checks:"
echo "  curl http://localhost:3001/api/health"
echo ""
