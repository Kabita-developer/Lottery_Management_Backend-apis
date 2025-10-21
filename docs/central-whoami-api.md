# Central Who Am I API with Token Expiration

## Overview

The Central "Who Am I" API provides a **single endpoint** that works for all user types and includes detailed token expiration information. This is perfect for frontend applications that need to track token status and handle automatic re-authentication.

## Authentication

The central endpoint requires **any valid JWT token** from any user type (user, admin, or super_admin).

## API Endpoint

### Central Who Am I with Token Info

**GET** `/api/auth/whoami`

Retrieves the current user's profile information along with detailed token expiration data.

**Headers:**
```
Authorization: Bearer <any_valid_jwt_token>
```

## Response Examples

### User Response (200 OK):
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
    "updated_at": "2023-09-05T10:30:00.000Z",
    "token": {
      "issued_at": "2023-09-05T10:30:00.000Z",
      "expires_at": "2023-09-12T10:30:00.000Z",
      "expires_in_seconds": 604800,
      "expires_in_hours": 168,
      "expires_in_days": 7,
      "is_expired": false,
      "is_expiring_soon": false,
      "status": "valid"
    }
  }
}
```

### Admin Response (200 OK):
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
    "updated_at": "2023-09-05T10:30:00.000Z",
    "token": {
      "issued_at": "2023-09-05T10:30:00.000Z",
      "expires_at": "2023-09-12T10:30:00.000Z",
      "expires_in_seconds": 604800,
      "expires_in_hours": 168,
      "expires_in_days": 7,
      "is_expired": false,
      "is_expiring_soon": false,
      "status": "valid"
    }
  }
}
```

### Super Admin Response (200 OK):
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
    "updated_at": "2023-09-05T10:30:00.000Z",
    "token": {
      "issued_at": "2023-09-05T10:30:00.000Z",
      "expires_at": "2023-09-12T10:30:00.000Z",
      "expires_in_seconds": 604800,
      "expires_in_hours": 168,
      "expires_in_days": 7,
      "is_expired": false,
      "is_expiring_soon": false,
      "status": "valid"
    }
  }
}
```

## Token Information Fields

### Token Object Structure:
```json
{
  "token": {
    "issued_at": "2023-09-05T10:30:00.000Z",        // When token was issued
    "expires_at": "2023-09-12T10:30:00.000Z",        // When token expires
    "expires_in_seconds": 604800,                     // Seconds until expiry
    "expires_in_hours": 168,                         // Hours until expiry
    "expires_in_days": 7,                            // Days until expiry
    "is_expired": false,                             // Boolean: is token expired
    "is_expiring_soon": false,                       // Boolean: expires within 1 hour
    "status": "valid"                               // Status: "valid", "expiring_soon", "expired"
  }
}
```

### Token Status Values:
- **`"valid"`**: Token is valid and not expiring soon
- **`"expiring_soon"`**: Token expires within 1 hour
- **`"expired"`**: Token has already expired

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

### 400 Bad Request - Invalid Role
```json
{
  "success": false,
  "message": "Invalid user role",
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

### 1. Get Profile with Token Info
```bash
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <any_valid_jwt_token>"
```

### 2. Complete Authentication Flow
```bash
# Step 1: Login to get token
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Step 2: Use token to get profile with expiration info
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <token_from_step_1>"
```

## Frontend Implementation Examples

### JavaScript/React Example:
```javascript
async function getCurrentUserWithTokenInfo(token) {
  try {
    const response = await fetch('/api/auth/whoami', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { token: tokenInfo } = data.data;
      
      // Handle token status
      switch (tokenInfo.status) {
        case 'expired':
          // Redirect to login
          window.location.href = '/login';
          break;
        case 'expiring_soon':
          // Show warning or auto-refresh token
          showTokenExpiryWarning(tokenInfo.expires_in_hours);
          break;
        case 'valid':
          // Continue normal operation
          displayUserProfile(data.data);
          break;
      }
      
      // Set up automatic token refresh
      if (tokenInfo.expires_in_seconds > 0) {
        setTimeout(() => {
          refreshToken();
        }, (tokenInfo.expires_in_seconds - 300) * 1000); // Refresh 5 minutes before expiry
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

function showTokenExpiryWarning(hours) {
  console.warn(`Token expires in ${hours} hours`);
  // Show user notification
}

function displayUserProfile(userData) {
  console.log('User:', userData);
  // Update UI with user information
}
```

### Vue.js Example:
```javascript
// Vue.js composable
export function useAuth() {
  const checkTokenStatus = async (token) => {
    const response = await fetch('/api/auth/whoami', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const tokenInfo = data.data.token;
      
      // Reactive token status
      return {
        user: data.data,
        tokenStatus: tokenInfo.status,
        expiresIn: tokenInfo.expires_in_hours,
        isExpiringSoon: tokenInfo.is_expiring_soon
      };
    }
    
    return null;
  };
  
  return { checkTokenStatus };
}
```

## Use Cases

1. **Token Management**: Track token expiration and handle automatic refresh
2. **Session Monitoring**: Monitor user session status in real-time
3. **Proactive Re-authentication**: Warn users before token expires
4. **Dashboard Logic**: Build role-based UI with token awareness
5. **Mobile Apps**: Handle token lifecycle in mobile applications
6. **Security**: Implement automatic logout on token expiry

## Token Lifecycle Management

### Automatic Token Refresh Strategy:
```javascript
function setupTokenRefresh(userData) {
  const { token } = userData;
  
  if (token.status === 'valid') {
    // Refresh token 5 minutes before expiry
    const refreshTime = (token.expires_in_seconds - 300) * 1000;
    
    setTimeout(async () => {
      try {
        const newToken = await refreshUserToken();
        localStorage.setItem('authToken', newToken);
        setupTokenRefresh({ token: { ...token, expires_in_seconds: 604800 } });
      } catch (error) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
      }
    }, refreshTime);
  }
}
```

## Security Features

- **Token Validation**: Validates any valid JWT token
- **Expiration Tracking**: Real-time token expiration monitoring
- **Proactive Warnings**: Alerts before token expires
- **Automatic Refresh**: Supports token refresh workflows
- **Role Detection**: Automatically determines user type
- **Account Status**: Checks if account is active

## Notes

- **Single Endpoint**: One URL for all user types with token info
- **Real-time Data**: Token expiration calculated in real-time
- **Frontend Ready**: Perfect for implementing token management
- **Automatic Refresh**: Supports automatic token refresh strategies
- **User Experience**: Provides smooth token lifecycle management
