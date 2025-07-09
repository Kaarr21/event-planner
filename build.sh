#!/bin/bash
# Build script for single service Render deployment

set -e  # Exit on any error

echo "=== Starting build process ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies and build frontend
echo "Installing Node.js dependencies..."
cd frontend
npm install

echo "Building React frontend..."
npm run build

echo "Frontend build completed. Files in frontend/dist:"
ls -la dist/

cd ..

echo "=== Build process completed successfully! ==="
