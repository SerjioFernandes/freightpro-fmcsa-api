# CargoLume API Documentation

## Overview
CargoLume is a professional load board platform for the trucking industry. This API provides endpoints for user management, load posting, shipment tracking, and more.

## Base URL
- **Production**: `https://cargolume-fmcsa-api.onrender.com/api`
- **Local Development**: `http://localhost:4000/api`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles & Authority Rules

### User Types
- **Shipper**: Companies that need to ship freight
- **Broker**: Freight brokers connecting shippers and carriers
- **Carrier**: Trucking companies that transport freight

### Authority Requirements
- **EIN**: Required for brokers and carriers (format: XX-XXXXXXX)
- **MC Number**: Required for interstate freight operations
- **USDOT Number**: Required for all carriers (minimum for intrastate)

### Authority Rules
- **Brokers with MC**: Can post interstate + intrastate loads
- **Brokers with only USDOT**: Can post intrastate loads only
- **Carriers with MC**: Can see and book all loads
- **Carriers with only USDOT**: Can see and book intrastate loads only

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "company": "ABC Freight Co",
  "phone": "+1-555-123-4567",
  "accountType": "carrier",
  "usdotNumber": "1234567",
  "mcNumber": "MC-123456",
  "ein": "89-4521364"
}
```

**Validation Rules:**
- Email: RFC-compliant format
- Phone: US/Canada format (+1XXXXXXXXXX)
- EIN: Required for brokers/carriers, format XX-XXXXXXX
- MC: Format MC-XXXXXX or XXXXXX
- USDOT: 6-8 digits

**Response:**
```json
{
  "success": true,
  "message": "We sent a verification code to your email. Enter it to finish registration.",
  "emailVerificationRequired": true,
  "emailSent": true,
  "verification": { "code": "123456" },
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "company": "ABC Freight Co",
    "accountType": "carrier",
    "isEmailVerified": false
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "company": "ABC Freight Co",
    "accountType": "carrier",
    "isEmailVerified": true
  }
}
```

#### POST /auth/verify
Verify email address with verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

#### POST /auth/resend-code
Resend verification code.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### GET /auth/me
Get current user information (for chat role auto-detection).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "company": "ABC Freight Co",
    "accountType": "carrier",
    "role": "user",
    "isEmailVerified": true
  }
}
```

### User Management

#### GET /users/dashboard
Get role-specific dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Response (Carrier):**
```json
{
  "success": true,
  "dashboard": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "company": "ABC Freight Co",
      "accountType": "carrier",
      "phone": "+15551234567",
      "einDisplay": "89-4521364",
      "usdotNumber": "1234567",
      "mcNumber": "MC-123456",
      "isEmailVerified": true
    },
    "stats": {
      "totalBooked": 15,
      "availableToBook": 45,
      "inTransit": 3,
      "delivered": 12
    },
    "bookedLoads": [...],
    "availableLoads": [...]
  }
}
```

#### PUT /users/settings
Update user settings and profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "company": "Updated Company Name",
  "phone": "+1-555-999-8888",
  "usdotNumber": "7654321",
  "mcNumber": "MC-654321",
  "ein": "12-3456789",
  "address": {
    "street": "123 Main St",
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "country": "US"
  }
}
```

### Shipments

#### POST /shipments
Create a new shipment (shippers only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Electronics Shipment",
  "description": "Sensitive electronics requiring careful handling",
  "pickup": {
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "country": "US"
  },
  "delivery": {
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "shipment": {
    "_id": "shipment_id",
    "shipmentId": "SHP-20241201-ABC123",
    "title": "Electronics Shipment",
    "description": "Sensitive electronics requiring careful handling",
    "pickup": {
      "city": "Chicago",
      "state": "IL",
      "zip": "60601",
      "country": "US"
    },
    "delivery": {
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90210",
      "country": "US"
    },
    "status": "open",
    "postedBy": "user_id",
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

#### GET /shipments
List shipments (brokers browse all, shippers see own).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `scope`: "all" (default) or "own"
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### GET /shipments/:shipmentId
Get specific shipment by ID.

**Headers:** `Authorization: Bearer <token>`

### Loads

#### GET /loads
List available loads with authority-based filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: "available" (default), "booked", "in_transit", "delivered", "cancelled"
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Authority Filtering:**
- Carriers with MC: See all loads
- Carriers with only USDOT: See intrastate loads only

#### POST /loads
Post a new load (brokers only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Dry Van Load",
  "description": "General freight, no special requirements",
  "origin": {
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "country": "US"
  },
  "destination": {
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210",
    "country": "US"
  },
  "pickupDate": "2024-12-02T08:00:00.000Z",
  "deliveryDate": "2024-12-04T17:00:00.000Z",
  "equipmentType": "Dry Van",
  "weight": 45000,
  "rate": 2500,
  "rateType": "flat_rate",
  "shipmentId": "SHP-20241201-ABC123"
}
```

