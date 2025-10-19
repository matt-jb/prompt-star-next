# API Endpoint Implementation Plan: PATCH /api/prompts/{promptId}

## 1. Endpoint Overview

This document outlines the implementation plan for the `PATCH /api/prompts/{promptId}` endpoint. The purpose of this endpoint is to allow an authenticated user to update their own existing prompt. Only the fields provided in the request payload will be updated. The user must be the author of the prompt to perform this action.

## 2. Request Details

- **HTTP Method**: `PATCH`
- **URL Structure**: `/api/prompts/{promptId}`
- **Parameters**:
  - **URL Parameter (Required)**:
    - `promptId` (string): The unique identifier of the prompt to be updated.
- **Request Body**: A JSON object containing a subset of the prompt's mutable fields. All fields are optional.
  ```json
  {
    "title": "New Prompt Title",
    "description": "Updated description for the prompt.",
    "content": "The new and improved prompt content.",
    "visibility": "PRIVATE",
    "categoryId": "clxkr9q8k0000a1b2c3d4e5f6"
  }
  ```

## 3. Used Types

- **Request Command Model**: `UpdatePromptCommand` from `lib/dto.ts`.

  ```typescript
  import { Prompt } from "@prisma/client";

  export type UpdatePromptCommand = Partial<
    Pick<
      Prompt,
      "title" | "description" | "content" | "visibility" | "categoryId"
    >
  >;
  ```

- **Response DTO**: `CreatedPromptDto` from `lib/dto.ts`.
  ```typescript
  // Represents the successfully updated prompt object returned to the client.
  export type CreatedPromptDto = BasePromptDto & Pick<Prompt, "content">;
  ```

## 4. Response Details

- **Success Response (200 OK)**: Returns the complete, updated prompt object, matching the `CreatedPromptDto` type.
  ```json
  {
    "id": "clxkr9q8k0000a1b2c3d4e5f6",
    "title": "New Prompt Title",
    "description": "Updated description for the prompt.",
    "content": "The new and improved prompt content.",
    "visibility": "PRIVATE",
    "createdAt": "2025-10-19T10:00:00.000Z",
    "updatedAt": "2025-10-19T12:30:00.000Z",
    "author": {
      "id": "clxkr9q8k0000a1b2c3d4e5f6",
      "username": "testuser"
    },
    "category": {
      "id": "clxkr9q8k0000a1b2c3d4e5f6",
      "name": "SQL"
    }
  }
  ```
- **Error Responses**: See the Error Handling section for details on `400`, `401`, `403`, `404`, and `500` status codes.

## 5. Data Flow

1.  A `PATCH` request is sent to `/api/prompts/{promptId}` with the update payload and authentication credentials.
2.  The Next.js API route handler at `app/api/prompts/[promptId]/route.ts` receives the request.
3.  The handler authenticates the user using `BetterAuth` helpers to retrieve the current session. If no session exists, it returns a `401 Unauthorized` error.
4.  The request body is parsed and validated against a Zod schema based on `UpdatePromptCommand` and database constraints. If validation fails, a `400 Bad Request` error is returned.
5.  The route handler calls the `updatePrompt` method in the `PromptService` (`server/services/prompt.service.ts`), passing the `promptId`, update payload, and the authenticated user's ID.
6.  `PromptService` fetches the prompt from the database using Prisma. If not found, it throws a "Not Found" error, which the handler translates to a `404 Not Found` response.
7.  The service verifies that the authenticated user's ID matches the `prompt.authorId`. If they don't match, it throws a "Forbidden" error, resulting in a `403 Forbidden` response.
8.  If a `categoryId` is provided, the service verifies its existence. If not found, it throws a "Bad Request" error.
9.  The service uses Prisma to update the prompt record in the database with the validated data.
10. The updated prompt data is returned to the route handler.
11. The route handler transforms the data into the `CreatedPromptDto` format and sends it back to the client with a `200 OK` status.

## 6. Security Considerations

- **Authentication**: All requests to this endpoint must be authenticated. The API route will use `BetterAuth` to get the current user session and reject any unauthenticated requests.
- **Authorization**: The service layer must contain a critical authorization check to ensure `session.user.id === prompt.authorId`. This prevents any user from updating prompts they do not own.
- **Input Validation**: A Zod schema will be used to strictly validate the request body. This prevents invalid data formats, enforces length constraints (`title`, `description`), and ensures `visibility` is a valid enum value, mitigating data integrity issues.
- **SQL Injection**: The use of Prisma as the ORM inherently protects against SQL injection vulnerabilities, as it uses parameterized queries.

## 7. Error Handling

- **400 Bad Request**:
  - The request body fails Zod validation (e.g., `title` exceeds 128 characters).
  - The provided `categoryId` does not correspond to an existing category.
  - The request body is empty or malformed.
- **401 Unauthorized**:
  - The request is made without a valid session token.
- **403 Forbidden**:
  - The authenticated user is not the author of the prompt.
- **404 Not Found**:
  - A prompt with the specified `promptId` does not exist.
- **500 Internal Server Error**:
  - Prisma fails to execute the database update.
  - An unexpected error occurs in the application logic.
  - Errors will be logged to the console with a structured format including a request ID and timestamp.

## 8. Performance Considerations

- The database query to fetch and update the prompt is indexed by the primary key (`id`), ensuring high performance.
- The check for `categoryId` existence will query the `Category` table, also on its primary key.
- Payload size is expected to be small, so network latency should be minimal.
- Overall, the endpoint is expected to be highly performant and does not require special optimizations for the MVP.

## 9. Implementation Steps

1.  **Create Zod Schema**: In a new file `lib/validators/prompt.validators.ts`, define a Zod schema for `UpdatePromptCommand` to validate the request body.
    - `title`: `z.string().min(1).max(128).optional()`
    - `description`: `z.string().max(512).optional()`
    - `content`: `z.string().min(1).optional()`
    - `visibility`: `z.enum(['PUBLIC', 'PRIVATE']).optional()`
    - `categoryId`: `z.string().cuid().optional()`

2.  **Create Service Layer**: If it doesn't exist, create `server/services/prompt.service.ts`.
    - Implement an `updatePrompt(promptId: string, userId: string, data: UpdatePromptCommand): Promise<Prompt>` function.
    - Inside the function:
      a. Use `prisma.prompt.findUniqueOrThrow` to get the prompt, which handles the "not found" case.
      b. Check if `prompt.authorId !== userId`. If so, throw an error.
      c. If `data.categoryId` is provided, use `prisma.category.findUnique` to verify it exists. If not, throw a "bad request" error.
      d. Use `prisma.prompt.update` to save the changes.
      e. Return the updated prompt, including related `author` and `category` data.

3.  **Create API Route**: Create the file `app/api/prompts/[promptId]/route.ts`.
    - Define an async `PATCH` handler function `(req: NextRequest, { params }: { params: { promptId: string } })`.
    - Implement a `try...catch` block for global error handling.
    - Get the user session via `BetterAuth`. If null, return a `401` response.
    - Parse the request body JSON. If empty, return `400`.
    - Validate the body using the Zod schema created in step 1. If validation fails, return a `400` response with error details.
    - Call `promptService.updatePrompt` with `params.promptId`, the user's ID, and the validated data.
    - Catch specific errors thrown from the service and map them to the appropriate HTTP status codes (`403`, `404`).
    - On success, format the returned prompt into `CreatedPromptDto` and return a `200 OK` response.


