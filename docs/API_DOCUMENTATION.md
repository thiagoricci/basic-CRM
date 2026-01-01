# CRM Contact Manager - API Documentation

## Overview

The CRM Contact Manager provides RESTful API endpoints for external integrations, webhooks, and third-party tools to manage contacts programmatically.

**Base URL:** `http://localhost:3000/api` (development) or your production domain

**Authentication:** Currently no authentication (MVP phase). All endpoints are publicly accessible.

---

## Endpoints

### 1. Create Contact

Create a new contact in the CRM system.

**Endpoint:** `POST /api/contacts`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-0123",
  "status": "lead",
  "jobTitle": "Software Engineer",
  "companyId": "550e8400-e29b-41d4-a716-4466554400000"
}
```

#### Field Validation

| Field         | Type   | Required | Validation                                  |
| ------------- | ------ | -------- | ------------------------------------------- |
| `firstName`   | string | Yes      | 1-50 characters                             |
| `lastName`    | string | Yes      | 1-50 characters                             |
| `email`       | string | Yes      | Valid email format, must be unique          |
| `phoneNumber` | string | No       | 10-20 characters, must be unique (optional) |
| `status`      | string | Yes      | Must be `"lead"` or `"customer"`            |
| `jobTitle`    | string | No       | Max 100 characters (optional)               |
| `companyId`   | string | No       | Valid UUID of existing company (optional)   |

#### Success Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}
```

#### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "data": null,
  "error": "First name is required"
}
```

**400 Bad Request - Duplicate Email**

```json
{
  "data": null,
  "error": "Email already exists"
}
```

**500 Internal Server Error**

```json
{
  "data": null,
  "error": "Failed to create contact"
}
```

---

### 2. List All Contacts

Retrieve all contacts in the system.

**Endpoint:** `GET /api/contacts`

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1-555-0123",
      "status": "lead",
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z"
    }
  ],
  "error": null
}
```

---

### 3. Get Single Contact

Retrieve a specific contact by ID.

**Endpoint:** `GET /api/contacts/{id}`

#### URL Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | UUID of the contact |

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}
```

#### Error Response (404 Not Found)

```json
{
  "data": null,
  "error": "Contact not found"
}
```

---

### 4. Update Contact

Update an existing contact.

**Endpoint:** `PUT /api/contacts/{id}`

**Content-Type:** `application/json`

#### URL Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | UUID of the contact |

#### Request Body

Same as Create Contact (all fields optional except email uniqueness check)

**Important:** When updating `companyId`, the contact will be linked to the specified company. Setting `companyId` to `null` or empty string will unlink the contact from its current company.

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+1-555-0987",
  "status": "customer"
}
```

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "+1-555-0987",
    "status": "customer",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:45:00.000Z"
  },
  "error": null
}
```

---

### 5. Delete Contact

Delete a contact from the system.

**Endpoint:** `DELETE /api/contacts/{id}`

#### URL Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | UUID of the contact |

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}
```

---

### 6. List All Activities

Retrieve all activities in the system with optional filtering.

**Endpoint:** `GET /api/activities`

#### Query Parameters

| Parameter   | Type   | Description                                                        |
| ----------- | ------ | ------------------------------------------------------------------ |
| `contactId` | string | Filter by contact ID (UUID)                                        |
| `type`      | string | Filter by activity type (`call`, `email`, `meeting`, `note`)       |
| `search`    | string | Search in subject, description, or contact name (case-insensitive) |
| `fromDate`  | string | Filter activities created on or after this date (ISO 8601 format)  |
| `toDate`    | string | Filter activities created on or before this date (ISO 8601 format) |
| `page`      | number | Page number (default: 1)                                           |
| `limit`     | number | Items per page (default: 20)                                       |

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "type": "call",
      "subject": "Initial consultation",
      "description": "Discussed project requirements",
      "contactId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z",
      "contact": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "error": null,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 7. Create Activity

Create a new activity in the CRM system.

**Endpoint:** `POST /api/activities`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "type": "call",
  "subject": "Initial consultation",
  "description": "Discussed project requirements",
  "contactId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Field Validation

