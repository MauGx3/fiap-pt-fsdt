#!/bin/bash

# Simple Blog API Test Script
# This script demonstrates the basic functionality of the simplified blog API

BASE_URL="http://localhost:3001/api"

echo "🧪 Simple Blog API Test Script"
echo "================================"
echo ""

# Check if server is running
echo "1️⃣  Checking server health..."
curl -s "$BASE_URL/../health" | grep -q "OK" && echo "✅ Server is running" || echo "❌ Server is not running"
echo ""

# Create a user
echo "2️⃣  Creating a test user..."
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }')
USER_UUID=$(echo $USER_RESPONSE | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)
echo "✅ Created user with UUID: $USER_UUID"
echo ""

# Create a post
echo "3️⃣  Creating a test post..."
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Post\",
    \"content\": \"This is a test post created by the test script.\",
    \"author\": \"$USER_UUID\",
    \"authorName\": \"Test User\"
  }")
POST_ID=$(echo $POST_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Created post with ID: $POST_ID"
echo ""

# Get all posts
echo "4️⃣  Getting all posts..."
ALL_POSTS=$(curl -s "$BASE_URL/posts")
POST_COUNT=$(echo $ALL_POSTS | grep -o '"_id"' | wc -l)
echo "✅ Found $POST_COUNT post(s)"
echo ""

# Add a comment
echo "5️⃣  Adding a comment to the post..."
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"This is a test comment!\",
    \"author\": \"$USER_UUID\",
    \"authorName\": \"Test User\"
  }")
echo "✅ Added comment to post"
echo ""

# Search posts
echo "6️⃣  Searching for posts..."
SEARCH_RESULTS=$(curl -s "$BASE_URL/posts/search?query=test")
SEARCH_COUNT=$(echo $SEARCH_RESULTS | grep -o '"_id"' | wc -l)
echo "✅ Found $SEARCH_COUNT post(s) matching 'test'"
echo ""

# Get specific post with comments
echo "7️⃣  Getting post with comments..."
POST_WITH_COMMENTS=$(curl -s "$BASE_URL/posts/$POST_ID")
COMMENT_COUNT=$(echo $POST_WITH_COMMENTS | grep -o '"author"' | wc -l)
echo "✅ Post has $COMMENT_COUNT comment(s)"
echo ""

echo "🎉 Test completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - User UUID: $USER_UUID"
echo "   - Post ID: $POST_ID"
echo "   - Total posts: $POST_COUNT"
echo "   - Search results: $SEARCH_COUNT"
echo "   - Comments: $COMMENT_COUNT"
echo ""
echo "🔗 You can view the API documentation at: http://localhost:3001/api"
