# API Documentation

This document describes the REST API endpoints available in the Reeve Indexing Example application.

## Base URL

- **Development**: `http://localhost:9000`
- **API Base Path**: `/api/v1`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## OpenAPI Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:9000/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:9000/v3/api-docs`

## Endpoints

### Organizations

#### Get All Organizations
```http
GET /api/v1/organisations
```

**Description**: Retrieves a list of all organizations that have published data on the blockchain.

**Response**:
```json
[
  {
    "id": "org-uuid-1",
    "name": "Organization Name",
    "custCode": "ORG001"
  }
]
```

**Response Codes**:
- `200 OK`: Successfully retrieved organizations
- `500 Internal Server Error`: Server error

---

### Reports

#### Search Reports
```http
POST /api/v1/reports
```

**Description**: Search for financial reports with filtering capabilities.

**Request Body**:
```json
{
  "organisationId": "org-uuid-1",
  "reportType": "BALANCE_SHEET",
  "intervalType": "YEARLY",
  "year": 2024,
  "period": 1
}
```

**Request Parameters**:
- `organisationId` (string, optional): Filter by organization ID
- `reportType` (string, optional): Type of report
  - Available values: `BALANCE_SHEET`, `INCOME_STATEMENT`, `CASH_FLOW`
- `intervalType` (string, optional): Interval type
  - Available values: `YEARLY`, `QUARTERLY`, `MONTHLY`
- `year` (integer, optional): Year filter
- `period` (integer, optional): Period within the year

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "report-uuid-1",
      "reportType": "BALANCE_SHEET",
      "organisationId": "org-uuid-1",
      "year": 2024,
      "period": 1,
      "intervalType": "YEARLY",
      "reportData": {
        "totalAssets": 1000000,
        "totalLiabilities": 600000,
        "equity": 400000
      },
      "transactionHash": "tx-hash-123",
      "blockNumber": 12345678,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Response Codes**:
- `200 OK`: Successfully retrieved reports
- `404 Not Found`: Organization not found (when organisationId provided)
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error

---

### Transactions

#### Search Transactions
```http
POST /api/v1/transactions
```

**Description**: Search for Reeve transactions with pagination support.

**Request Body**:
```json
{
  "organisationId": "org-uuid-1",
  "fromDate": "2024-01-01T00:00:00Z",
  "toDate": "2024-12-31T23:59:59Z",
  "transactionType": "REPORT_SUBMISSION"
}
```

**Request Parameters**:
- `organisationId` (string, optional): Filter by organization ID
- `fromDate` (string, optional): Start date filter (ISO 8601 format)
- `toDate` (string, optional): End date filter (ISO 8601 format)
- `transactionType` (string, optional): Type of transaction
  - Available values: `REPORT_SUBMISSION`, `ORGANIZATION_REGISTRATION`

**Query Parameters**:
- `page` (integer, default: 0): Page number (0-based)
- `size` (integer, default: 20): Page size
- `sort` (string, default: "timestamp,desc"): Sort criteria

**Response**:
```json
{
  "content": [
    {
      "id": "tx-uuid-1",
      "transactionHash": "99a20f54f25bf9168719cb2ce00e25ab01c4a458e0500cf3a699a7c8ce3c0cdf",
      "organisationId": "org-uuid-1",
      "transactionType": "REPORT_SUBMISSION",
      "blockNumber": 12345678,
      "slotNumber": 159983856,
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "label": "1447",
        "data": {
          "reportType": "BALANCE_SHEET",
          "year": 2024,
          "period": 1
        }
      }
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "ascending": false
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

**Response Codes**:
- `200 OK`: Successfully retrieved transactions
- `404 Not Found`: Organization not found (when organisationId provided)
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error

## Error Responses

All endpoints return standardized error responses following RFC 7807 Problem Details format:

```json
{
  "type": "about:blank",
  "title": "ORGANISATION_NOT_FOUND",
  "status": 404,
  "detail": "Unable to find Organisation by Id: invalid-org-id",
  "instance": "/api/v1/reports"
}
```

## Data Types

### Report Types
- `BALANCE_SHEET`: Balance sheet financial reports
- `INCOME_STATEMENT`: Income statement reports
- `CASH_FLOW`: Cash flow statements

### Interval Types
- `YEARLY`: Annual reports
- `QUARTERLY`: Quarterly reports
- `MONTHLY`: Monthly reports

### Transaction Types
- `REPORT_SUBMISSION`: Financial report submissions
- `ORGANIZATION_REGISTRATION`: Organization registration transactions

## Examples

### Get organizations and then search their reports

1. **Get all organizations:**
```bash
curl -X GET "http://localhost:9000/api/v1/organisations"
```

2. **Search reports for a specific organization:**
```bash
curl -X POST "http://localhost:9000/api/v1/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "organisationId": "org-uuid-from-step-1",
    "reportType": "BALANCE_SHEET",
    "year": 2024
  }'
```

3. **Search transactions with pagination:**
```bash
curl -X POST "http://localhost:9000/api/v1/transactions?page=0&size=10" \
  -H "Content-Type: application/json" \
  -d '{
    "organisationId": "org-uuid-from-step-1"
  }'
```