| Field         | Type   | Required | Validation                                            |
| ------------- | ------ | -------- | ----------------------------------------------------- |
| `type`        | string | Yes      | Must be `"call"`, `"email"`, `"meeting"`, or `"note"` |
| `subject`     | string | Yes      | 1-255 characters                                      |
| `description` | string | No       | Max 1000 characters (optional)                        |
| `contactId`   | string | Yes      | Valid UUID of existing contact                        |

#### Success Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "call",
    "subject": "Initial consultation",
    "description": "Discussed project requirements",
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}
```

#### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "data": null,
  "error": "Subject is required"
}
```

**404 Not Found - Contact Not Found**

```json
{
  "data": null,
  "error": "Contact not found"
}
```

---

### 8. Get Single Activity

Retrieve a specific activity by ID.

**Endpoint:** `GET /api/activities/{id}`

#### URL Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | UUID of the activity |

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "call",
    "subject": "Initial consultation",
    "description": "Discussed project requirements",
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z",
    "contact": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "error": null
}
```

#### Error Response (404 Not Found)

```json
{
  "data": null,
  "error": "Activity not found"
}
```

---

### 9. Update Activity

Update an existing activity.

**Endpoint:** `PUT /api/activities/{id}`

**Content-Type:** `application/json`

#### URL Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | UUID of the activity |

#### Request Body

Only `subject` and `description` can be updated. `type` and `contactId` cannot be changed.

```json
{
  "subject": "Updated consultation",
  "description": "Updated description"
}
```

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "call",
    "subject": "Updated consultation",
    "description": "Updated description",
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T19:00:00.000Z"
  },
  "error": null
}
```

---

### 10. Delete Activity

Delete an activity from the system.

**Endpoint:** `DELETE /api/activities/{id}`

#### URL Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | UUID of the activity |

#### Success Response (200 OK)

```json
{
  "data": null,
  "error": null
}
```

---

### 11. List All Tasks

Retrieve all tasks in the system with optional filtering.

**Endpoint:** `GET /api/tasks`

#### Query Parameters

| Parameter   | Type   | Description                                                               |
| ----------- | ------ | ------------------------------------------------------------------------- |
| `status`    | string | Filter by status (`all`, `open`, `completed`, `overdue`) (default: `all`) |
| `priority`  | string | Filter by priority (`all`, `low`, `medium`, `high`) (default: `all`)      |
| `startDate` | string | Filter tasks due on or after this date (ISO 8601 format)                  |
| `endDate`   | string | Filter tasks due on or before this date (ISO 8601 format)                 |
| `search`    | string | Search by title (case-insensitive)                                        |
| `contactId` | string | Filter by contact ID (UUID)                                               |

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Follow up call",
      "description": "Schedule follow-up call with client",
      "dueDate": "2025-12-31T18:00:00.000Z",
      "priority": "high",
      "completed": false,
      "completedAt": null,
      "contactId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z",
      "contact": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "error": null
}
```

---

### 12. Create Task

Create a new task in the CRM system.

**Endpoint:** `POST /api/tasks`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "title": "Follow up call",
  "description": "Schedule follow-up call with client",
  "dueDate": "2025-12-31T18:00:00.000Z",
  "priority": "high",
  "contactId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Field Validation

| Field         | Type   | Required | Validation                               |
| ------------- | ------ | -------- | ---------------------------------------- |
| `title`       | string | Yes      | 1-255 characters                         |
| `description` | string | No       | Max 1000 characters (optional)           |
| `dueDate`     | string | Yes      | Valid ISO 8601 date format               |
| `priority`    | string | Yes      | Must be `"low"`, `"medium"`, or `"high"` |
| `contactId`   | string | Yes      | Valid UUID of existing contact           |

#### Success Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Follow up call",
    "description": "Schedule follow-up call with client",
    "dueDate": "2025-12-31T18:00:00.000Z",
    "priority": "high",
    "completed": false,
    "completedAt": null,
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z",
    "contact": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "error": null
}
```

#### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "data": null,
  "error": "Invalid input data"
}
```

**404 Not Found - Contact Not Found**

```json
{
  "data": null,
  "error": "Contact not found"
}
```

---

### 13. Get Single Task

Retrieve a specific task by ID.

**Endpoint:** `GET /api/tasks/{id}`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the task |

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Follow up call",
    "description": "Schedule follow-up call with client",
    "dueDate": "2025-12-31T18:00:00.000Z",
    "priority": "high",
    "completed": false,
    "completedAt": null,
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z",
    "contact": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "error": null
}
```

