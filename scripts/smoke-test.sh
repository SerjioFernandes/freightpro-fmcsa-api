#!/bin/bash

# FreightPro Smoke Test Script
# Tests all critical endpoints and functionality

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-https://api.yourdomain.com}"
DOMAIN="${DOMAIN:-https://www.yourdomain.com}"

echo "🚀 FreightPro Smoke Tests"
echo "========================="
echo "Testing: $API_URL"
echo ""

FAILED=0
PASSED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    local method=${4:-GET}
    local data=${5:-""}
    
    echo -n "Testing $name... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS (HTTP $http_code)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL (Expected $expected_status, got $http_code)${NC}"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Health Check
echo "1. Backend Health Check"
test_endpoint "Health Check" "$API_URL/api/health" 200

# Test 2: Frontend Loads
echo -e "\n2. Frontend Accessibility"
test_endpoint "Frontend" "$DOMAIN" 200

# Test 3: Registration
echo -e "\n3. User Registration"
TIMESTAMP=$(date +%s)
REGISTER_DATA="{
  \"email\": \"smoketest${TIMESTAMP}@example.com\",
  \"password\": \"Test123!@#\",
  \"company\": \"Smoke Test Co\",
  \"phone\": \"555-1234\",
  \"accountType\": \"carrier\"
}"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

REGISTER_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

if [ "$REGISTER_CODE" -eq 201 ] || [ "$REGISTER_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ Registration endpoint works${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Registration failed (HTTP $REGISTER_CODE)${NC}"
    ((FAILED++))
fi

# Test 4: Protected Endpoint (should fail without auth)
echo -e "\n4. Protected Endpoint (should fail)"
test_endpoint "Protected endpoint without token" "$API_URL/api/dashboard/stats" 401

# Test 5: CORS
echo -e "\n5. CORS Configuration"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_URL/api/health" \
    -H "Origin: $DOMAIN" \
    -H "Access-Control-Request-Method: GET")

if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✓ CORS configured${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ CORS not configured${NC}"
    ((FAILED++))
fi

# Test 6: Static Assets
echo -e "\n6. Static Assets"
test_endpoint "favicon" "$DOMAIN/favicon.ico" 200

# Test 7: API Version
echo -e "\n7. API Version Check"
VERSION_RESPONSE=$(curl -s "$API_URL/api/health")
if echo "$VERSION_RESPONSE" | grep -q "version"; then
    echo -e "${GREEN}✓ API version info available${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ API version not found${NC}"
fi

# Summary
echo -e "\n${GREEN}========================="
echo "Tests Passed: $PASSED"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Tests Failed: $FAILED${NC}"
    echo "========================="
    exit 1
else
    echo "All tests passed! ✓"
    echo "=========================${NC}"
    exit 0
fi

