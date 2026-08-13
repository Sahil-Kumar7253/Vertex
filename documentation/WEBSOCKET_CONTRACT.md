# Real-Time Message Contract

## Overview & Connection Details

- Connection endpoint: `ws://<your-domain>/ws` or `wss://<your-domain>/ws`
- Protocol: STOMP over WebSockets
- Authentication: a JWT Bearer token must be included in the initial STOMP connection headers during handshake.
- The client establishes a WebSocket connection to the broker and then subscribes or sends messages using STOMP destinations.

Example STOMP connection header:

```http
Authorization: Bearer <jwt-token>
```

## Client Subscriptions (Backend to Frontend)

Clients must subscribe to live topics to receive workspace updates in real time. The primary topic for collaborative document activity is:

- Destination: `/topic/workspace/{workspaceId}`

This topic is used to broadcast document changes, cursor movements, and user presence updates to all active clients currently in the same workspace.

### Example: Content Update (OT/CRDT Delta)

```json
{
  "type": "CONTENT_UPDATE",
  "userId": "user_123",
  "delta": {
    "operations": [
      {
        "op": "insert",
        "position": 42,
        "value": "hello"
      },
      {
        "op": "delete",
        "position": 47,
        "length": 5
      }
    ]
  },
  "timestamp": "2026-08-13T12:00:00.000Z"
}
```

This payload represents a collaborative content change and is broadcast to all subscribers in the workspace so they can reconcile local document state.

### Example: Cursor Movement

```json
{
  "type": "CURSOR_MOVE",
  "userId": "user_123",
  "position": {
    "line": 8,
    "character": 15
  },
  "timestamp": "2026-08-13T12:00:12.000Z"
}
```

This payload communicates the movement of a client cursor, allowing presence awareness and remote cursor rendering.

## Client Publications (Frontend to Backend)

Clients send their local edits and presence updates to the server through STOMP application messages. The main publication destination is:

- Destination: `/app/workspace/{workspaceId}/edit`

This endpoint is used for sending local text changes or cursor updates from the frontend to the Spring Boot broker. The message is then routed and broadcast to other subscribers in the same workspace.

The payload structures for frontend-to-backend publication match the JSON examples used in the subscription section above, including `CONTENT_UPDATE` and `CURSOR_MOVE` messages.

### Example Publication Payload: Content Update

```json
{
  "type": "CONTENT_UPDATE",
  "userId": "user_123",
  "delta": {
    "operations": [
      {
        "op": "insert",
        "position": 42,
        "value": "hello"
      }
    ]
  },
  "timestamp": "2026-08-13T12:00:00.000Z"
}
```

### Example Publication Payload: Cursor Movement

```json
{
  "type": "CURSOR_MOVE",
  "userId": "user_123",
  "position": {
    "line": 8,
    "character": 15
  },
  "timestamp": "2026-08-13T12:00:12.000Z"
}
```

## Summary

- Subscribe to `/topic/workspace/{workspaceId}` to receive real-time workspace updates.
- Publish to `/app/workspace/{workspaceId}/edit` to send local edits and cursor state.
- Use STOMP over WebSockets with JWT-based authentication during the initial connection handshake.