#### Error Response (404 Not Found)

```json
{
  "data": null,
  "error": "Task not found"
}
```

---

### 14. Update Task

Update an existing task.

**Endpoint:** `PUT /api/tasks/{id}`

**Content-Type:** `application/json`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the task |

#### Request Body

All fields are optional. Provide only the fields you want to update.

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "dueDate": "2026-01-01T18:00:00.000Z",
  "priority": "medium",
  "contactId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Updated task title",
    "description": "Updated description",
    "dueDate": "2026-01-01T18:00:00.000Z",
    "priority": "medium",
    "completed": false,
    "completedAt": null,
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T19:00:00.000Z",
    "contact": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "error": null
}
```

---

### 15. Delete Task

Delete a task from the system.

**Endpoint:** `DELETE /api/tasks/{id}`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the task |

#### Success Response (200 OK)

```json
{
  "data": null,
  "error": null
}
```

---

### 16. Toggle Task Completion

Toggle the completion status of a task.

**Endpoint:** `PATCH /api/tasks/{id}`

**Content-Type:** `application/json`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the task |

#### Request Body

```json
{
  "completed": true
}
```

#### Field Validation

| Field       | Type    | Required | Validation                |
| ----------- | ------- | -------- | ------------------------- |
| `completed` | boolean | Yes      | Must be `true` or `false` |

When setting `completed` to `true`, the `completedAt` timestamp is automatically set to the current time. When setting to `false`, `completedAt` is cleared.

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Follow up call",
    "description": "Schedule follow-up call with client",
    "dueDate": "2025-12-31T18:00:00.000Z",
    "priority": "high",
    "completed": true,
    "completedAt": "2025-12-30T19:00:00.000Z",
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T19:00:00.000Z",
    "contact": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "error": null
}
```

---

### 17. Get Dashboard Data

Retrieve dashboard analytics and recent data.

**Endpoint:** `GET /api/dashboard`

#### Success Response (200 OK)

```json
{
  "data": {
    "totalContacts": 150,
    "totalLeads": 100,
    "totalCustomers": 50,
    "conversionRate": 33.33,
    "contacts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "status": "lead",
        "createdAt": "2025-12-30T18:30:00.000Z"
      }
    ],
    "recentActivities": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "type": "call",
        "subject": "Initial consultation",
        "description": "Discussed project requirements",
        "createdAt": "2025-12-30T18:30:00.000Z",
        "contact": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "growthData": [
      {
        "date": "Dec 1",
        "count": 5
      },
      {
        "date": "Dec 2",
        "count": 3
      }
    ],
    "tasksDueToday": 5,
    "upcomingTasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "title": "Follow up call",
        "description": "Schedule follow-up call with client",
        "dueDate": "2025-12-31T18:00:00.000Z",
        "priority": "high",
        "completed": false,
        "contactId": "550e8400-e29b-41d4-a716-446655440000",
        "contact": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  },
  "error": null
}
```

#### Response Fields

| Field              | Type   | Description                                                |
| ------------------ | ------ | ---------------------------------------------------------- |
| `totalContacts`    | number | Total number of contacts in the system                     |
| `totalLeads`       | number | Number of contacts with status "lead"                      |
| `totalCustomers`   | number | Number of contacts with status "customer"                  |
| `conversionRate`   | number | Percentage of customers (customers / total \* 100)         |
| `contacts`         | array  | Last 5 contacts created                                    |
| `recentActivities` | array  | Last 5 activities created                                  |
| `growthData`       | array  | Contact growth data for last 30 days                       |
| `tasksDueToday`    | number | Number of tasks due today (not completed)                  |
| `upcomingTasks`    | array  | Next 5 upcoming tasks (not completed, ordered by due date) |

---

## Integration Examples

### cURL

```bash
# Create a contact
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead"
  }'

# List all contacts
curl http://localhost:3000/api/contacts

# Get specific contact
curl http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000

# Update contact
curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "status": "customer"
  }'

# Delete contact
curl -X DELETE http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000
```

