# Same Master API Documentation

Base URL: `/api/same-master`

**⚠️ IMPORTANT: All Same Master endpoints require Super Admin authentication.**

## Authentication

All endpoints require a valid Super Admin JWT token in the Authorization header:
```
Authorization: Bearer <super_admin_jwt_token>
```

## API Endpoints

### 1. Create Same Master Rule
- **Method**: POST
- **Path**: `/api/same-master`
- **Authentication**: Super Admin JWT required
- **Body**:
```json
{
  "same_number": "5",
  "page_logic": "WITHOUT_PAGE_LOGIC",
  "series_numbers": "21,22,23,24,25",
  "page_no_logic": "ABCDE"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Same Master rule created successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "same_number": "5",
    "page_logic": "WITHOUT_PAGE_LOGIC",
    "series_numbers": "21,22,23,24,25",
    "page_no_logic": "ABCDE",
    "is_active": true,
    "priority": 10,
    "created_by": "65f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Same Master Rules
- **Method**: GET
- **Path**: `/api/same-master`
- **Authentication**: Super Admin JWT required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Records per page (default: 10)
  - `is_active` (optional): Filter by active status (true/false)
  - `page_logic` (optional): Filter by page logic type

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Same Master rules retrieved successfully",
  "data": {
    "rules": [
      {
        "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
        "same_number": "5",
        "page_logic": "no",
        "series_numbers": "21,22,23,24,25",
        "page_no_logic": "ABCDE",
        "is_active": true,
        "priority": 10,
        "created_by": {
          "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
          "fullName": "Super Admin",
          "email": "superadmin@example.com"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_records": 1,
      "limit": 10
    }
  }
}
```

