#!/bin/bash

echo "🍦 Creamy Chills - Square Payment Integration Setup"
echo "=================================================="
echo ""

# Check if Square SDK is installed
echo "📦 Installing Square SDK..."
cd server
npm install square
echo "✅ Square SDK installed"
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating server .env file..."
    cp .env.example .env
    echo "✅ Server .env created - please add your Square credentials"
else
    echo "⚠️  Server .env already exists"
fi
echo ""

# Create client .env if not exists
cd ../client
if [ ! -f .env ]; then
    echo "📝 Creating client .env file..."
    cp .env.example .env
    echo "✅ Client .env created - please add your Square Application ID"
else
    echo "⚠️  Client .env already exists"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get Square credentials from: https://developer.squareup.com/apps"
echo "2. Add credentials to server/.env:"
echo "   - SQUARE_ACCESS_TOKEN"
echo "   - SQUARE_APPLICATION_ID"
echo "   - SQUARE_LOCATION_ID"
echo "3. Add credentials to client/.env:"
echo "   - REACT_APP_SQUARE_APPLICATION_ID"
echo "   - REACT_APP_SQUARE_LOCATION_ID"
echo "4. Run: npm run dev"
echo ""
echo "📚 Documentation: docs/SQUARE_PAYMENT_INTEGRATION.md"
echo ""