---

### JavaScript / Node.js

```javascript
const API_BASE_URL = 'http://localhost:3000/api';

// Create a contact
async function createContact(contactData) {
  const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data;
}

// Usage
const newContact = await createContact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0123',
  status: 'lead',
});

console.log('Created contact:', newContact);
```

---

### Python

```python
import requests
import json

API_BASE_URL = 'http://localhost:3000/api'

def create_contact(contact_data):
    response = requests.post(
        f'{API_BASE_URL}/contacts',
        headers={'Content-Type': 'application/json'},
        json=contact_data
    )
    result = response.json()

    if result.get('error'):
        raise Exception(result['error'])

    return result['data']

# Usage
new_contact = create_contact({
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john.doe@example.com',
    'phoneNumber': '+1-555-0123',
    'status': 'lead'
})

print('Created contact:', new_contact)
```

---

### PHP

```php
<?php

$API_BASE_URL = 'http://localhost:3000/api';

function createContact($contactData) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $API_BASE_URL . '/contacts');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($contactData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);

    $response = curl_exec($ch);
    $result = json_decode($response, true);

    curl_close($ch);

    if ($result['error']) {
        throw new Exception($result['error']);
    }

    return $result['data'];
}

// Usage
$newContact = createContact([
    'firstName' => 'John',
    'lastName' => 'Doe',
    'email' => 'john.doe@example.com',
    'phoneNumber' => '+1-555-0123',
    'status' => 'lead'
]);

print_r($newContact);
?>
```

---

### Ruby

```ruby
require 'net/http'
require 'json'
require 'uri'

API_BASE_URL = 'http://localhost:3000/api'

def create_contact(contact_data)
  uri = URI("#{API_BASE_URL}/contacts")

  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
  request.body = contact_data.to_json

  response = http.request(request)
  result = JSON.parse(response.body)

  raise result['error'] if result['error']

  result['data']
end

# Usage
new_contact = create_contact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0123',
  status: 'lead'
})

puts new_contact.inspect
```

---

## Webhook Integration Patterns

### Zapier Webhook

1. Create a Zap with your trigger app (e.g., Typeform, Google Forms)
2. Add "Webhooks by Zapier" as action
3. Choose "POST" method
4. URL: `http://your-domain.com/api/contacts`
5. Headers: `Content-Type: application/json`
6. Payload: Map form fields to JSON structure

Example Zapier payload mapping:

```json
{
  "firstName": "{{First Name}}",
  "lastName": "{{Last Name}}",
  "email": "{{Email}}",
  "phoneNumber": "{{Phone Number}}",
  "status": "lead"
}
```

---

### Make.com (Integromat) Webhook

1. Create a new scenario
2. Add "Webhooks" module → "Make a webhook request"
3. Method: POST
4. URL: `http://your-domain.com/api/contacts`
5. Headers:
   - `Content-Type`: `application/json`
6. Body: JSON structure with mapped variables

---

### Custom Webhook Handler (Node.js Example)

```javascript
// webhook-handler.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/contact', async (req, res) => {
  try {
    // Transform incoming webhook data to CRM format
    const contactData = {
      firstName: req.body.first_name || req.body.firstName,
      lastName: req.body.last_name || req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phone || req.body.phoneNumber,
      status: req.body.status || 'lead',
    };

    // Forward to CRM API
    const response = await fetch('http://localhost:3000/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const result = await response.json();

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, contact: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(4000, () => {
  console.log('Webhook handler running on port 4000');
});
```

---

### n8n Workflow

1. Create a new workflow
2. Add "Webhook" trigger node
3. Set method to POST
4. Add "HTTP Request" node
5. Configure:
   - Method: POST
   - URL: `http://your-domain.com/api/contacts`
   - Authentication: None
   - Body Content Type: JSON
   - Body Parameters:
     ```
     firstName: {{$json.firstName}}
     lastName: {{$json.lastName}}
     email: {{$json.email}}
     phoneNumber: {{$json.phoneNumber}}
     status: {{$json.status}}
     ```

---

## Error Handling Best Practices

### Retry Logic

