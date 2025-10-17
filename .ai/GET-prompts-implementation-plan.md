# API Endpoint Implementation Plan: GET /api/prompts

## 1. Endpoint Overview

This endpoint is responsible for retrieving a paginated list of prompts from the database. It is designed to be flexible, supporting public access, user-specific queries, filtering by category, and sorting. By default, it returns public prompts, but can also serve a user's private prompts if the request is properly authenticated.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/prompts`
- **Query Parameters**:
  - **Optional**:
    - `page` (number, default: `1`): The page number for pagination.
    - `pageSize` (number, default: `20`): The number of prompts per page. A server-side maximum of 100 will be enforced.
    - `categoryId` (string): The ID of the category to filter prompts by.
    - `sortBy` (string, default: `createdAt`): The field to sort the prompts by. Allowed values are `createdAt`, `updatedAt`, `title`, `voteCount`.
    - `order` (string, default: `desc`): The sorting order. Allowed values are `asc`, `desc`.
    - `userId` (string): The ID of the user whose prompts are to be retrieved.

## 3. Used Types

- **`PaginatedPromptsDto`**: The main response DTO that structures the output, containing the list of prompts and pagination metadata.
- **`PromptDto`**: The DTO for individual prompt records returned in the list, ensuring a consistent and minimal data shape.

## 4. Response Details

- **Success (200 OK)**: Returns a `PaginatedPromptsDto` object containing the list of prompts and pagination details.
  ```json
  {
    "data": [
      {
        "id": "...",
        "title": "...",
        "description": "...",
        "visibility": "PUBLIC",
        "createdAt": "...",
        "updatedAt": "...",
        "author": { "id": "...", "username": "..." },
        "category": { "id": "...", "name": "..." },
        "voteCount": 10
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 100,
      "totalPages": 5
    }
  }
  ```
- **Error (400 Bad Request)**: Returned if query parameters are invalid (e.g., non-numeric page size).
- **Error (404 Not Found)**: Returned if a specified `categoryId` does not exist.
- **Error (500 Internal Server Error)**: Returned for unexpected server-side issues, such as database failures.

## 5. Data Flow

1.  A `GET` request is made to `/api/prompts` with optional query parameters.
2.  The Next.js API route handler (`app/api/prompts/route.ts`) receives the request.
3.  The handler validates and sanitizes the query parameters (`page`, `pageSize`, `sortBy`, etc.) using **Zod**. It enforces a maximum `pageSize` of 100.
4.  The handler retrieves the current user's session to determine their authentication status and ID.
5.  The handler calls the `getPrompts` method in the `PromptService` (`server/services/prompt.service.ts`), passing the validated parameters and the current user's ID.
6.  The `PromptService` constructs a Prisma query based on the arguments:
    - It builds a `where` clause for filtering by `categoryId`, `userId`, and `visibility`.
    - **Authorization Logic**: If `userId` is provided and matches the authenticated user's ID, the `where` clause allows both `PUBLIC` and `PRIVATE` prompts. Otherwise, it only includes `PUBLIC` prompts.
    - It sets up `orderBy` based on `sortBy` and `order`.
    - It calculates `skip` and `take` for pagination.
7.  The service executes two Prisma queries in a transaction: one to get the paginated list of prompts and another to get the total count of items matching the filters.
8.  The service maps the array of `Prompt` models from Prisma to `PromptDto` objects.
9.  The service returns a `PaginatedPromptsDto` object to the API route handler.
10. The handler sends the DTO back to the client with a `200 OK` status code.

## 6. Security Considerations

- **Authorization**: The endpoint must strictly enforce visibility rules. The logic in the `PromptService` will check if the requesting user is the owner of the prompts (when `userId` is specified) before including `PRIVATE` prompts in the result set.
- **Input Validation**: All query parameters will be rigorously validated using **Zod** to prevent invalid data from reaching the database query. A hard limit on `pageSize` (max 100) will be enforced to mitigate the risk of DoS attacks.
- **Data Exposure**: The use of `PromptDto` ensures that only necessary and safe-to-expose fields are included in the response.
- **ORM Safety**: By using Prisma, queries are automatically parameterized, which prevents SQL injection vulnerabilities.

## 7. Performance Considerations

- **Database Indexing**: The `db-plan.md` confirms that indexes are created on foreign keys (`authorId`, `categoryId`) and other key fields. This is crucial for the performance of filtering and sorting operations.
- **Efficient Pagination**: The query will use `skip` and `take` for efficient database-level pagination, avoiding fetching the entire dataset into memory.
- **Count Query**: The total number of items will be fetched using a separate, optimized `prisma.prompt.count()` query with the same `where` clause to avoid performance issues associated with counting large datasets.

## 8. Implementation Steps

1.  **Create API Route File**: Create the file `app/api/prompts/route.ts` to define the `GET` handler for the endpoint.
2.  **Implement Parameter Validation**: In `route.ts`, parse and validate all query parameters (`page`, `pageSize`, `categoryId`, `sortBy`, `order`, `userId`) using a **Zod** schema. Apply default values and enforce a maximum `pageSize`.
3.  **Create Prompt Service**: Create a new file `server/services/prompt.service.ts`.
4.  **Implement `getPrompts` Method**: In `prompt.service.ts`, create an async function `getPrompts` that accepts the validated query parameters and an optional authenticated user ID.
5.  **Build Prisma Query**: Inside `getPrompts`, dynamically construct the `where` and `orderBy` objects for the Prisma query based on the input parameters. Implement the core authorization logic to correctly filter by `visibility`.
6.  **Execute Database Queries**: Use `prisma.$transaction` to execute the `findMany` (with `skip` and `take`) and `count` queries concurrently.
7.  **Map to DTO**: Transform the results from the Prisma `Prompt` model into the `PromptDto` structure, ensuring the `author` and `category` relations are correctly shaped.
8.  **Construct Paginated Response**: Assemble the final `PaginatedPromptsDto` object, including calculating `totalPages`.
9.  **Integrate Service and Route**: In `route.ts`, call the `getPrompts` service method with the validated parameters.
10. **Implement Error Handling**: Wrap the logic in the route handler in a `try...catch` block. Return appropriate JSON error responses with correct status codes (`400`, `404`, `500`) and log any unexpected server errors.
