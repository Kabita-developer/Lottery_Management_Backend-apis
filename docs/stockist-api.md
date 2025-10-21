# Stockist Management API Documentation

## Overview

The Stockist Management API allows Admins to create, read, update, and delete stockist records. Stockists are business entities that can be either Credit Party or Debit Party types.

## Authentication

All Stockist API endpoints require **Admin authentication**. Include the JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Base URL

All endpoints are prefixed with `/api/stockists`

## API Endpoints

### 1. Create Stockist

**POST** `/api/stockists`

Creates a new stockist record.

**Request Body:**
```json
{
  "code": "STK001",
  "name": "ABC Trading Company",
  "aadharId": "123456789012",
  "aadharName": "John Doe",
  "address1": "123 Main Street",
  "address2": "Near City Center",
  "pinCode": "123456",
  "phone": "+919876543210",
  "email": "john@abctrading.com",
  "panNo": "ABCDE1234F",
  "type": "Credit Party",
  "device": "Mobile App",
  "active": true,
  "isSeller": false,
  "allowMail": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Stockist created successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "code": "STK001",
    "name": "ABC Trading Company",
    "aadharId": "123456789012",
    "aadharName": "John Doe",
    "address1": "123 Main Street",
    "address2": "Near City Center",
    "pinCode": "123456",
    "phone": "+919876543210",
    "email": "john@abctrading.com",
    "panNo": "ABCDE1234F",
    "type": "Credit Party",
    "device": "Mobile App",
    "active": true,
    "isSeller": false,
    "allowMail": true,
    "created_by": "64f8a1b2c3d4e5f6a7b8c9d1",
    "created_at": "2023-09-05T10:30:00.000Z",
    "updated_at": "2023-09-05T10:30:00.000Z"
  }
}
```

### 2. Get All Stockists

**GET** `/api/stockists`

Retrieves a paginated list of stockists with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for code, name, aadharName, email, phone, or panNo
- `type` (optional): Filter by type ("Credit Party" or "Debit Party")
- `active` (optional): Filter by active status (true/false)
- `isSeller` (optional): Filter by seller status (true/false)
- `allowMail` (optional): Filter by mail permission (true/false)

**Example Request:**
```
GET /api/stockists?page=1&limit=10&search=ABC&type=Credit Party&active=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stockists retrieved successfully",
  "data": {
    "stockists": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "code": "STK001",
        "name": "ABC Trading Company",
        "aadharId": "123456789012",
        "aadharName": "John Doe",
        "address1": "123 Main Street",
        "address2": "Near City Center",
        "pinCode": "123456",
        "phone": "+919876543210",
        "email": "john@abctrading.com",
        "panNo": "ABCDE1234F",
        "type": "Credit Party",
        "device": "Mobile App",
        "active": true,
        "isSeller": false,
        "allowMail": true,
        "created_by": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "fullName": "Admin User",
          "email": "admin@example.com"
        },
        "created_at": "2023-09-05T10:30:00.000Z",
        "updated_at": "2023-09-05T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 50,
      "limit": 10
    }
  }
}
```

### 3. Get Stockist by ID

**GET** `/api/stockists/:id`

Retrieves a specific stockist by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stockist retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "code": "STK001",
    "name": "ABC Trading Company",
    "aadharId": "123456789012",
    "aadharName": "John Doe",
    "address1": "123 Main Street",
    "address2": "Near City Center",
    "pinCode": "123456",
    "phone": "+919876543210",
    "email": "john@abctrading.com",
    "panNo": "ABCDE1234F",
    "type": "Credit Party",
    "device": "Mobile App",
    "active": true,
    "isSeller": false,
    "allowMail": true,
    "created_by": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "fullName": "Admin User",
      "email": "admin@example.com"
    },
    "created_at": "2023-09-05T10:30:00.000Z",
    "updated_at": "2023-09-05T10:30:00.000Z"
  }
}
```

### 4. Update Stockist

**POST** `/api/stockists/:id`

Updates an existing stockist. All fields are optional.

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "phone": "+919876543211",
  "active": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stockist updated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "code": "STK001",
    "name": "Updated Company Name",
    "aadharId": "123456789012",
    "aadharName": "John Doe",
    "address1": "123 Main Street",
    "address2": "Near City Center",
    "pinCode": "123456",
    "phone": "+919876543211",
    "email": "john@abctrading.com",
    "panNo": "ABCDE1234F",
    "type": "Credit Party",
    "device": "Mobile App",
    "active": false,
    "isSeller": false,
    "allowMail": true,
    "created_by": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "fullName": "Admin User",
      "email": "admin@example.com"
    },
    "created_at": "2023-09-05T10:30:00.000Z",
    "updated_at": "2023-09-05T10:35:00.000Z"
  }
}
```