```javascript
async function createContactWithRetry(contactData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createContact(contactData);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

### Duplicate Email Handling

```javascript
async function createContactSafe(contactData) {
  try {
    return await createContact(contactData);
  } catch (error) {
    if (error.message === 'Email already exists') {
      // Option 1: Update existing contact
      console.log('Contact already exists, updating...');
      return await updateContactByEmail(contactData.email, contactData);

      // Option 2: Skip silently
      // console.log('Contact already exists, skipping...');
      // return null;

      // Option 3: Throw error
      // throw error;
    }
    throw error;
  }
}
```

---

## Security Considerations

### Current State (MVP)

- **No authentication**: All endpoints are publicly accessible
- **No rate limiting**: Unlimited requests allowed
- **No input sanitization**: Relies on Zod validation only
- **HTTPS**: Recommended for production

### Recommendations for Production

1. **Add API Key Authentication**

   ```javascript
   // Middleware example
   const API_KEYS = ['your-secret-key-1', 'your-secret-key-2'];

   function validateApiKey(req) {
     const apiKey = req.headers['x-api-key'];
     return API_KEYS.includes(apiKey);
   }
   ```

2. **Implement Rate Limiting**

   ```javascript
   // Using express-rate-limit
   const rateLimit = require('express-rate-limit');

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });
   ```

3. **Enable HTTPS**
   - Use SSL certificates (Let's Encrypt)
   - Enforce HTTPS redirects

4. **Add Request Logging**
   ```javascript
   app.use((req, res, next) => {
     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
     next();
   });
   ```

---

## Testing the API

### Using Postman

1. Create a new POST request
2. URL: `http://localhost:3000/api/contacts`
3. Headers:
   - `Content-Type`: `application/json`
4. Body (raw JSON):
   ```json
   {
     "firstName": "Test",
     "lastName": "User",
     "email": "test@example.com",
     "phoneNumber": "+1-555-0000",
     "status": "lead"
   }
   ```
5. Click "Send"

### Using Insomnia

Same steps as Postman, or import this collection:

```json
{
  "_type": "export",
  "__export_format": 4,
  "__export_date": "2025-12-30T18:30:00Z",
  "resources": [
    {
      "_id": "req_1",
      "_type": "request",
      "name": "Create Contact",
      "method": "POST",
      "url": "http://localhost:3000/api/contacts",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"phoneNumber\":\"+1-555-0000\",\"status\":\"lead\"}"
      }
    }
  ]
}
```

---

## Common Use Cases

### 1. Form Submission Integration

When a user submits a form on your website:

```javascript
// Form submit handler
async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phoneNumber: document.getElementById('phone').value,
    status: 'lead',
  };

  try {
    const contact = await createContact(formData);
    alert('Contact created successfully!');
    window.location.href = `/contacts/${contact.id}`;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

### 2. Lead Capture from Landing Page

```javascript
// Lead capture popup
async function captureLead(email, name) {
  const [firstName, ...lastNameParts] = name.split(' ');
  const lastName = lastNameParts.join(' ') || '';

  try {
    await createContact({
      firstName,
      lastName,
      email,
      status: 'lead',
    });
    console.log('Lead captured successfully');
  } catch (error) {
    console.error('Failed to capture lead:', error);
  }
}
```

### 3. Customer Registration Sync

```javascript
// After user registration
async function syncCustomerToCRM(user) {
  try {
    await createContact({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phone,
      status: 'customer',
    });
    console.log('Customer synced to CRM');
  } catch (error) {
    if (error.message === 'Email already exists') {
      console.log('Customer already exists in CRM');
    } else {
      console.error('Failed to sync customer:', error);
    }
  }
}
```

---

## Support and Troubleshooting

### Common Issues

**Issue: "Email already exists" error**

**Solution:** Check if the contact already exists using GET /api/contacts, then use PUT to update.

**Issue: "Failed to create contact" error**

**Solution:** Check server logs for detailed error messages. Verify database connection.

**Issue: CORS errors**

**Solution:** Configure CORS headers in Next.js API routes if calling from different domain.

### Debug Mode

Enable detailed logging by checking the server console or adding logging to the API routes.

---

## Future Enhancements

- [ ] API key authentication
- [ ] Rate limiting
- [ ] Webhook notifications on contact changes
- [ ] Bulk import/export endpoints
- [ ] Advanced filtering and search
- [ ] Pagination for large datasets
- [ ] Webhook signature verification
- [ ] API versioning

---

### 18. List All Companies

Retrieve all companies in the system with optional filtering.

**Endpoint:** `GET /api/companies`

#### Query Parameters

| Parameter  | Type   | Description                               |
| ---------- | ------ | ----------------------------------------- |
| `search`   | string | Search by company name (case-insensitive) |
| `industry` | string | Filter by industry                        |
| `page`     | number | Page number (default: 1)                  |
| `limit`    | number | Items per page (default: 20)              |

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-4466554400000",
      "name": "Acme Corporation",
      "industry": "Technology",
      "website": "https://acme.com",
      "phone": "+1-555-0000",
      "address": "123 Tech Street, San Francisco, CA 94102",
      "employeeCount": 500,
      "revenue": 50000000,
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z"
    }
  ],
  "error": null
}
```

