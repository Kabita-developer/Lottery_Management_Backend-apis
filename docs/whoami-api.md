# Who Am I API Documentation

## Overview

The "Who Am I" API endpoints allow authenticated users to retrieve their own profile information. This is useful for getting the current user's details, checking their role, and verifying their authentication status.

## Authentication

All "Who Am I" endpoints require **authentication** with the appropriate JWT token for each user type.

## API Endpoints

### 1. User Who Am I

**GET** `/api/user/whoami`

Retrieves the current user's profile information.

**Headers:**
```
Authorization: Bearer <user_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "phone": "+1234567890",
    "role": "user",
    "isActive": true,
    "created_at": "2023-09-05T10:30:00.000Z",
    "updated_at": "2023-09-05T10:30:00.000Z"
  }
}
```

### 2. Admin Who Am I

**GET** `/api/admin/whoami`

Retrieves the current admin's profile information.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "created_at": "2023-09-05T10:30:00.000Z",
    "updated_at": "2023-09-05T10:30:00.000Z"
  }
}
```

### 3. Super Admin Who Am I

**GET** `/api/super-admin/whoami`

Retrieves the current super admin's profile information.

**Headers:**
```
Authorization: Bearer <super_admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Super admin profile retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "fullName": "Super Admin User",
    "email": "superadmin@example.com",
    "role": "super_admin",
    "isActive": true,
    "created_at": "2023-09-05T10:30:00.000Z",
    "updated_at": "2023-09-05T10:30:00.000Z"
  }
}
```

## Error Responses

### 401 Unauthorized - Missing Token
```json
{
  "success": false,
  "message": "Authorization header is missing. Please provide: Authorization: Bearer <token>",
  "data": null
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "success": false,
  "message": "Your token has expired. Please login again to get a new token.",
  "data": null
}
```

### 403 Forbidden - Wrong Role
```json
{
  "success": false,
  "message": "Access denied. This endpoint requires user role, but your token has role: 'admin'. Please use a user token.",
  "data": null
}
```

### 403 Forbidden - Account Disabled
```json
{
  "success": false,
  "message": "Account is disabled",
  "data": null
}
```

### 404 Not Found - User Not Found
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

## Example Usage

### 1. Get User Profile
```bash
curl -X GET http://localhost:3000/api/user/whoami \
  -H "Authorization: Bearer <user_jwt_token>"
```

### 2. Get Admin Profile
```bash
curl -X GET http://localhost:3000/api/admin/whoami \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### 3. Get Super Admin Profile
```bash
curl -X GET http://localhost:3000/api/super-admin/whoami \
  -H "Authorization: Bearer <super_admin_jwt_token>"
```

## Complete Authentication Flow Example

### Step 1: Login to get token
```bash
# For User
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# For Admin
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# For Super Admin
curl -X POST http://localhost:3000/api/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "password123"
  }'
```

### Step 2: Use token to get profile
```bash
# Extract token from login response and use it
curl -X GET http://localhost:3000/api/user/whoami \
  -H "Authorization: Bearer <token_from_login_response>"
```

## Use Cases

1. **Profile Display**: Show current user information in the frontend
2. **Role Verification**: Check user's role and permissions
3. **Session Validation**: Verify if the user's session is still valid
4. **Account Status**: Check if the account is active or disabled
5. **User Dashboard**: Display personalized information based on user type

## Security Features

- **JWT Token Validation**: All endpoints validate the JWT token
- **Role-Based Access**: Each endpoint only works with the correct user type token
- **Account Status Check**: Disabled accounts cannot access their profile
- **No Sensitive Data**: Password hashes and reset tokens are not returned
- **Audit Trail**: All profile access is logged

## Notes

- **No Request Body**: All endpoints are GET requests with no body required
- **Token Required**: Must include valid JWT token in Authorization header
- **Role Specific**: Each endpoint only works with the corresponding user type
- **Real-time Data**: Returns current user information from the database
- **Consistent Response**: All endpoints follow the same response format
