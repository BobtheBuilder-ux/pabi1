# API Specification

## API Structure Overview

### Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `https://api.demo.pabup.com/api/v1`

### Authentication
- JWT Bearer tokens for authenticated endpoints
- Access token: 24 hours expiration
- Refresh token: 30 days expiration

## Authentication Endpoints

### User Registration & Login
- `POST /auth/register/business` - Register business user
- `POST /auth/register/individual` - Register individual user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh JWT token

### Email & Password Management

- `POST /auth/verify-email` - Verify email with token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

## Profile Management Endpoints

### Profile Operations
- `GET /profile` - Get current user profile
- `PUT /profile` - Update current user profile
- `DELETE /profile` - Delete user account (soft delete)

### Profile Media
- `POST /profile/upload/avatar` - Upload profile picture
- `POST /profile/upload/cover` - Upload cover picture
- `DELETE /profile/picture/{type}` - Delete profile/cover picture (type: avatar|cover)
- `GET /profile/pictures` - Get profile picture URLs

### Profile Visibility
- `PUT /profile/visibility` - Update profile visibility settings
- `GET /profile/visibility` - Get current visibility settings

## Search & Discovery Endpoints

### Search Operations

- `GET /search` - Global search with filters (Public endpoint)
    - Query parameters: `q`, `country`, `categoryIds`, `hasConnection`, `cursor`, `size`, `sort`
- `GET /search/boosted` - Search boosted profiles (Authenticated)

## Category Management Endpoints

### Category Operations (All Public)

- `GET /categories` - Get all active categories
- `GET /categories/{id}` - Get specific category
- `GET /categories/{id}/subcategories` - Get subcategories
- `GET /categories/tree` - Get category hierarchy

## Connection Management Endpoints

### Connection Requests

- `POST /connections/requests` - Send connection request
- `GET /connections/requests/received` - Get received requests
- `GET /connections/requests/sent` - Get sent requests
- `PATCH /connections/requests/{requestId}/accept` - Accept connection request
- `PATCH /connections/requests/{requestId}/reject` - Reject connection request
- `DELETE /connections/requests/{requestId}` - Cancel sent request

### Connection Management
- `GET /connections` - Get user connections
- `DELETE /connections/{connectionId}` - Remove connection
- `GET /connections/{connectionId}/profile` - Get connection profile
- `GET /connections/stats` - Get connection statistics

## Boost Management Endpoints

### Boost Plans

- `GET /boost-plans` - Get all available boost plans (Public)
- `GET /boost-plans/{id}` - Get specific boost plan (Public)
- `POST /boost-plans` - Create new boost plan (Admin only)

### Boost Operations

- `POST /boost/industry` - Boost user industry/category
- `DELETE /boost/industry/{categoryId}` - Remove industry boost

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

### Paginated Response (Cursor-based)

```json
{
  "success": true,
  "data": {
    "items": [...],
    "hasNext": true,
    "nextCursor": "cursor_string"
  },
  "message": "Results retrieved successfully"
}
```

## Status Codes

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `204 No Content` - Operation successful, no content returned

### Client Error Codes
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate)
- `422 Unprocessable Entity` - Validation errors

### Server Error Codes
- `500 Internal Server Error` - Server error

## Authentication Flow

### JWT Token Structure
- Header: Contains algorithm and token type
- Payload: Contains user ID, role, and expiration
- Signature: Validates token integrity

### Token Management
- Access token: 24 hours expiration
- Refresh token: 30 days expiration
- Tokens include user ID and role information

## Public vs Authenticated Endpoints

### Public Endpoints (No authentication required)

- Search endpoints
- Category endpoints
- Boost plan viewing

### Authenticated Endpoints (JWT required)

- Profile management
- Connection management
- Boost operations
- User-specific data

## Data Models

### User Types

- `BUSINESS` - Business user with company profile
- `INDIVIDUAL` - Individual user with personal profile

### Connection Status

- `PENDING` - Request sent, awaiting response
- `ACCEPTED` - Connection established
- `REJECTED` - Request declined

### Search Sorting Options

- `RECENT` - Recently joined users first
- `NAME` - Alphabetical by name

### Security Features

- JWT-based authentication
- Input validation on all endpoints
- File upload security for profile images
- Soft delete for user accounts