---

### 19. Create Company

Create a new company in the CRM system.

**Endpoint:** `POST /api/companies`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "name": "Acme Corporation",
  "industry": "Technology",
  "website": "https://acme.com",
  "phone": "+1-555-0000",
  "address": "123 Tech Street, San Francisco, CA 94102",
  "employeeCount": 500,
  "revenue": 50000000
}
```

#### Field Validation

| Field           | Type   | Required | Validation                       |
| --------------- | ------ | -------- | -------------------------------- |
| `name`          | string | Yes      | 1-255 characters, must be unique |
| `industry`      | string | No       | Max 100 characters (optional)    |
| `website`       | string | No       | Valid URL format (optional)      |
| `phone`         | string | No       | 10-20 characters (optional)      |
| `address`       | string | No       | Max 500 characters (optional)    |
| `employeeCount` | number | No       | Positive integer (optional)      |
| `revenue`       | number | No       | Positive number (optional)       |

#### Success Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-4466554400000",
    "name": "Acme Corporation",
    "industry": "Technology",
    "website": "https://acme.com",
    "phone": "+1-555-0000",
    "address": "123 Tech Street, San Francisco, CA 94102",
    "employeeCount": 500,
    "revenue": 50000000,
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}
```

#### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "data": null,
  "error": "Company name is required"
}
```

**400 Bad Request - Duplicate Company Name**

```json
{
  "data": null,
  "error": "Company name already exists"
}
```

---

### 20. Get Single Company

Retrieve a specific company by ID with its contacts and deals.

**Endpoint:** `GET /api/companies/{id}`

#### URL Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | UUID of the company |

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-4466554400000",
    "name": "Acme Corporation",
    "industry": "Technology",
    "website": "https://acme.com",
    "phone": "+1-555-0000",
    "address": "123 Tech Street, San Francisco, CA 94102",
    "employeeCount": 500,
    "revenue": 50000000,
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z",
    "contacts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "status": "lead"
      }
    ],
    "deals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Enterprise License",
        "value": 50000,
        "stage": "qualified",
        "status": "open"
      }
    ]
  },
  "error": null
}
```

#### Error Response (404 Not Found)

```json
{
  "data": null,
  "error": "Company not found"
}
```

---

### 21. Update Company

Update an existing company.

**Endpoint:** `PUT /api/companies/{id}`

**Content-Type:** `application/json`

#### URL Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | UUID of the company |

#### Request Body

All fields are optional. Provide only fields you want to update.