### 5. Toggle Stockist Status

**POST** `/api/stockists/:id/status`

Toggles the active status of a stockist.

**Request Body:**
```json
{
  "active": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stockist deactivated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "code": "STK001",
    "name": "ABC Trading Company",
    "active": false,
    "updated_at": "2023-09-05T10:40:00.000Z"
  }
}
```

### 6. Delete Stockist

**POST** `/api/stockists/:id/delete`

Permanently deletes a stockist record.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stockist deleted successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "code": "STK001",
    "name": "ABC Trading Company",
    "deleted_at": "2023-09-05T10:45:00.000Z"
  }
}
```

## Field Specifications

### Required Fields
- **code**: Unique identifier (1-50 characters)
- **name**: Stockist name (2-100 characters)
- **aadharId**: 12-digit Aadhar ID
- **aadharName**: Name as per Aadhar (2-100 characters)
- **address1**: Primary address (5-200 characters)
- **pinCode**: 6-digit PIN code
- **phone**: Valid phone number
- **email**: Valid email address
- **panNo**: PAN number in format ABCDE1234F
- **type**: Either "Credit Party" or "Debit Party"

### Optional Fields
- **address2**: Secondary address (max 200 characters)
- **device**: Device information (max 100 characters)
- **active**: Boolean (default: true)
- **isSeller**: Boolean (default: false)
- **allowMail**: Boolean (default: true)

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "path": "aadharId",
        "message": "Aadhar ID must be exactly 12 digits"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authorization header is missing. Please provide: Authorization: Bearer <token>",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. This endpoint requires admin role, but your token has role: 'user'. Please use an admin token.",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Stockist not found",
  "data": null
}
```

### 409 Conflict - Duplicate Data
```json
{
  "success": false,
  "message": "Stockist with this code already exists",
  "data": {
    "error": "DUPLICATE_CODE",
    "field": "code",
    "value": "STK001"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": {
    "error": "INTERNAL_SERVER_ERROR",
    "details": "An unexpected error occurred"
  }
}
```

## Example Usage

### 1. Create a Credit Party Stockist
```bash
curl -X POST http://localhost:3000/api/stockists \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "STK001",
    "name": "ABC Trading Company",
    "aadharId": "123456789012",
    "aadharName": "John Doe",
    "address1": "123 Main Street",
    "pinCode": "123456",
    "phone": "+919876543210",
    "email": "john@abctrading.com",
    "panNo": "ABCDE1234F",
    "type": "Credit Party"
  }'
```

### 2. Search for Stockists
```bash
curl -X GET "http://localhost:3000/api/stockists?search=ABC&type=Credit Party&active=true" \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Update Stockist Status
```bash
curl -X POST http://localhost:3000/api/stockists/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"active": false}'
```

## Notes

1. **Unique Constraints**: Code, email, aadharId, and panNo must be unique across all stockists.
2. **Authentication**: All endpoints require valid Admin JWT token.
3. **Pagination**: Default page size is 10, maximum is 100.
4. **Search**: Search works across code, name, aadharName, email, phone, and panNo fields.
5. **Soft Delete**: Consider implementing soft delete instead of hard delete for audit purposes.
6. **Audit Trail**: All operations are logged with the creating admin's ID.
