# Authentication Flow Guide

## How Authentication Works in This System

### 1. **Login Process (No JWT Required)**

Both Super Admin and Admin can login **without** any JWT token:

#### Super Admin Login
```bash
curl -X POST http://localhost:3000/api/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "password123"
  }'
```

#### Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com", 
    "password": "password123"
  }'
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "data": {
    "id": "user_id_here",
    "fullName": "John Doe",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **Using JWT Token for Protected Routes**

After login, use the returned token for protected routes:

```bash
curl -X GET http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. **Complete Example Flow**

```javascript
// Step 1: Login (no token needed)
const loginResponse = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Step 2: Use token for protected routes
const protectedResponse = await fetch('/api/admin/profile', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Key Points

1. **Login endpoints** (`/login`) do NOT require JWT tokens
2. **JWT tokens are GENERATED** during login
3. **Protected routes** require the JWT token in Authorization header
4. **Signup endpoints** also do NOT require JWT tokens

## Common Misconceptions

- ❌ "I need a JWT token to login" - **WRONG**
- ✅ "I get a JWT token after login" - **CORRECT**
- ❌ "Login requires authentication" - **WRONG** 
- ✅ "Protected routes require authentication" - **CORRECT**
