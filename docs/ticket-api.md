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

### 2. Get All Tickets (Super Admin)
- **Method**: GET
- **Path**: `/api/tickets`
- **Authentication**: Super Admin JWT required
- **Query Params**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10, max: 100)
  - `status` (optional: `pending` | `accepted` | `rejected`)
  - `search` (optional: matches `item_code`, `full_ticket_name`, `group_name`, `state_name`, `ticket_unique_id`)

**Request (cURL)**:
```bash
curl -X GET "http://localhost:3000/api/tickets?page=1&limit=10&status=pending&search=ITM" \
  -H "Authorization: Bearer <super_admin_jwt>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "data": {
    "tickets": [
      {
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
        "status": "pending",
        "approved_by": null,
        "approved_at": null,
        "rejection_reason": null,
        "created_at": "2025-10-10T09:00:00.000Z",
        "updated_at": "2025-10-10T09:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 42,
      "limit": 10
    }
  }
}
```

**Error Responses**
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (non-super admin)
- 500 Internal Server Error

### 3. Approve/Reject Ticket (Super Admin)
- **Method**: POST
- **Path**: `/api/tickets/:id/approve`
- **Authentication**: Super Admin JWT required
- **Params**:
  - `id` (path): MongoDB ObjectId of the ticket
- **Body**:
```json
// Approve
{ "action": "accept" }

// Reject
{ "action": "reject", "rejection_reason": "Duplicate ticket" }
```

**Request (cURL - Approve)**:
```bash
curl -X POST "http://localhost:3000/api/tickets/68ee1f79557aa14d14099a06/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <super_admin_jwt>" \
  -d '{"action":"accept"}'
```

**Request (cURL - Reject)**:
```bash
curl -X POST "http://localhost:3000/api/tickets/68ee1f79557aa14d14099a06/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <super_admin_jwt>" \
  -d '{"action":"reject","rejection_reason":"Duplicate ticket"}'
```

**Response (200 OK - Approved)**:
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": "68ee1f79557aa14d14099a06",
    "item_code": "ITM-001",
    "status": "accepted",
    "approved_by": "66fd2a5c3e1b9a0012abcd34",
    "approved_at": "2025-10-14T10:22:31.123Z",
    "rejection_reason": null,
    "updated_at": "2025-10-14T10:22:31.123Z"
  }
}
```

**Response (200 OK - Rejected)**:
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": "68ee1f79557aa14d14099a06",
    "item_code": "ITM-001",
    "status": "rejected",
    "approved_by": "66fd2a5c3e1b9a0012abcd34",
    "approved_at": "2025-10-14T10:22:31.123Z",
    "rejection_reason": "Duplicate ticket",
    "updated_at": "2025-10-14T10:22:31.123Z"
  }
}
```

**Validation Rules**
- `action`: required, one of `accept` or `reject`
- `rejection_reason`: required when `action` is `reject` (1-500 chars); must be omitted for `accept`

**Error Responses**
- 400 Bad Request (invalid `action`, missing `rejection_reason`, or ticket not in `pending` state)
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (non-super admin)
- 404 Not Found (ticket does not exist)
- 500 Internal Server Error

### 4. Get Ticket By ID (Super Admin)
- **Method**: GET
- **Path**: `/api/tickets/:id`
- **Authentication**: Super Admin JWT required
- **Params**:
  - `id` (path): MongoDB ObjectId of the ticket

**Request (cURL)**:
```bash
curl -X GET "http://localhost:3000/api/tickets/68ee1f79557aa14d14099a06" \
  -H "Authorization: Bearer <super_admin_jwt>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": "68ee1f79557aa14d14099a06",
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
    "status": "pending",
    "approved_by": null,
    "approved_at": null,
    "rejection_reason": null,
    "created_at": "2025-10-10T09:00:00.000Z",
    "updated_at": "2025-10-10T09:00:00.000Z"
  }
}
```

**Error Responses**
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (non-super admin)
- 404 Not Found (ticket does not exist)
- 500 Internal Server Error

### 5. Delete Ticket (Super Admin)
- **Method**: POST
- **Path**: `/api/tickets/:id/delete`
- **Authentication**: Super Admin JWT required
- **Params**:
  - `id` (path): MongoDB ObjectId of the ticket

**Request (cURL)**:
```bash
curl -X POST "http://localhost:3000/api/tickets/68ee1f79557aa14d14099a06/delete" \
  -H "Authorization: Bearer <super_admin_jwt>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "data": {
    "id": "68ee1f79557aa14d14099a06",
    "item_code": "ITM-001",
    "status": "pending",
    "deleted_at": "2025-10-14T10:22:31.123Z"
  }
}
```

**Error Responses**
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (non-super admin)
- 404 Not Found (ticket does not exist)
- 500 Internal Server Error

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "_id": "66ff0c7f8f5c9a2c1a2b3c4d",
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
