#!/bin/bash

# Flowy - Cloudflare Pages Deployment Script

echo "🚀 Deploying Flowy to Cloudflare Pages..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Instructions for manual deployment
echo ""
echo "📋 Next Steps for Cloudflare Pages Deployment:"
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for Cloudflare deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to Cloudflare Pages dashboard:"
echo "   - https://dash.cloudflare.com/pages"
echo "   - Click 'Create a project'"
echo "   - Connect your GitHub repository"
echo "   - Set build settings:"
echo "     • Framework preset: Next.js"
echo "     • Build command: npm run build"
echo "     • Build output directory: out"
echo "     • Root directory: /"
echo ""
echo "3. Add environment variables in Cloudflare dashboard:"
echo "   - NEXTAUTH_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - DATABASE_URL"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - STRIPE_PUBLIC_KEY"
echo "   - STRIPE_SECRET_KEY"
echo ""
echo "4. Deploy! 🎉"
echo ""
echo "📝 Don't forget to:"
echo "   - Set up your PostgreSQL database (PlanetScale recommended)"
echo "   - Configure your Google OAuth credentials"
echo "   - Set up your Stripe payment processing"
echo "   - Update your NEXTAUTH_URL to your actual domain"