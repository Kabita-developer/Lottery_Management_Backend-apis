## User Authentication API

Base URL: `/api/user`

### Signup

- Method: POST
- Path: `/signup`
- Body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "address": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "phone": "+1234567890",
  "password": "YourStrongP@ssw0rd"
}
```

- Responses:
  - 201 Created

```json
{
  "message": "User created successfully",
  "data": {
    "id": "<mongo_id>",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "phone": "+1234567890",
    "role": "user"
  },
  "token": "<jwt>"
}
```

  - 409 Conflict: Email already registered
  - 400 Bad Request: Validation errors

### Login

- Method: POST
- Path: `/login`
- Body:

```json
{
  "email": "john.doe@example.com",
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
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "phone": "+1234567890",
    "role": "user"
  },
  "token": "<jwt>"
}
```

  - 401 Unauthorized: Invalid credentials
  - 403 Forbidden: Account disabled

### Logout

- Method: POST
- Path: `/logout`
- Headers: `Authorization: Bearer <jwt>`
- Description: Logout user and log the event
- Responses:
  - 200 OK

```json
{
  "message": "Logout successful",
  "data": {
    "userId": "<mongo_id>",
    "logoutTime": "2024-01-15T10:30:00.000Z"
  }
}
```

  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: Invalid token role

### Forgot Password

- Method: POST
- Path: `/forgot-password`
- Description: Request password reset for user
- Body:

```json
{
  "email": "john.doe@example.com"
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
- Description: Change password for authenticated user
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
  - 404 Not Found: User not found

### JWT

- Header: `Authorization: Bearer <jwt>`
- Claims:
  - `sub`: user id
  - `role`: `user`
- Expiry: configurable via `JWT_EXPIRES_IN` (default `7d`)

### Usage Example

```bash
# Signup
curl -X POST http://localhost:3000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "phone": "+1234567890",
    "password": "YourStrongP@ssw0rd"
  }'

# Login
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "YourStrongP@ssw0rd"
  }'

# Logout (requires authentication)
curl -X POST http://localhost:3000/api/user/logout \
  -H "Authorization: Bearer <jwt_token>"

# Password Reset Flow
# Step 1: Request password reset
curl -X POST http://localhost:3000/api/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com"}'

# Step 2: Reset password with token
curl -X POST http://localhost:3000/api/user/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_step_1",
    "newPassword": "NewStrongP@ssw0rd"
  }'

# Change Password (requires authentication)
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Authorization: Bearer <jwt_token>" \
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

### Field Validation

- **firstName**: Required, 1-50 characters
- **lastName**: Required, 1-50 characters
- **email**: Required, valid email format, unique
- **address.street**: Required, 1-200 characters
- **address.city**: Required, 1-100 characters
- **address.state**: Required, 1-100 characters
- **address.country**: Required, 1-100 characters
- **address.zipCode**: Required, 1-20 characters
- **phone**: Required, valid phone number format
- **password**: Required, 8-72 characters
