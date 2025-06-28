#!/bin/bash

# Test API functionality
echo "Testing Event Planner API..."

BASE_URL="http://localhost:5000"

# Test user credentials
USERNAME="testuser$(date +%s)"
EMAIL="test$(date +%s)@example.com"
PASSWORD="test123"

echo "1. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Register response: $REGISTER_RESPONSE"

# Extract token from response
TOKEN=$(echo "$REGISTER_RESPONSE" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
    echo "Failed to get access token from registration"
    echo "Full response: $REGISTER_RESPONSE"
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."

echo ""
echo "2. Testing event creation..."
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Event","description":"Test Description","date":"2024-12-25T10:00:00","location":"Test Location"}')

echo "Event creation response: $EVENT_RESPONSE"

echo ""
echo "3. Testing events list..."
EVENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/events" \
  -H "Authorization: Bearer $TOKEN")

echo "Events list response: $EVENTS_RESPONSE"

echo ""
echo "API test completed!"