```json
{
  "name": "Acme Inc.",
  "industry": "Software",
  "revenue": 60000000
}
```

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-4466554400000",
    "name": "Acme Inc.",
    "industry": "Software",
    "website": "https://acme.com",
    "phone": "+1-555-0000",
    "address": "123 Tech Street, San Francisco, CA 94102",
    "employeeCount": 500,
    "revenue": 60000000,
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-31T19:00:00.000Z"
  },
  "error": null
}
```

---

### 22. Delete Company

Delete a company from the system.

**Endpoint:** `DELETE /api/companies/{id}`

#### URL Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | UUID of the company |

#### Success Response (200 OK)

```json
{
  "data": null,
  "error": null
}
```

**Important:** When a company is deleted, all associated contacts and deals will have their `companyId` set to `null` (unlinked). The contacts and deals themselves are NOT deleted, only unlinked from the company.

---

### 23. List All Deals

Retrieve all deals in the system with optional filtering.

**Endpoint:** `GET /api/deals`

#### Query Parameters

| Parameter   | Type   | Description                                                                                   |
| ----------- | ------ | --------------------------------------------------------------------------------------------- |
| `stage`     | string | Filter by stage (`lead`, `qualified`, `proposal`, `negotiation`, `closed_won`, `closed_lost`) |
| `status`    | string | Filter by status (`open`, `won`, `lost`)                                                      |
| `contactId` | string | Filter by contact ID (UUID)                                                                   |
| `companyId` | string | Filter by company ID (UUID)                                                                   |
| `minValue`  | number | Filter deals with value >= this amount                                                        |
| `maxValue`  | number | Filter deals with value <= this amount                                                        |
| `startDate` | string | Filter deals with expected close date on or after this date (ISO 8601)                        |
| `endDate`   | string | Filter deals with expected close date on or before this date (ISO 8601)                       |
| `search`    | string | Search by deal name (case-insensitive)                                                        |
| `page`      | number | Page number (default: 1)                                                                      |
| `limit`     | number | Items per page (default: 20)                                                                  |

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Enterprise Software License",
      "value": 50000,
      "stage": "qualified",
      "expectedCloseDate": "2026-01-31T18:00:00.000Z",
      "actualCloseDate": null,
      "status": "open",
      "probability": 50,
      "description": "Annual enterprise license agreement",
      "contactId": "550e8400-e29b-41d4-a716-446655440001",
      "companyId": "550e8400-e29b-41d4-a716-4466554400000",
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z",
      "contact": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "company": {
        "id": "550e8400-e29b-41d4-a716-4466554400000",
        "name": "Acme Corporation",
        "industry": "Technology"
      }
    }
  ],
  "error": null
}
```

---

### 24. Create Deal

Create a new deal in the CRM system.

**Endpoint:** `POST /api/deals`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "name": "Enterprise Software License",
  "value": 50000,
  "stage": "qualified",
  "expectedCloseDate": "2026-01-31T18:00:00.000Z",
  "status": "open",
  "probability": 50,
  "description": "Annual enterprise license agreement",
  "contactId": "550e8400-e29b-41d4-a716-446655440001",
  "companyId": "550e8400-e29b-41d4-a716-4466554400000"
}
```

#### Field Validation

| Field               | Type   | Required | Validation                                                                                         |
| ------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------- |
| `name`              | string | Yes      | 1-255 characters                                                                                   |
| `value`             | number | Yes      | Must be positive                                                                                   |
| `stage`             | string | Yes      | Must be `"lead"`, `"qualified"`, `"proposal"`, `"negotiation"`, `"closed_won"`, or `"closed_lost"` |
| `expectedCloseDate` | string | Yes      | Valid ISO 8601 date format                                                                         |
| `actualCloseDate`   | string | No       | Valid ISO 8601 date format (optional)                                                              |
| `status`            | string | Yes      | Must be `"open"`, `"won"`, or `"lost"`                                                             |
| `probability`       | number | No       | Must be between 0 and 100 (optional)                                                               |
| `description`       | string | No       | Max 1000 characters (optional)                                                                     |
| `contactId`         | string | Yes      | Valid UUID of existing contact                                                                     |
| `companyId`         | string | No       | Valid UUID of existing company (optional)                                                          |

#### Success Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Enterprise Software License",
    "value": 50000,
    "stage": "qualified",
    "expectedCloseDate": "2026-01-31T18:00:00.000Z",
    "actualCloseDate": null,
    "status": "open",
    "probability": 50,
    "description": "Annual enterprise license agreement",
    "contactId": "550e8400-e29b-41d4-a716-446655440001",
    "companyId": "550e8400-e29b-41d4-a716-4466554400000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}
```

---

### 25. Get Single Deal

Retrieve a specific deal by ID.

