#!/bin/bash

# Lejerli Frontend Startup Script
# This script helps you start the app with one command

echo "🚀 Lejerli Frontend Startup Script"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:3000"
else
    echo "⚠️  Backend is not running!"
    echo "Please start the backend first:"
    echo "  cd ../Lejerli"
    echo "  npm start"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🎯 Starting Expo development server..."
echo ""
echo "Choose your platform:"
echo "  Press 'w' for Web"
echo "  Press 'a' for Android"
echo "  Press 'i' for iOS"
echo ""

npm start
