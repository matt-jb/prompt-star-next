# API Endpoint Implementation Plan: POST /api/prompts/{promptId}/vote

## 1. Endpoint Overview

This document outlines the implementation plan for the `POST /api/prompts/{promptId}/vote` endpoint. Its purpose is to allow an authenticated user to add a single upvote to a specific prompt. The operation is idempotent from a user's perspective; a user can only vote once on any given prompt.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/prompts/{promptId}/vote`
- **Parameters**:
  - **Required**:
    - `promptId` (URL parameter): The unique identifier for the prompt to be upvoted.
- **Request Body**: None. The user's identity will be determined from their session.

## 3. Used Types

- **Response DTO**: `VoteDto` from `lib/dto.ts` will be used for the `201 Created` response.
  ```typescript
  // lib/dto.ts
  export type VoteDto = Pick<Vote, "id" | "userId" | "promptId" | "createdAt">;
  ```

## 4. Response Details

- **Success (201 Created)**: Returned when the vote is successfully created.
  - **Body**: A `VoteDto` object representing the newly created vote record.
  ```json
  {
    "id": "clxqlc77j000408l3g8k0h9a4",
    "userId": "clxqlb55h000108l3f2r1e1c8",
    "promptId": "clxqlb55h000008l3f2r1e1c7",
    "createdAt": "2025-10-17T12:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the `promptId` does not correspond to an existing, non-deleted prompt.
  - `409 Conflict`: If the user has already cast a vote for this specific prompt.
  - `500 Internal Server Error`: For any unexpected server-side errors.

## 5. Data Flow

1.  A `POST` request is sent to `/api/prompts/{promptId}/vote`.
2.  The Next.js API route handler at `app/api/prompts/[promptId]/vote/route.ts` receives the request.
3.  The handler authenticates the user by retrieving the current session. If no session exists, it returns a `401` error.
4.  The `userId` is extracted from the session, and the `promptId` is extracted from the URL.
5.  The handler calls the `createVote` function in the newly created `server/services/vote.service.ts`.
6.  The `createVote` service function executes a `prisma.$transaction` to ensure atomicity of the following database operations:
    a. It first queries for the `Prompt` using the `promptId` to confirm it exists and is not soft-deleted (`isDeleted: false`). If not found, it throws a `NotFoundError`.
    b. It then attempts to `prisma.vote.create()` with the `userId` and `promptId`.
    c. If the create operation fails with a unique constraint violation (Prisma error code `P2002`), it indicates a duplicate vote. The service throws a `ConflictError`.
    d. If the vote is created successfully, it proceeds to `prisma.prompt.update()`, incrementing the `voteCount` field by one.
7.  If the transaction is successful, the service returns the newly created `Vote` object.
8.  The route handler catches any specific errors thrown by the service (`NotFoundError`, `ConflictError`) and maps them to the appropriate HTTP status codes (`404`, `409`).
9.  On success, the handler formats the returned `Vote` object into a `VoteDto` and sends it in the response with a `201 Created` status.

## 6. Security Considerations

- **Authentication**: The endpoint will be protected, requiring a valid user session. The `userId` will be sourced directly from the server-side session to prevent tampering.
- **Authorization**: Any authenticated user is authorized to vote. No additional role-based checks are necessary for this endpoint.
- **Data Integrity**: The `@@unique([userId, promptId])` constraint in the `Vote` table of `schema.prisma` provides a robust, database-level guarantee against duplicate votes and potential race conditions.
- **Input Validation**: The existence of the prompt is validated within the service logic to prevent votes on non-existent or soft-deleted items.

## 7. Performance Considerations

- **Database Operations**: The core logic is wrapped in a single, efficient Prisma transaction involving one `SELECT`, one `INSERT`, and one `UPDATE`. This is a highly performant approach.
- **Denormalization**: The use of a denormalized `voteCount` on the `Prompt` table is a key performance optimization. It avoids expensive aggregation queries (`COUNT`) when fetching lists of prompts, ensuring that retrieving vote counts is always O(1).

## 8. Implementation Steps

1.  **Create Service File**:
    - Create a new file: `server/services/vote.service.ts`.
2.  **Implement `createVote` Service**:
    - In `vote.service.ts`, implement an async function `createVote(promptId: string, userId: string)`.
    - Use `prisma.$transaction` to wrap the database logic.
    - Inside the transaction, first, check if the prompt exists (`findUnique`). If not, throw a custom `NotFoundError`.
    - `try/catch` the `vote.create` operation to specifically handle Prisma's unique constraint violation error (`P2002`), throwing a custom `ConflictError`.
    - On successful vote creation, perform `prompt.update` to increment `voteCount`.
    - Return the created vote object.
3.  **Create API Route Handler**:
    - Create a new route file: `app/api/prompts/[promptId]/vote/route.ts`.
4.  **Implement `POST` Handler**:
    - In `route.ts`, define and export an async function `POST(request: Request, { params }: { params: { promptId: string } })`.
    - Retrieve the user session. If it's null, return `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`.
    - Extract `userId` from the session and `promptId` from `params`.
    - Call the `createVote` service function within a `try/catch` block.
    - In the `catch` block, check for instances of `NotFoundError` and `ConflictError` and return `404` and `409` responses, respectively. Log any other errors and return a `500` response.
    - On success, return the result from the service as JSON with a `{ status: 201 }`.
5.  **Define Custom Errors**:
    - In `server/errors.ts`, ensure `NotFoundError` and `ConflictError` classes are defined (extending `Error`) so they can be identified in `catch` blocks.