**Endpoint:** `GET /api/deals/{id}`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the deal |

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Enterprise Software License",
    "value": 50000,
    "stage": "qualified",
    "expectedCloseDate": "2026-01-31T18:00:00.000Z",
    "actualCloseDate": null,
    "status": "open",
    "probability": 50,
    "description": "Annual enterprise license agreement",
    "contactId": "550e8400-e29b-41d4-a716-446655440001",
    "companyId": "550e8400-e29b-41d4-a716-4466554400000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z",
    "contact": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "company": {
      "id": "550e8400-e29b-41d4-a716-4466554400000",
      "name": "Acme Corporation",
      "industry": "Technology"
    }
  },
  "error": null
}
```

#### Error Response (404 Not Found)

```json
{
  "data": null,
  "error": "Deal not found"
}
```

---

### 26. Update Deal

Update an existing deal.

**Endpoint:** `PUT /api/deals/{id}`

**Content-Type:** `application/json`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the deal |

#### Request Body

All fields are optional. Provide only fields you want to update.

**Important:** When updating `companyId`, the deal will be linked to the specified company. Setting `companyId` to `null` or empty string will unlink the deal from its current company.

```json
{
  "name": "Updated Deal Name",
  "value": 75000,
  "stage": "proposal",
  "companyId": "550e8400-e29b-41d4-a716-4466554400000"
}
```

#### Success Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Updated Deal Name",
    "value": 75000,
    "stage": "proposal",
    "expectedCloseDate": "2026-01-31T18:00:00.000Z",
    "actualCloseDate": null,
    "status": "open",
    "probability": 50,
    "description": "Annual enterprise license agreement",
    "contactId": "550e8400-e29b-41d4-a716-446655440001",
    "companyId": "550e8400-e29b-41d4-a716-4466554400000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-31T19:00:00.000Z"
  },
  "error": null
}
```

---

### 27. Delete Deal

Delete a deal from the system.

**Endpoint:** `DELETE /api/deals/{id}`

#### URL Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `id`      | string | UUID of the deal |

#### Success Response (200 OK)

```json
{
  "data": null,
  "error": null
}
```

---

## Linking Contacts to Companies

To link a contact to a company, include the `companyId` field when creating or updating a contact.

### Example: Create Contact with Company

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "status": "lead",
    "jobTitle": "Software Engineer",
    "companyId": "550e8400-e29b-41d4-a716-4466554400000"
  }'
```

### Example: Link Existing Contact to Company

```bash
curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "550e8400-e29b-41d4-a716-4466554400000"
  }'
```

### Example: Unlink Contact from Company

```bash
curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": ""
  }'
```

**Note:** When you set `companyId` to an empty string or `null`, the contact will be unlinked from its current company.

---

## Linking Deals to Companies

To link a deal to a company, include the `companyId` field when creating or updating a deal.

### Example: Create Deal with Company

```bash
curl -X POST http://localhost:3000/api/deals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Software License",
    "value": 50000,
    "stage": "qualified",
    "expectedCloseDate": "2026-01-31T18:00:00.000Z",
    "status": "open",
    "probability": 50,
    "contactId": "550e8400-e29b-41d4-a716-446655440001",
    "companyId": "550e8400-e29b-41d4-a716-4466554400000"
  }'
```

### Example: Link Existing Deal to Company

```bash
curl -X PUT http://localhost:3000/api/deals/550e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "550e8400-e29b-41d4-a716-4466554400000"
  }'
```

### Example: Unlink Deal from Company

```bash
curl -X PUT http://localhost:3000/api/deals/550e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": ""
  }'
```

**Note:** When you set `companyId` to an empty string or `null`, the deal will be unlinked from its current company.

---

## Cascade Delete Behavior

### When a Company is Deleted

When a company is deleted:

1. **Contacts:** All contacts linked to the company will have their `companyId` set to `null`. The contacts themselves are NOT deleted, only unlinked.
2. **Deals:** All deals linked to the company will have their `companyId` set to `null`. The deals themselves are NOT deleted, only unlinked.
3. **Activities and Tasks:** Since activities and tasks are linked to contacts (not directly to companies), they are NOT affected by company deletion.

This behavior ensures data integrity while allowing you to reassign contacts and deals to different companies after deletion.

---

**Last Updated:** January 1, 2026
**API Version:** 1.1.0
**Contact:** For support, please open an issue in the project repository.
