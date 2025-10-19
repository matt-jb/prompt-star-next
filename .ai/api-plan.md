# REST API Plan

This document outlines the REST API for the Prompt Star application, based on the product requirements, database schema, and technical stack.

## 1. Resources

- **Prompts**: Represents the user-created prompts. Corresponds to the `Prompt` table.
- **Categories**: Represents the predefined categories for prompts. Corresponds to the `Category` table.
- **Votes**: Represents user upvotes on prompts. Corresponds to the `Vote` table.
- **Users**: Represents application users. Corresponds to the `User` table.

## 2. Endpoints

### 2.1. Prompts

#### GET /api/prompts

- **Description**: Retrieves a paginated list of public prompts. Supports filtering by category and sorting. If this endpoint is called with the `userId` query parameter, it will return a list of prompts created by the user and include the user's own private and public prompts.
- **Authentication**: None required.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `pageSize` (number, optional, default: 20): The number of items per page.
  - `categoryId` (string, optional): Filters prompts by the specified category ID.
  - `sortBy` (string, optional, default: `createdAt`): The field to sort by. Allowed values: `createdAt`, `updatedAt`, `title`, `voteCount`.
  - `order` (string, optional, default: `desc`): The sort order. Allowed values: `asc`, `desc`.
  - `userId` (string, optional): Filters prompts by the specified user ID.
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "clxqlb55h000008l3f2r1e1c7",
        "title": "Creative Writing Inspiration",
        "description": "A prompt to spark new ideas for fictional stories.",
        "visibility": "PUBLIC",
        "createdAt": "2025-10-17T10:00:00.000Z",
        "updatedAt": "2025-10-17T10:00:00.000Z",
        "author": {
          "id": "clxqlb55h000108l3f2r1e1c8",
          "username": "storyteller"
        },
        "category": {
          "id": "clxqlb55h000208l3f2r1e1c9",
          "name": "Creative"
        },
        "voteCount": 42
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 150,
      "totalPages": 8
    }
  }
  ```
- **Error Response (400 Bad Request)**: Invalid query parameters.

#### POST /api/prompts

- **Description**: Creates a new prompt.
- **Authentication**: Required.
- **Request Payload**:
  ```json
  {
    "title": "Generate a SQL Query",
    "description": "A prompt to generate a complex SQL query from natural language.",
    "content": "Given the tables users(id, name, email) and orders(id, user_id, amount), write a SQL query that finds the total order amount for each user.",
    "visibility": "PUBLIC",
    "categoryId": "clxqlb55h000208l3f2r1e1c9"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "clxqlb55h000308l3f2r1e1d0",
    "title": "Generate a SQL Query",
    "description": "A prompt to generate a complex SQL query from natural language.",
    "content": "Given the tables users(id, name, email) and orders(id, user_id, amount), write a SQL query that finds the total order amount for each user.",
    "visibility": "PUBLIC",
    "createdAt": "2025-10-17T11:00:00.000Z",
    "updatedAt": "2025-10-17T11:00:00.000Z",
    "author": {
      "id": "clxqlb55h000108l3f2r1e1c8",
      "username": "storyteller"
    },
    "category": {
      "id": "clxqlb55h000208l3f2r1e1c9",
      "name": "Creative"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid payload data (e.g., missing fields, validation errors).
  - `401 Unauthorized`: User is not authenticated.

#### GET /api/prompts/{promptId}

- **Description**: Retrieves a single prompt by its ID.
- **Authentication**: Optional. Required to view a private prompt if the user is the author.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "clxqlb55h000008l3f2r1e1c7",
    "title": "Creative Writing Inspiration",
    "description": "A prompt to spark new ideas for fictional stories.",
    "content": "You are a world-renowned author. Write the opening paragraph of a story about a clockmaker who can control time.",
    "visibility": "PUBLIC",
    "createdAt": "2025-10-17T10:00:00.000Z",
    "updatedAt": "2025-10-17T10:00:00.000Z",
    "author": {
      "id": "clxqlb55h000108l3f2r1e1c8",
      "username": "storyteller"
    },
    "category": {
      "id": "clxqlb55h000208l3f2r1e1c9",
      "name": "Creative"
    },
    "voteCount": 42,
    "hasVoted": true
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: User tries to access a private prompt they do not own.
  - `404 Not Found`: Prompt with the given ID does not exist or was soft-deleted.

#### PATCH /api/prompts/{promptId}

- **Description**: Updates an existing prompt. Only the author of the prompt can perform this action.
- **Authentication**: Required.
- **Request Payload** (only fields to be updated are required):
  ```json
  {
    "title": "Advanced SQL Query Generation",
    "visibility": "PRIVATE"
  }
  ```
- **Success Response (200 OK)**: The updated prompt object.
- **Error Responses**:
  - `400 Bad Request`: Invalid payload data.
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User is not the author of the prompt.
  - `404 Not Found`: Prompt with the given ID does not exist.

#### DELETE /api/prompts/{promptId}

- **Description**: Soft-deletes a prompt by setting its `isDeleted` flag to `true`. Only the author can perform this action.
- **Authentication**: Required.
- **Success Response (204 No Content)**.
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User is not the author of the prompt.
  - `404 Not Found`: Prompt with the given ID does not exist.

### 2.2. Votes

#### POST /api/prompts/{promptId}/vote

- **Description**: Adds an upvote to a prompt. A user can only vote once per prompt.
- **Authentication**: Required.
- **Success Response (201 Created)**:
  ```json
  {
    "id": "clxqlc77j000408l3g8k0h9a4",
    "userId": "clxqlb55h000108l3f2r1e1c8",
    "promptId": "clxqlb55h000008l3f2r1e1c7",
    "createdAt": "2025-10-17T12:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `404 Not Found`: Prompt with the given ID does not exist.
  - `409 Conflict`: User has already voted on this prompt.

#### DELETE /api/prompts/{promptId}/vote

- **Description**: Removes an upvote from a prompt.
- **Authentication**: Required.
- **Success Response (204 No Content)**.
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User is not the author of the vote.
  - `404 Not Found`: Prompt does not exist or the user has not voted on it.

### 2.3. Categories

#### GET /api/categories

- **Description**: Retrieves a list of all available prompt categories.
- **Authentication**: Not required.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "clxqlb55h000208l3f2r1e1c9",
      "name": "Creative"
    },
    {
      "id": "clxqlc99k000508l3h4j5k6l7",
      "name": "Technical"
    }
  ]
  ```

### 2.4. Users

#### DELETE /api/users/{userId}

- **Description**: Deletes a user account, all associated votes and soft-deletes all prompts created by the user.
- **Authentication**: Required.
- **Success Response (204 No Content)**.
- **Error Responses**:
  - `401 Unauthorized`: User is not authenticated.
  - `403 Forbidden`: User is not the target user.
  - `404 Not Found`: User with the given ID does not exist.

## 3. Authentication and Authorization

- **Authentication**: User authentication is handled by the BetterAuth library. Authenticated endpoints will expect a valid session token (e.g., in a cookie or Authorization header), which the middleware will verify to identify the user. The user's ID will be available in the request context for the API handlers.
- **Authorization**:
  - **Ownership Checks**: For actions that modify a resource (e.g., `PATCH /api/prompts/{promptId}`, `DELETE /api/prompts/{promptId}`), the API must verify that the authenticated user's ID matches the `authorId` of the prompt. If there is a mismatch, a `403 Forbidden` error will be returned.
  - **Private Resources**: Access to private prompts (`GET /api/prompts` with `userId` query parameter`, `GET /api/prompts/{promptId}`) is restricted to the author.

## 4. Validation and Business Logic

### Validation

Input validation will be performed at the API layer before processing requests.

- **Prompt Creation/Update**:
  - `title`: Required, string, max 128 characters.
  - `description`: Optional, string, max 512 characters.
  - `content`: Required, string, max 50,000 characters.
  - `visibility`: Required, must be either `PUBLIC` or `PRIVATE`.
  - `categoryId`: Required, must be a valid existing category ID.

### Business Logic

- **Soft Deletes**: `DELETE /api/prompts/{promptId}` will perform a soft delete by setting `isDeleted = true`. All GET endpoints that return prompts must filter out records where `isDeleted = true`.
- **Vote Counting**: The `voteCount` field in prompt responses will be updated using a trigger or a transaction when votes are added or removed.
- **Unique Votes**: The unique constraint `@@unique([userId, promptId])` on the `Vote` table in the database prevents a user from voting more than once. The API will catch the resulting database error and return a `409 Conflict` status code.
- **User Prompts Endpoint**: The `/api/users/{userId}/prompts` endpoint will use the special identifier `me` for the currently authenticated user (e.g., `/api/users/me/prompts`) to fetch both public and private prompts. For any other `userId`, it will only return public prompts.
