# Test Admin Login - Curl Commands

## 1. Create Admin User (if not exists)
```bash
curl -X POST http://localhost:3000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Admin",
    "email": "admin@gmail.com",
    "password": "admin@123"
  }'
```

## 2. Test Admin Login (This should work now!)
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin@123"
  }'
```

## 3. Test Stockist Creation with Admin Token
```bash
# First get the token from step 2, then use it:
curl -X POST http://localhost:3000/api/stockists \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "STK001",
    "name": "Test Stockist",
    "aadharId": "123456789012",
    "aadharName": "Test User",
    "address1": "Test Address",
    "pinCode": "123456",
    "phone": "+919876543210",
    "email": "test@stockist.com",
    "panNo": "ABCDE1234F",
    "type": "Credit Party"
  }'
```

## 4. Test Stockist List
```bash
curl -X GET http://localhost:3000/api/stockists \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

## 5. Test Update Stockist
```bash
curl -X POST http://localhost:3000/api/stockists/<STOCKIST_ID> \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Stockist Name",
    "phone": "+919876543211"
  }'
```

## 6. Test Toggle Stockist Status
```bash
curl -X POST http://localhost:3000/api/stockists/<STOCKIST_ID>/status \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{"active": false}'
```

## 7. Test Delete Stockist
```bash
curl -X POST http://localhost:3000/api/stockists/<STOCKIST_ID>/delete \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

## 8. Test Who Am I - User
```bash
curl -X GET http://localhost:3000/api/user/whoami \
  -H "Authorization: Bearer <USER_TOKEN_HERE>"
```

## 9. Test Who Am I - Admin
```bash
curl -X GET http://localhost:3000/api/admin/whoami \
  -H "Authorization: Bearer <ADMIN_TOKEN_HERE>"
```

## 10. Test Who Am I - Super Admin
```bash
curl -X GET http://localhost:3000/api/super-admin/whoami \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN_HERE>"
```

## 11. Test Central Who Am I - Works with ANY token
```bash
# Works with User token
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <USER_TOKEN_HERE>"

# Works with Admin token
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <ADMIN_TOKEN_HERE>"

# Works with Super Admin token
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN_HERE>"
```

## Expected Results

### Step 1: Admin Signup
- If admin doesn't exist: Returns 201 with admin data and token
- If admin exists: Returns 409 with "Email already registered"

### Step 2: Admin Login
- Should return 200 with:
```json
{
  "message": "Login successful",
  "data": {
    "id": "admin_id_here",
    "fullName": "Test Admin",
    "email": "admin@gmail.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 3: Stockist Creation
- Should return 201 with created stockist data

### Step 4: Stockist List
- Should return 200 with list of stockists

## Enhanced Central Who Am I API with Token Expiration

### Get Current User Profile with Token Info (Any Role)
```bash
# Works with any valid JWT token (user, admin, or super_admin)
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <any_valid_jwt_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
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

### Token Information Fields:
- **`issued_at`**: When the token was created
- **`expires_at`**: When the token will expire
- **`expires_in_seconds`**: Seconds until expiry
- **`expires_in_hours`**: Hours until expiry
- **`expires_in_days`**: Days until expiry
- **`is_expired`**: Boolean indicating if token is expired
- **`is_expiring_soon`**: Boolean indicating if token expires within 1 hour
- **`status`**: Token status ("valid", "expiring_soon", "expired")

### Complete Authentication Flow with Token Tracking
```bash
# Step 1: Login to get token
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin@123"
  }'

# Step 2: Use token to get profile with expiration info
curl -X GET http://localhost:3000/api/auth/whoami \
  -H "Authorization: Bearer <token_from_step_1>"
```

### Frontend Implementation Example
```javascript
// Check token status and handle expiration
async function checkTokenStatus(token) {
  const response = await fetch('/api/auth/whoami', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    const tokenInfo = data.data.token;
    
    switch (tokenInfo.status) {
      case 'expired':
        // Redirect to login
        window.location.href = '/login';
        break;
      case 'expiring_soon':
        // Show warning
        alert(`Token expires in ${tokenInfo.expires_in_hours} hours`);
        break;
      case 'valid':
        // Continue normal operation
        console.log('Token is valid');
        break;
    }
  }
}
```