**Authority Validation:**
- Interstate loads require MC number
- Brokers with only USDOT can post intrastate loads only

#### POST /loads/:id/book
Book a load (carriers only).

**Headers:** `Authorization: Bearer <token>`

**Authority Validation:**
- Interstate loads require MC number
- Carriers with only USDOT can book intrastate loads only

**Response:**
```json
{
  "success": true,
  "message": "Load booked successfully",
  "load": {
    "_id": "load_id",
    "title": "Dry Van Load",
    "status": "booked",
    "bookedBy": "carrier_user_id",
    "updatedAt": "2024-12-01T10:30:00.000Z"
  }
}
```

## Error Responses

### Validation Errors (400)
```json
{
  "error": "Invalid EIN format. Use format: 12-3456789"
}
```

### Authorization Errors (403)
```json
{
  "error": "MC number required for interstate loads. Brokers with only USDOT can post intrastate loads only."
}
```

### Not Found Errors (404)
```json
{
  "error": "User not found"
}
```

### Conflict Errors (409)
```json
{
  "error": "Load already booked or not available"
}
```

### Server Errors (500)
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "requestId": "unique-request-id"
}
```

## Field Validation

### EIN (Employer Identification Number)
- **Format**: XX-XXXXXXX (e.g., 89-4521364)
- **Required**: Brokers and carriers only
- **Not Required**: Shippers

### MC Number (Motor Carrier)
- **Format**: MC-XXXXXX or XXXXXX
- **Required**: For interstate freight operations
- **Normalized**: Stored as MC-XXXXXX format

### USDOT Number
- **Format**: 6-8 digits
- **Required**: All carriers
- **Minimum**: For intrastate operations

### Phone Number
- **Format**: US/Canada format
- **Examples**: +1-555-123-4567, (555) 123-4567, 555-123-4567
- **Normalized**: Stored as +1XXXXXXXXXX

### Postal Codes
- **US ZIP**: 12345 or 12345-6789
- **Canadian**: A1A 1A1 or A1A1A1

### States/Provinces
- **US States**: Two-letter codes (AL, AK, AZ, etc.)
- **Canadian Provinces**: Two-letter codes (AB, BC, MB, etc.)

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information included in response headers

## CORS
- **Allowed Origins**: 
  - `https://freight-pro.netlify.app` (production frontend)
  - `http://localhost:3000` (local development)
  - `http://localhost:8000` (local development)

## Testing

### Test Suite
Run the comprehensive test suite:
```bash
node test-cargolume.js
```

### Migration Script
Migrate existing data to new schema:
```bash
# Dry run
node migration-script.js

# Actual migration
node migration-script.js --confirm
```

## Postman Collection

### Environment Variables
```json
{
  "api_base_url": "https://cargolume-fmcsa-api.onrender.com/api",
  "auth_token": "{{jwt_token}}",
  "test_email": "test@cargolume.com",
  "test_password": "TestPassword123!"
}
```

### Sample Requests

#### 1. Register User
```http
POST {{api_base_url}}/auth/register
Content-Type: application/json

{
  "email": "{{test_email}}",
  "password": "{{test_password}}",
  "company": "Test Freight Co",
  "phone": "+1-555-123-4567",
  "accountType": "carrier",
  "usdotNumber": "1234567",
  "mcNumber": "MC-123456",
  "ein": "89-4521364"
}
```

#### 2. Login
```http
POST {{api_base_url}}/auth/login
Content-Type: application/json

{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

#### 3. Get Dashboard
```http
GET {{api_base_url}}/users/dashboard
Authorization: Bearer {{auth_token}}
```

#### 4. Post Load
```http
POST {{api_base_url}}/loads
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "title": "Test Load",
  "description": "Test load for API testing",
  "origin": {
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "country": "US"
  },
  "destination": {
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210",
    "country": "US"
  },
  "pickupDate": "2024-12-02T08:00:00.000Z",
  "deliveryDate": "2024-12-04T17:00:00.000Z",
  "equipmentType": "Dry Van",
  "weight": 45000,
  "rate": 2500,
  "rateType": "flat_rate"
}
```

## Support
For API support and questions, contact the development team or use the live chat feature in the CargoLume application.
