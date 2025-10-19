# API Endpoint Implementation Plan: POST /api/prompts

## 1. Endpoint Overview

This document outlines the implementation plan for creating a new prompt via the `POST /api/prompts` endpoint. This endpoint allows authenticated users to submit a new prompt, which will be stored in the database. The endpoint handles validation, authentication, data persistence, and returns the newly created prompt object.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/prompts`
- **Authentication**: Required (handled via BetterAuth session).
- **Request Body**: A JSON object representing the prompt to be created.

  ```json
  {
    "title": "string",
    "description": "string | null",
    "content": "string",
    "visibility": "'PUBLIC' | 'PRIVATE'",
    "categoryId": "string"
  }
  ```

- **Parameters**:
  - **Required**:
    - `title`: `string` - The title of the prompt (1-128 characters).
    - `content`: `string` - The main content of the prompt.
    - `visibility`: `Enum("PUBLIC", "PRIVATE")` - The visibility status of the prompt.
    - `categoryId`: `string` - The ID of the category this prompt belongs to.
  - **Optional**:
    - `description`: `string` - A brief description of the prompt (max 512 characters).

## 3. Used Types

- **Command Model**: `CreatePromptCommand` from `lib/dto.ts` will be used to type the incoming request payload.
- **DTO**: `CreatedPromptDto` from `lib/dto.ts` will be used to structure the successful API response.

## 4. Data Flow

1.  A `POST` request with the prompt payload is sent to `/api/prompts`.
2.  The Next.js route handler at `app/api/prompts/route.ts` receives the request.
3.  The handler checks for an active user session using `auth()` from `lib/auth.ts`. If no session exists, it returns a `401 Unauthorized` error.
4.  The request body is parsed and validated against a `zod` schema. If validation fails, a `400 Bad Request` error is returned with details.
5.  A new service, `PromptService` (to be created at `server/services/prompts.ts`), is called with the validated data and the authenticated `userId`.
6.  `PromptService` interacts with the Prisma client to perform the following operations within a database transaction:
    a. Verify that the `categoryId` exists in the `Category` table. If not, throw an error that results in a `400 Bad Request`.
    b. Create a new record in the `Prompt` table, associating it with the `authorId` and `categoryId`.
7.  `PromptService` returns the newly created prompt, including the related `author` and `category` objects.
8.  The route handler receives the created prompt from the service and transforms it into the `CreatedPromptDto`.
9.  A `201 Created` response is sent back to the client with the `CreatedPromptDto` as the JSON payload.

## 5. Security Considerations

- **Authentication**: The endpoint will be protected. The route handler must verify the user's session using BetterAuth. Unauthenticated requests will be rejected with a `401` status.
- **Authorization**: Any authenticated user is permitted to create a prompt. No additional role-based checks are required for this endpoint.
- **Input Validation**: All incoming data will be strictly validated using `zod` to ensure type correctness, presence of required fields, and adherence to length constraints, preventing invalid data from reaching the service layer.
- **SQL Injection**: All database interactions will be performed through the Prisma ORM, which provides protection against SQL injection attacks. No raw SQL queries will be used.
- **CSRF**: We must ensure that BetterAuth and Next.js are configured to provide CSRF protection for API routes handling state-changing operations.

## 6. Error Handling

The following error scenarios will be handled gracefully:

| Status Code | Reason                                                                                                                                         | Action                                                                                                                  |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `400`       | - Invalid JSON payload.<br>- Payload fails validation (e.g., missing fields, `title` too long).<br>- The provided `categoryId` does not exist. | Return a JSON response with a descriptive error message. Log the validation error details on the server.                |
| `401`       | User is not authenticated.                                                                                                                     | Return a JSON response with the error message "Unauthorized".                                                           |
| `500`       | - Database connection error.<br>- Unexpected server-side exception.                                                                            | Return a generic "Internal Server Error" message. Log the full exception details, including stack trace, for debugging. |

## 7. Performance Considerations

- The operation involves a single `INSERT` into the `Prompt` table and a `SELECT` on the `Category` table. Prisma's generated queries are generally efficient.
- Database indexes on foreign keys (`authorId`, `categoryId`) are already in place, ensuring efficient relation checks.
- The overall performance is expected to be high, with minimal latency. No specific performance optimizations are required for the MVP implementation.

## 8. Implementation Steps

1.  **Create `PromptService`**:
    - Create a new file: `server/services/prompts.ts`.
    - Implement a `createPrompt` function that accepts `(data: CreatePromptCommand, authorId: string)`.
    - Inside the function, use `prisma.$transaction` to ensure atomicity.
    - First, query for the category using `prisma.category.findUnique`. If not found, throw a custom error (e.g., `NotFoundError`).
    - Next, use `prisma.prompt.create` to save the new prompt, connecting the `authorId` and `categoryId`.
    - Include `author` and `category` relations in the returned data from the `create` call.
    - Return the created prompt object.

2.  **Create Zod Validation Schema**:
    - Create a new file `lib/validators/prompt.ts`.
    - Define a `zod` schema named `createPromptSchema` that validates the `CreatePromptCommand` payload against all constraints (types, required fields, string lengths).

3.  **Implement the API Route Handler**:
    - Create a new route file: `app/api/prompts/route.ts`.
    - Define an async `POST` function.
    - Use a `try...catch` block for error handling.
    - **Authentication**: Call `auth()` from `lib/auth.ts` to get the session. If `!session?.user`, return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`.
    - **Validation**: Parse the request body using `await request.json()` and validate it with `createPromptSchema.safeParse()`. If validation fails, return a `400` response with the validation errors.
    - **Service Call**: Call the `createPrompt` function from `PromptService`, passing the validated data and `session.user.id`.
    - **Response**: On success, return a `NextResponse.json(newPrompt, { status: 201 })`.
    - **Error Handling**: In the `catch` block, check for specific service errors (like `NotFoundError`) to return a `400`. For all other errors, log them and return a generic `500` error.
