## Super Admin Authentication API

Base URL: `/api/super-admin`

### Signup

- Method: POST
- Path: `/signup`
- Body:

```json
{
  "fullName": "John Doe",
  "email": "admin@example.com",
  "password": "YourStrongP@ssw0rd"
}
```

- Responses:
  - 201 Created

```json
{
  "message": "Super admin created successfully",
  "data": {
    "id": "<mongo_id>",
    "fullName": "John Doe",
    "email": "admin@example.com",
    "role": "super_admin"
  },
  "token": "<jwt>"
}
```

  - 409 Conflict: Email already registered
  - 400 Bad Request: Validation errors

### Pre-Authentication Token

- Method: GET
- Path: `/pre-auth-token`
- Description: Generate a pre-authentication token required for super admin login
- Responses:
  - 200 OK

```json
{
  "message": "Pre-authentication token generated successfully",
  "token": "<pre_auth_jwt>",
  "expiresIn": "1 hour",
  "usage": "Use this token in Authorization header to access super admin login"
}
```

### Login (Requires Pre-Authentication)

- Method: POST
- Path: `/login`
- Headers: `Authorization: Bearer <pre_auth_jwt>`
- Body:

```json
{
  "email": "admin@example.com",
  "password": "YourStrongP@ssw0rd"
}
```

- Responses:
  - 200 OK

```json
{
  "message": "Login successful",
  "data": {
    "id": "<mongo_id>",
    "fullName": "John Doe",
    "email": "admin@example.com",
    "role": "super_admin"
  },
  "token": "<jwt>"
}
```

  - 401 Unauthorized: Invalid credentials or missing pre-auth token
  - 403 Forbidden: Invalid pre-auth token role

### Logout

- Method: POST
- Path: `/logout`
- Headers: `Authorization: Bearer <jwt>`
- Description: Logout super admin and log the event
- Responses:
  - 200 OK

```json
{
  "message": "Logout successful",
  "data": {
    "superAdminId": "<mongo_id>",
    "logoutTime": "2024-01-15T10:30:00.000Z"
  }
}
```

  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: Invalid token role

### Forgot Password

- Method: POST
- Path: `/forgot-password`
- Description: Request password reset for super admin
- Body:

```json
{
  "email": "admin@example.com"
}
```

- Responses:
  - 200 OK

```json
{
  "message": "If the email exists, a password reset link has been sent",
  "resetToken": "abc123..."
}
```

  - 400 Bad Request: Validation errors

### Reset Password

- Method: POST
- Path: `/reset-password`
- Description: Reset password using reset token
- Body:

```json
{
  "token": "abc123...",
  "newPassword": "NewStrongP@ssw0rd"
}
```

- Responses:
  - 200 OK

```json
{
  "message": "Password reset successful"
}
```

  - 400 Bad Request: Invalid or expired reset token
  - 400 Bad Request: Validation errors

### Change Password

- Method: POST
- Path: `/change-password`
- Headers: `Authorization: Bearer <jwt>`
- Description: Change password for authenticated super admin
- Body:

```json
{
  "currentPassword": "CurrentP@ssw0rd",
  "newPassword": "NewStrongP@ssw0rd"
}
```

- Responses:
  - 200 OK

```json
{
  "message": "Password changed successfully"
}
```

  - 400 Bad Request: Current password is incorrect
  - 400 Bad Request: Validation errors
  - 401 Unauthorized: Missing or invalid JWT token
  - 404 Not Found: Super admin not found

### JWT

- Header: `Authorization: Bearer <jwt>`
- Claims:
  - `sub`: super admin id
  - `role`: `super_admin`
- Expiry: configurable via `JWT_EXPIRES_IN` (default `7d`)

### Usage Example

```bash
# Step 1: Get pre-authentication token
curl -X GET http://localhost:3000/api/super-admin/pre-auth-token

# Step 2: Use pre-auth token to login
curl -X POST http://localhost:3000/api/super-admin/login \
  -H "Authorization: Bearer <pre_auth_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourStrongP@ssw0rd"
  }'

# Step 3: Logout (requires full access token)
curl -X POST http://localhost:3000/api/super-admin/logout \
  -H "Authorization: Bearer <full_access_jwt>"

# Password Reset Flow
# Step 1: Request password reset
curl -X POST http://localhost:3000/api/super-admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'

# Step 2: Reset password with token
curl -X POST http://localhost:3000/api/super-admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_step_1",
    "newPassword": "NewStrongP@ssw0rd"
  }'

# Change Password (requires authentication)
curl -X POST http://localhost:3000/api/super-admin/change-password \
  -H "Authorization: Bearer <full_access_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "CurrentP@ssw0rd",
    "newPassword": "NewStrongP@ssw0rd"
  }'
```

### Environment Variables

- `PORT` (default 3000)
- `MONGO_URI` (default mongodb://127.0.0.1:27017/lottery_db)
- `JWT_SECRET` (required in production)
- `JWT_EXPIRES_IN` (default 7d)


