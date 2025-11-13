# API Endpoint Implementation Plan: GET /api/prompts/{promptId}

## 1. Endpoint Overview

This document outlines the implementation plan for the `GET /api/prompts/{promptId}` endpoint. Its purpose is to retrieve the full details of a single prompt, including its content, author, category, and vote status for the current user. The endpoint handles authorization for private prompts and ensures soft-deleted prompts are not accessible.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/prompts/{promptId}`
- **Parameters**:
  - **Required**:
    - `promptId` (Path Parameter): The unique identifier (CUID) of the prompt to retrieve.
  - **Optional**:
    - User Session (from cookies/headers): An active user session is required to determine the `hasVoted` status and to access private prompts.

- **Request Body**: None.

## 3. Used Types

- **`PromptDetailsDto`**: The response payload will be typed using this DTO from `lib/dto.ts`. It represents the complete view of a prompt.
  ```typescript
  export type PromptDetailsDto = BasePromptDto &
    Pick<Prompt, "content"> & {
      voteCount: number;
      hasVoted: boolean;
    };
  ```

## 4. Response Details

- **Success (200 OK)**: Returns a JSON object of type `PromptDetailsDto`.
- **Errors**:
  - **400 Bad Request**: The provided `promptId` has an invalid format.
  - **403 Forbidden**: The user is not authorized to view the prompt because it is private and they are not the author.
  - **404 Not Found**: No prompt exists with the given `promptId`, or the prompt has been soft-deleted.
  - **500 Internal Server Error**: An unexpected server-side error occurred.

## 5. Data Flow

1.  A `GET` request is sent to `/api/prompts/{promptId}`.
2.  The Next.js App Router directs the request to the handler in `app/api/prompts/[promptId]/route.ts`.
3.  The handler extracts the `promptId` from the URL parameters.
4.  It retrieves the current user's session using the BetterAuth helper function to get the `userId`.
5.  The handler calls a new query function, `getPromptDetails(promptId, userId)`, located in `server/queries/prompt.queries.ts`.
6.  The `getPromptDetails` function executes a Prisma query to fetch the prompt from the database where `id` matches `promptId` and `isDeleted` is `false`. The query will also `include` the related `author` and `category` data.
7.  **Authorization Check**: If the fetched prompt has `visibility: 'PRIVATE'`, the function verifies that the `prompt.authorId` matches the `userId` from the session. If they do not match, a "Forbidden" error is thrown.
8.  **Vote Status Check**: If a `userId` is provided, a second, efficient query is made to the `Vote` table to check if a record exists for the given `userId` and `promptId`.
9.  The function transforms the data from the Prisma models into the `PromptDetailsDto` structure.
10. The API route handler catches any thrown errors (e.g., "Not Found," "Forbidden") and maps them to the appropriate HTTP status codes and error responses.
11. If successful, the handler returns the `PromptDetailsDto` with a `200 OK` status.

## 6. Security Considerations

- **Authentication**: The endpoint will use the existing BetterAuth session management to identify the current user.
- **Authorization**: Server-side checks are critical. The logic must ensure that a prompt with `visibility: 'PRIVATE'` can only be accessed by its author. This check will be performed in the `getPromptDetails` query function after fetching the prompt.
- **Data Validation**: The `promptId` will be treated as an opaque string. Prisma will handle validation at the database level; if the ID format is invalid, Prisma will throw an error, which should be caught and returned as a `400 Bad Request`.

## 7. Performance Considerations

- **Database Query Optimization**: The primary data fetch should use `prisma.prompt.findUniqueOrThrow` with `include` to get the prompt, author, and category in a single database roundtrip.
- **Secondary Query**: The check for `hasVoted` requires a second database call. This query (`prisma.vote.findUnique`) targets the compound primary key `@@unique([userId, promptId])`, which is highly indexed and will have negligible performance impact.
- **Caching**: Caching is out of scope for the MVP. However, for future optimization, this endpoint is a good candidate for caching, especially for popular, public prompts. The cache would need to be invalidated whenever the prompt or its vote count is updated.

## 8. Implementation Steps

1.  **Create API Route File**: Create a new file at `app/api/prompts/[promptId]/route.ts`.
2.  **Implement GET Handler**: In `route.ts`, implement the `GET` export. This function will:
    - Extract `promptId` from the request context.
    - Get the current user session to obtain `userId`.
    - Wrap the call to the query function in a `try...catch` block to handle errors.
    - Return a `NextResponse` with the DTO or an appropriate error JSON payload and status code.
3.  **Create Query File**: Create a new file at `server/queries/prompt.queries.ts`.
4.  **Implement `getPromptDetails` Function**: In `prompt.queries.ts`, create and export an async function `getPromptDetails(promptId: string, userId?: string): Promise<PromptDetailsDto>`. This function will:
    - Query the database using `prisma.prompt.findUniqueOrThrow` with a `where` clause for `id: promptId` and `isDeleted: false`. Include `author` and `category`.
    - Perform the authorization check for private prompts.
    - Perform the `hasVoted` check if `userId` is available.
    - Map the Prisma result to the `PromptDetailsDto` type and return it.
5.  **Define Custom Errors (Optional but Recommended)**: Create custom error classes (e.g., `NotFoundError`, `ForbiddenError`) to be thrown from the query function to allow for clean error handling in the API route.
6.  **Testing**: Create integration tests for the endpoint, covering the following scenarios:
    - Successfully fetching a public prompt (as an unauthenticated user).
    - Successfully fetching a public prompt (as an authenticated user, checking `hasVoted`).
    - Successfully fetching a private prompt as its author.
    - Requesting a non-existent prompt (expect 404).
    - Requesting a private prompt as an unauthenticated user (expect 403).
    - Requesting a private prompt as an authenticated user who is not the author (expect 403).