### 3. Get Same Master Rule by ID
- **Method**: GET
- **Path**: `/api/same-master/:id`
- **Authentication**: Super Admin JWT required

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Same Master rule retrieved successfully",
  "data": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "same_number": "5",
    "page_logic": "yes",
    "series_numbers": "21,22,23,24,25",
    "page_no_logic": "ABCDE",
    "is_active": true,
    "priority": 10,
    "created_by": {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
      "fullName": "Super Admin",
      "email": "superadmin@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Same Master Rule
- **Method**: POST
- **Path**: `/api/same-master/:id`
- **Authentication**: Super Admin JWT required
- **Body** (at least one field required):
```json
{
  "priority": 15,
  "is_active": false
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Same Master rule updated successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "same_number": "5",
    "page_logic": "yes",
    "series_numbers": "21,22,23,24,25",
    "page_no_logic": "ABCDE",
    "is_active": false,
    "priority": 15,
    "created_by": "65f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 5. Delete Same Master Rule (Soft Delete)
- **Method**: POST
- **Path**: `/api/same-master/delete/:id`
- **Authentication**: Super Admin JWT required

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Same Master rule deactivated successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "same_number": "5",
    "is_active": false,
    "deactivatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 6. Match Tickets Against Rules
- **Method**: POST
- **Path**: `/api/same-master/match-tickets`
- **Authentication**: Super Admin JWT required
- **Body**:
```json
{
  "tickets": [
    {
      "ticket_id": "ticket_001",
      "ticket_no": "20A5",
      "series": "20",
      "page_number": 1,
      "metadata": {}
    },
    {
      "ticket_id": "ticket_002",
      "ticket_no": "21B5",
      "series": "21",
      "page_number": 2,
      "metadata": {}
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Ticket matching completed successfully",
  "data": {
    "matched": [
      {
        "ticket_id": "ticket_001",
        "ticket_no": "20A5",
        "rule_id": "65f8a1b2c3d4e5f6a7b8c9d0",
        "matched_by": "5",
        "priority": 10,
        "all_matches": [
          {
            "rule_id": "65f8a1b2c3d4e5f6a7b8c9d0",
            "priority": 10,
            "matched_by": "5"
          }
        ]
      }
    ],
    "unmatched": [
      {
        "ticket_id": "ticket_002",
        "ticket_no": "21B5"
      }
    ],
    "total_processed": 2,
    "total_matched": 1,
    "total_unmatched": 1
  }
}
```

### 7. Generate Ticket Combinations
- **Method**: POST
- **Path**: `/api/same-master/generate-combinations`
- **Authentication**: Super Admin JWT required
- **Body**:
```json
{
  "same_number": "5",
  "series_numbers": "20,21,22,23,24,25",+
  "letters": "ABCDE"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Combinations generated successfully",
  "data": {
    "same_number": "5",
    "series_numbers": "20,21,22,23,24,25",
    "letters": "ABCDE",
    "combinations": [
      "20A,20B,20C,20D,20E",
      "21A,21B,21C,21D,21E",
      "22A,22B,22C,22D,22E",
      "23A,23B,23C,23D,23E",
      "24A,24B,24C,24D,24E",
      "25A,25B,25C,25D,25E"
    ],
    "total_combinations": 30
  }
}
```

### 8. Get Audit Logs
- **Method**: GET
- **Path**: `/api/same-master/audit/logs`
- **Authentication**: Super Admin JWT required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Records per page (default: 10)
  - `same_master_id` (optional): Filter by rule ID
  - `executed_by` (optional): Filter by executor ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "audit_logs": [
      {
        "_id": "65f8a1b2c3d4e5f6a7b8c9d2",
        "same_master_id": {
          "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
          "same_number": "5",
          "page_logic": "WITHOUT_PAGE_LOGIC",
          "priority": 10
        },
        "executed_by": {
          "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
          "fullName": "Super Admin",
          "email": "superadmin@example.com"
        },
        "executed_at": "2024-01-15T10:30:00.000Z",
        "matched_ticket_count": 2,
        "matched_ticket_ids": ["ticket_001", "ticket_002"],
        "payload": {
          "input_summary": {
            "total_tickets": 5,
            "matched_tickets": 2
          }
        },
        "rule_details": {
          "same_number": "5",
          "page_logic": "WITHOUT_PAGE_LOGIC",
          "priority": 10
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_records": 1,
      "limit": 10
    }
  }
}
```

## Page Logic Details Examples

### 1. Suffix Rule
```json
{
  "type": "suffix",
  "match_length": 1,
  "pattern": "same_number"
}
```

### 2. Page Range Rule
```json
{
  "type": "page_range",
  "pages": [1, 3, 5],
  "apply_on": "page_number"
}
```

Or with range:
```json
{
  "type": "page_range",
  "pages": {
    "from": 1,
    "to": 10
  },
  "apply_on": "page_number"
}
```

### 3. Letter Set Rule
```json
{
  "type": "letter_set",
  "letters": ["A", "B", "C", "D", "E"],
  "apply_on": "prefix",
  "format": "{L}{NUMBER}"
}
```

## Field Validation Rules

- **same_number**: Required string, 1-50 characters
- **page_logic**: Required enum ['WITHOUT_PAGE_LOGIC', 'WITH_PAGE_LOGIC']
- **page_logic_details**: Optional, valid JSON object
- **series_numbers**: Optional, comma-separated numbers or JSON array
- **page_no_logic**: Optional, letters only (e.g., "ABCDE")
- **is_active**: Optional boolean, default true
- **priority**: Optional integer, 0-1000, default 0

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "path": "same_number",
        "message": "same_number is required"
      }
    ]
  }
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Authorization header is missing. Please provide: Authorization: Bearer <token>",
  "data": null
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

## Usage Examples

### Create Rule with Page Logic
```bash
POST {{base_url}}/api/same-master
Authorization: Bearer {{super_admin_token}}
Content-Type: application/json

{
  "same_number": "5",
  "page_logic": "WITH_PAGE_LOGIC",
  "page_logic_details": {
    "type": "suffix",
    "match_length": 1,
    "pattern": "same_number"
  },
  "series_numbers": "20,21,22,23,24,25",
  "priority": 10
}
```

### Match Tickets
```bash
POST {{base_url}}/api/same-master/match-tickets
Authorization: Bearer {{super_admin_token}}
Content-Type: application/json

{
  "tickets": [
    {
      "ticket_id": "ticket_001",
      "ticket_no": "20A5",
      "series": "20",
      "page_number": 1
    }
  ]
}
```

### Generate Combinations
```bash
POST {{base_url}}/api/same-master/generate-combinations
Authorization: Bearer {{super_admin_token}}
Content-Type: application/json

{
  "same_number": "5",
  "series_numbers": "20,21,22,23,24,25",
  "letters": "ABCDE"
}
```

## Performance Notes

- Rules are loaded once and cached for the matching session
- Series numbers are pre-processed into lookup maps for O(1) access
- Matching is done in-memory for optimal performance
- Audit entries are created in batch for better database performance
- Use pagination for large result sets
