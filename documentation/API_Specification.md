# API Specification

## Base URL & Authentication

- All API requests are prefixed with `/api/v1`.
- Authentication is implemented using JSON Web Tokens (JWT).
- Include the JWT in the request header as:

```http
Authorization: Bearer <token>
```

> All protected endpoints require a valid JWT token in the `Authorization` header.

## Standard Error Responses

| HTTP Status | Meaning | Description |
| :--- | :--- | :--- |
| `200 OK` | Success | The request completed successfully. |
| `201 Created` | Resource created | A new resource was successfully created. |
| `400 Bad Request` | Client error | The request payload or parameters are invalid. |
| `401 Unauthorized` | Authentication required | The request does not include a valid JWT token or the token is expired. |
| `403 Forbidden` | Access denied | The authenticated user does not have permission to perform the action. |
| `404 Not Found` | Resource missing | The requested resource does not exist. |
| `500 Internal Server Error` | Server error | The server encountered an unexpected error while processing the request. |

## Endpoint Details

### Authentication Endpoints

#### `POST /api/v1/auth/register`

- Description: Registers a new user account with a name, email, and password.
- Access: Public
- Request Body:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePass123!"
}
```

- Success Response: `201 Created`
- Response Body:

```json
{
  "message": "User registered successfully",
  "userId": "b8a6b3c2-1d7a-4ab9-baf9-2d91ae4e8e5d"
}
```

#### `POST /api/v1/auth/login`

- Description: Authenticates an existing user and returns a JWT token.
- Access: Public
- Request Body:

```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePass123!"
}
```

- Success Response: `200 OK`
- Response Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Workspace Endpoints

#### `GET /api/v1/workspaces`

- Description: Retrieves all workspaces associated with the authenticated user.
- Access: Protected
- Request Body: None
- Success Response: `200 OK`
- Response Body:

```json
{
  "items": [
    {
      "id": "ws_123",
      "name": "Marketing Team",
      "role": "OWNER",
      "createdAt": "2026-08-13T10:00:00Z"
    },
    {
      "id": "ws_456",
      "name": "Design Review",
      "role": "EDITOR",
      "createdAt": "2026-08-12T16:30:00Z"
    }
  ],
  "totalCount": 2
}
```

#### `POST /api/v1/workspaces`

- Description: Creates a new workspace for the authenticated user.
- Access: Protected
- Request Body:

```json
{
  "name": "Product Launch"
}
```

- Success Response: `201 Created`
- Response Body:

```json
{
  "id": "ws_789",
  "name": "Product Launch",
  "createdAt": "2026-08-13T12:15:00Z"
}
```

### Document Endpoints

#### `GET /api/v1/workspaces/{workspaceId}/documents`

- Description: Fetches all documents within a specific workspace.
- Access: Protected
- Request Body: None
- Success Response: `200 OK`
- Response Body:

```json
[
  {
    "id": "doc_101",
    "title": "Project Brief",
    "lastModified": "2026-08-13T09:45:00Z"
  },
  {
    "id": "doc_202",
    "title": "Sprint Notes",
    "lastModified": "2026-08-12T18:10:00Z"
  }
]
```

#### `GET /api/v1/documents/{documentId}`

- Description: Retrieves the initial state of a document before handing off to the WebSocket collaboration layer.
- Access: Protected
- Request Body: None
- Success Response: `200 OK`
- Response Body:

```json
{
  "id": "doc_202",
  "title": "Sprint Notes",
  "content": "[{\"op\":\"replace\",\"path\":\"/title\",\"value\":\"Sprint Notes\"}]",
  "workspaceId": "ws_123"
}
```

#### `PUT /api/v1/documents/{documentId}`

- Description: Updates document metadata such as the title.
- Access: Protected
- Request Body:

```json
{
  "title": "Updated Sprint Notes"
}
```

- Success Response: `200 OK`
- Response Body:

```json
{
  "id": "doc_202",
  "title": "Updated Sprint Notes",
  "lastModified": "2026-08-13T13:20:00Z"
}
```

### Notes

- All endpoint paths below assume the base prefix `/api/v1`.
- Protected routes require a valid JWT token in the `Authorization` header.
- Real-time document collaboration is handled through WebSocket channels, while REST endpoints are used for initial document retrieval and metadata updates.
