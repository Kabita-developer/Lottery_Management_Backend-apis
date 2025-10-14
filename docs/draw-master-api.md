# DrawMaster API Documentation

Base URL: `/api/draw-master`

**⚠️ IMPORTANT: All DrawMaster endpoints require Super Admin authentication.**

## Authentication

All endpoints require a valid Super Admin JWT token in the Authorization header:
```
Authorization: Bearer <super_admin_jwt_token>
```

## API Endpoints

### 1. Create a Draw
- **Method**: POST
- **Path**: `/api/draw-master`
- **Authentication**: Super Admin JWT required
- **Body**:
```json
{
  "drawTime": {
    "date": "21-01-20",
    "time": "10:30"
  },
  "lastUnsoldTime": {
    "date": "21-01-20",
    "time": "10:30"
  },
  "sellingRate": 85.5
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Draw created successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "drawTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "lastUnsoldTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "sellingRate": "₹85.50",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Draws
- **Method**: GET
- **Path**: `/api/draw-master`
- **Authentication**: Super Admin JWT required

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Draws retrieved successfully",
  "data": {
    "draws": [
      {
        "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
        "drawTime": {
          "date": "21-01-20",
          "time": "10:30"
        },
        "lastUnsoldTime": {
          "date": "21-01-20",
          "time": "10:30"
        },
        "sellingRate": "₹85.50",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 3. Get Draw by ID
- **Method**: GET
- **Path**: `/api/draw-master/:id`
- **Authentication**: Super Admin JWT required

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Draw retrieved successfully",
  "data": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "drawTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "lastUnsoldTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "sellingRate": "₹85.50",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "message": "Draw not found",
  "data": null
}
```

### 4. Update a Draw
- **Method**: POST
- **Path**: `/api/draw-master/:id`
- **Authentication**: Super Admin JWT required
- **Body** (at least one field required):
```json
{
  "drawTime": {
    "date": "22-01-20",
    "time": "11:00"
  },
  "sellingRate": 90.0
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Draw updated successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "drawTime": {
      "date": "22-01-20",
      "time": "11:00"
    },
    "lastUnsoldTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "sellingRate": "₹90.00",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 5. Delete a Draw
- **Method**: POST
- **Path**: `/api/draw-master/delete/:id`
- **Authentication**: Super Admin JWT required

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Draw deleted successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "drawTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "lastUnsoldTime": {
      "date": "21-01-20",
      "time": "10:30"
    },
    "sellingRate": "₹85.50",
    "deletedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "Authorization header is missing. Please provide: Authorization: Bearer <token>",
  "data": null
}
```

```json
{
  "success": false,
  "message": "Access denied. This endpoint requires super_admin role, but your token has role: 'admin'. Please use a super admin token.",
  "data": null
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "path": "drawTime",
        "message": "Date must be in format: \"21-01-20\""
      }
    ]
  }
}
```

### Server Errors
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

## Field Validation Rules

- **drawTime**: Required object with:
  - `date`: Required string in format `"21-01-20"`
  - `time`: Required string in format `"10:30"`
- **lastUnsoldTime**: Required object with:
  - `date`: Required string in format `"21-01-20"`
  - `time`: Required string in format `"10:30"`
- **sellingRate**: Required number between 0 and 100 (inclusive)

## Currency Formatting

- **sellingRate** is automatically formatted as Indian Rupee (₹) in all GET responses
- Input: `sellingRate: 85.5` → Output: `sellingRate: "₹85.50"`
- Uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` for formatting

## Postman Collection

### Environment Variables
Set these variables in your Postman environment:
- `base_url`: `http://localhost:3000`
- `super_admin_token`: Your Super Admin JWT token

### Sample Requests

#### 1. Create Draw
```bash
POST {{base_url}}/api/draw-master
Authorization: Bearer {{super_admin_token}}
Content-Type: application/json

{
  "drawTime": {
    "date": "21-01-20",
    "time": "10:30"
  },
  "lastUnsoldTime": {
    "date": "21-01-20",
    "time": "10:30"
  },
  "sellingRate": 85.5
}
```

#### 2. Get All Draws
```bash
GET {{base_url}}/api/draw-master
Authorization: Bearer {{super_admin_token}}
```

#### 3. Get Draw by ID
```bash
GET {{base_url}}/api/draw-master/65f8a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer {{super_admin_token}}
```

#### 4. Update Draw
```bash
POST {{base_url}}/api/draw-master/65f8a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer {{super_admin_token}}
Content-Type: application/json

{
  "drawTime": {
    "date": "22-01-20",
    "time": "11:00"
  },
  "sellingRate": 90.0
}
```

#### 5. Delete Draw
```bash
POST {{base_url}}/api/draw-master/delete/65f8a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer {{super_admin_token}}
```

## Testing Workflow

1. **Get Super Admin Token**:
   ```bash
   # First get pre-auth token
   GET {{base_url}}/api/super-admin/pre-auth-token
   
   # Then login with pre-auth token
   POST {{base_url}}/api/super-admin/login
   Authorization: Bearer <pre_auth_token>
   Content-Type: application/json
   
   {
     "email": "superadmin@example.com",
     "password": "password123"
   }
   ```

2. **Use the returned JWT token** in all DrawMaster API requests

3. **Test CRUD operations** in order:
   - Create a draw
   - Get all draws
   - Get specific draw by ID
   - Update the draw
   - Delete the draw

## Notes

- All timestamps are in ISO 8601 format
- The `drawTime` and `lastUnsoldTime` fields must follow the exact string format specified
- `sellingRate` is a percentage value (0-100)
- All responses follow the `{success, message, data}` format
- Only Super Admins can access these endpoints
