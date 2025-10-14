# Ticket Management API Documentation

## Overview
The Ticket Management API allows Users to create and manage lottery tickets. All endpoints require User authentication.

## Authentication
All Ticket API endpoints require User JWT token in the Authorization header:
```
Authorization: Bearer <user_jwt_token>
```

## API Endpoints

### 1. Create Ticket
- **Method**: POST
- **Path**: `/api/tickets`
- **Authentication**: User JWT required
- **Body**:
```json
{
  "item_code": "ITM-001",
  "full_ticket_name": "Super Lottery Ticket",
  "group_name": "Group A",
  "draw_time": "10:30",
  "draw_day": "Friday",
  "ticket_type": "Bumper",
  "state_name": "Maharashtra",
  "number_of_digits": 5,
  "book_contains": 100,
  "ticket_unique_id": "TKT-00001",
  "select_same": "68e8bf9e391f13a8d3c07539"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 1,
    "item_code": "ITM-001",
    "full_ticket_name": "Super Lottery Ticket",
    "group_name": "Group A",
    "draw_time": "10:30",
    "draw_day": "Friday",
    "ticket_type": "Bumper",
    "state_name": "Maharashtra",
    "number_of_digits": 5,
    "book_contains": 100,
    "ticket_unique_id": "TKT-00001",
    "select_same": "65f8a1b2c3d4e5f6a7b8c9d0",
    "created_at": "2025-10-10T09:00:00.000Z"
  }
}
```

**Response (400 Bad Request - Validation Error)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "path": "item_code",
        "message": "\"item_code\" is required"
      }
    ]
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Authorization header is missing. Please provide: Authorization: Bearer <token>",
  "data": null
}
```

**Response (403 Forbidden)**:
```json
{
  "success": false,
  "message": "Access denied. This endpoint requires user role, but your token has role: 'admin'. Please use a user token.",
  "data": null
}
```

**Response (500 Internal Server Error)**:
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

## Field Validation Rules

- **item_code**: Required string, 1-100 characters
- **full_ticket_name**: Optional string
- **group_name**: Optional string
- **draw_time**: Optional string
- **draw_day**: Optional string
- **ticket_type**: Optional string, must be "Bumper" or "Weekly"
- **state_name**: Optional string
- **number_of_digits**: Optional integer, minimum 0
- **book_contains**: Optional integer, minimum 0
- **ticket_unique_id**: Optional string (must be unique if provided)
- **select_same**: Optional string (valid MongoDB ObjectId referencing SameMaster rule)

## Auto-Generated Fields

- **id**: Auto-incrementing integer starting from 1 (Primary Key)
- **created_at**: Timestamp when the ticket was created
- **updated_at**: Timestamp when the ticket was last updated

## Example Requests

### Minimal Request (Only Required Fields)
```json
{
  "item_code": "ITM-001"
}
```

### Complete Request
```json
{
  "item_code": "ITM-002",
  "full_ticket_name": "Weekly Lottery Ticket",
  "group_name": "Group B",
  "assign_to_admin": "admin456",
  "draw_time": "15:00",
  "draw_day": "Sunday",
  "ticket_type": "Weekly",
  "state_name": "Delhi",
    "number_of_digits": 6,
    "book_contains": 200,
    "ticket_unique_id": "TKT-00002",
    "select_same": "65f8a1b2c3d4e5f6a7b8c9d1"
}
```

## Error Responses

### Validation Errors
Common validation errors include:
- Missing required fields
- Invalid data types
- String length violations
- Negative numbers for integer fields

### Authentication Errors
- Missing Authorization header
- Invalid token format
- Expired token
- Insufficient permissions (non-user role)

### Server Errors
- Database connection issues
- Internal server errors
- Duplicate unique field values

## Usage Notes

1. **Auto-incrementing ID**: The `id` field is automatically generated and increments starting from 1. You cannot specify this field in the request.

2. **Unique Constraints**: 
   - `ticket_unique_id` must be unique across all tickets if provided
   - `id` is automatically unique (auto-increment)

3. **Optional Fields**: All fields except `item_code` are optional and can be omitted from the request.

4. **Timestamps**: `created_at` and `updated_at` are automatically managed by the system.

5. **User Only**: This endpoint is restricted to users with User role. Super Admin and Admin users cannot access this endpoint.

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_jwt_token>" \
  -d '{
    "item_code": "ITM-001",
    "full_ticket_name": "Test Lottery Ticket",
    "group_name": "Test Group",
    "draw_time": "10:30",
    "draw_day": "Friday",
    "ticket_type": "Bumper",
    "state_name": "Maharashtra",
    "number_of_digits": 5,
    "book_contains": 100,
    "ticket_unique_id": "TKT-00001",
    "select_same": "65f8a1b2c3d4e5f6a7b8c9d0"
  }'
```

## Response Format

All responses follow a consistent format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null
}
```

- **success**: Indicates if the request was successful
- **message**: Human-readable message describing the result
- **data**: Contains the response data (ticket object on success, null on error)
