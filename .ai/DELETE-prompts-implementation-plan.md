# API Endpoint Implementation Plan: DELETE /api/prompts/{promptId}

## 1. Endpoint Overview

This document outlines the implementation plan for the `DELETE /api/prompts/{promptId}` endpoint. Its purpose is to allow an authenticated user to soft-delete their own prompt. The deletion is achieved by setting the `isDeleted` flag on the `Prompt` record to `true`, preserving the data while removing it from public view.

## 2. Request Details

- **HTTP Method**: `DELETE`
- **URL Structure**: `/api/prompts/{promptId}`
- **Parameters**:
  - **Path Parameters**:
    - `promptId` (string, required): The unique identifier of the prompt to be deleted.
- **Request Body**: None.

## 3. Used Types

- No DTOs or Command Models are required for this endpoint as there is no request body or response body on success.

## 4. Response Details

- **Success Response**:
  - **Code**: `204 No Content`
  - **Body**: None.
- **Error Responses**:
  - **Code**: `401 Unauthorized`
    - **Body**: `{ "error": "Authentication required." }`
    - **Condition**: The user is not authenticated.
  - **Code**: `403 Forbidden`
    - **Body**: `{ "error": "You do not have permission to delete this prompt." }`
    - **Condition**: The user is authenticated but is not the author of the prompt.
  - **Code**: `404 Not Found`
    - **Body**: `{ "error": "Prompt not found." }`
    - **Condition**: No prompt with the given `promptId` exists.
  - **Code**: `500 Internal Server Error`
    - **Body**: `{ "error": "An unexpected error occurred." }`
    - **Condition**: A server-side or database error occurred.

## 5. Data Flow

1.  A `DELETE` request is sent to `/api/prompts/{promptId}`.
2.  The Next.js API route handler (`app/api/prompts/[promptId]/route.ts`) receives the request.
3.  The handler retrieves the current user session using BetterAuth. If no session exists, it returns a `401 Unauthorized` error.
4.  The handler extracts and validates the `promptId` from the URL parameters.
5.  The handler calls the `deletePrompt` method in the `PromptService`, passing the `promptId` and the `userId` from the session.
6.  `PromptService` uses the Prisma client to execute an `update` operation on the `Prompt` table. The query will attempt to set `isDeleted: true` on the record `WHERE` the `id` matches `promptId` AND the `authorId` matches the current `userId`.
7.  If the update operation fails because the record doesn't exist (Prisma error `P2025`), the service will determine if it's a `404` or `403` error.
8.  The route handler maps the service outcome to the appropriate HTTP response (`204`, `403`, `404`, or `500`) and sends it back to the client.

## 6. Security Considerations

- **Authentication**: The endpoint will be protected by BetterAuth. The API handler must verify the user's session before proceeding.
- **Authorization**: Authorization is the primary security concern. The operation's atomicity is critical. The `PromptService` must use a single Prisma query that includes both `promptId` and `authorId` in the `where` clause. This prevents race conditions and ensures a user can only delete prompts they own.
- **Input Validation**: The `promptId` will be validated to ensure it is a valid CUID string to prevent invalid data from reaching the database layer.

## 7. Performance Considerations

- The database query is a targeted `UPDATE` on an indexed primary key (`id`) and an indexed foreign key (`authorId`). This operation is highly efficient and is not expected to cause performance issues.
- No other significant performance bottlenecks are anticipated for this endpoint.

## 8. Implementation Steps

1.  **Create API Route**: Create a new file `app/api/prompts/[promptId]/route.ts`.
2.  **Implement DELETE Handler**: In the new file, export an async function `DELETE(request: NextRequest, { params }: { params: { promptId: string } })`.
3.  **Add Authentication**: Inside the `DELETE` handler, retrieve the user session using the authentication provider. If the session is null, return a `401 Unauthorized` response.
4.  **Create Prompt Service**: If it doesn't already exist, create `server/services/prompt.service.ts` to encapsulate business logic related to prompts.
5.  **Implement `deletePrompt` Method**:
    - In `PromptService`, create a new method: `async deletePrompt(promptId: string, userId: string)`.
    - Inside this method, use `prisma.prompt.updateMany` with a `where` clause: `{ id: promptId, authorId: userId, isDeleted: false }` and `data: { isDeleted: true }`. Using `updateMany` returns a `count` of updated records, which is more direct for this check than `update`.
    - If the `count` of affected rows is 0, query if a prompt with `promptId` exists.
      - If it exists, the user is not the owner. Throw a custom `ForbiddenError`.
      - If it does not exist, throw a custom `NotFoundError`.
6.  **Call Service from Handler**:
    - In the API route handler, call `promptService.deletePrompt(promptId, userId)`.
    - Use a `try...catch` block to handle potential errors thrown from the service.
    - Map custom errors (`NotFoundError`, `ForbiddenError`) to `404` and `403` HTTP responses, respectively.
    - Catch any other unexpected errors and return a `500 Internal Server Error`.
7.  **Return Success Response**: If the service method executes successfully, return a `204 No Content` response.
8.  **Add Logging**: Implement structured logging for errors, particularly for `500` status codes, to capture context for debugging.
