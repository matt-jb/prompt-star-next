# API Endpoint Implementation Plan: DELETE /api/prompts/{promptId}/vote

## 1. Endpoint Overview

This document outlines the implementation plan for the `DELETE /api/prompts/{promptId}/vote` endpoint. Its purpose is to allow an authenticated user to remove their upvote from a specific prompt. The operation involves deleting the corresponding `Vote` record from the database and decrementing the denormalized `voteCount` on the `Prompt` record within a single atomic transaction.

## 2. Request Details

- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/prompts/{promptId}/vote`
- **Parameters**:
  - **Required**:
    - `promptId` (string): The unique identifier for the prompt, passed as a URL path parameter.
- **Request Body**: None.

## 3. Used Types

No DTOs or Command Models are necessary for this endpoint as there is no request or response body.

## 4. Response Details

- **Success Response**:
  - **Code**: `204 No Content`
  - **Body**: None.
- **Error Responses**:
  - **Code**: `400 Bad Request` - If `promptId` is invalid.
  - **Code**: `401 Unauthorized` - If the user is not authenticated.
  - **Code**: `404 Not Found` - If the prompt does not exist or the user has not voted on it.
  - **Code**: `500 Internal Server Error` - For unexpected server-side errors.

## 5. Data Flow

1. A `DELETE` request is sent to `/api/prompts/{promptId}/vote`.
2. The Next.js API route handler receives the request.
3. Authentication middleware verifies the user's session and extracts the `userId`. If the user is not authenticated, it returns a `401`.
4. The handler validates the `promptId` from the URL. If invalid, it returns a `400`.
5. The handler calls the `deleteVote(promptId, userId)` method in the `VoteService`.
6. The `VoteService` initiates a Prisma database transaction (`$transaction`).
7. **Inside the transaction**:
   a. It attempts to find and delete the `Vote` record matching the compound unique key `(userId, promptId)`.
   b. If the `Vote` is deleted successfully, it proceeds to decrement the `voteCount` field on the corresponding `Prompt` record.
8. If the transaction completes successfully, the service returns control to the handler.
9. The API route handler sends a `204 No Content` response to the client.
10. If the `Vote` record is not found in step 7a (meaning the user hadn't voted or the prompt doesn't exist), Prisma will throw a record-not-found error. The service will catch this and re-throw a custom `NotFoundError`. The handler will catch this and return a `404`.
11. If the transaction fails for any other reason, a `500 Internal Server Error` is returned.

## 6. Security Considerations

- **Authentication**: The endpoint will be protected by the existing BetterAuth middleware, ensuring only authenticated users can access it.
- **Authorization**: Authorization is enforced at the database query level. The `deleteVote` service method will exclusively use the `userId` from the user's session to identify the vote to be deleted. This prevents a user from deleting another user's vote and mitigates Insecure Direct Object Reference (IDOR) vulnerabilities.
- **Input Validation**: The `promptId` path parameter will be validated to ensure it is a properly formatted string (e.g., CUID) to prevent invalid data from reaching the service layer.

## 7. Performance Considerations

- **Database Transaction**: The use of a single, atomic transaction for both the delete and update operations is highly efficient.
- **Indexing**: The query to find the vote will be fast, as it will use the `@@unique([userId, promptId])` compound index on the `Vote` table. The query to update the prompt's vote count will also be fast as it will use the primary key index on the `Prompt` table.
- **Overall Impact**: The performance impact of this operation is expected to be minimal due to the efficient database operations.

## 8. Implementation Steps

1. **Create Service Directory and File**:
   - If it doesn't already exist, create a new directory: `server/services/`.
   - Create a new file: `server/services/vote.service.ts`.

2. **Implement `VoteService`**:
   - In `vote.service.ts`, create a `VoteService` class.
   - Implement the `deleteVote(promptId: string, userId: string)` method.
   - This method will use `prisma.$transaction` to atomically:
     - Delete the vote using `prisma.vote.delete({ where: { userId_promptId: { userId, promptId } } })`.
     - Decrement the prompt's vote count using `prisma.prompt.update({ where: { id: promptId }, data: { voteCount: { decrement: 1 } } })`.
   - Add error handling to catch Prisma's `P2025` error (record not found) and throw a custom `NotFoundError`.

3. **Create API Route**:
   - Create a new API route file: `app/api/prompts/[promptId]/vote/route.ts`.
   - The file will export an async function `DELETE(request: NextRequest, { params }: { params: { promptId: string } })`.

4. **Implement API Route Logic**:
   - In the `DELETE` function, get the current user session to retrieve the `userId`. If no session exists, return a `401` error.
   - Validate the `promptId` from the `params` object.
   - Instantiate `VoteService` and call the `deleteVote` method with the `promptId` and `userId`.
   - Implement a `try...catch` block to handle potential errors thrown by the service (e.g., `NotFoundError`) and return the appropriate HTTP status codes (`404`, `500`).
   - On success, return a `204 No Content` response.
