# Database Entity-Relationship Diagram (ERD)

## Overview

This schema manages the relational data for users, their workspaces, and the documents contained within those workspaces. It is implemented using PostgreSQL as the database and Spring Data JPA with Hibernate for persistence and object-relational mapping.

## Entity-Relationship Diagram (Mermaid.js)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string password_hash
        string name
        timestamp created_at
    }

    WORKSPACES {
        uuid id PK
        string name
        uuid owner_id FK
        timestamp created_at
    }

    WORKSPACE_MEMBERS {
        uuid workspace_id FK
        uuid user_id FK
        string role
    }

    DOCUMENTS {
        uuid id PK
        uuid workspace_id FK
        string title
        text content
        timestamp last_modified
    }

    USERS ||--o{ WORKSPACES : owns
    USERS ||--o{ WORKSPACE_MEMBERS : "is a member of"
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : "has members"
    WORKSPACES ||--o{ DOCUMENTS : contains
```

## Entity Descriptions

- `USERS`: Stores application users, including authentication data, display name, and account creation metadata.
- `WORKSPACES`: Represents a collaborative space owned by a user and acts as the top-level grouping for members and documents.
- `WORKSPACE_MEMBERS`: Supports role-based access control by linking users to workspaces and assigning roles such as `ADMIN`, `EDITOR`, or `VIEWER`.
- `DOCUMENTS`: Stores collaborative document data, including the title, content, and last modification timestamp for each workspace.
