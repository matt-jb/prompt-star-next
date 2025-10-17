/**
 * This file contains all the Data Transfer Objects (DTOs) and Command Models
 * used in the API layer of the application.
 *
 * DTOs are used to shape the data sent back in API responses.
 * Command Models are used to type the request payloads for creating or updating resources.
 *
 * These types are derived from the Prisma-generated types to ensure they stay
 * in sync with the database schema.
 */
import type { Category, Prompt, User, Vote } from "./generated/prisma";

// =================================================================================
// Category DTOs
// =================================================================================

/**
 * DTO for a prompt category.
 * Used in GET /api/categories
 */
export type CategoryDto = Pick<Category, "id" | "name">;

// =================================================================================
// Vote DTOs and Command Models
// =================================================================================

/**
 * DTO for a newly created vote.
 * Used in POST /api/prompts/{promptId}/vote response.
 */
export type VoteDto = Pick<Vote, "id" | "userId" | "promptId" | "createdAt">;

/**
 * Command model for checking vote status on multiple prompts.
 * Used in POST /api/votes/batch-check request.
 */
export type BatchCheckVotesCommand = {
  promptIds: string[];
};

/**
 * DTO for the result of a batch vote check for a single prompt.
 */
export type BatchCheckVotesResultDto = {
  promptId: string;
  hasVoted: boolean;
};

/**
 * DTO for the results of a batch vote check.
 * Used in POST /api/votes/batch-check response.
 */
export type BatchCheckVotesDto = BatchCheckVotesResultDto[];

// =================================================================================
// Prompt DTOs and Command Models
// =================================================================================

/**
 * Base DTO for a prompt, containing common fields.
 * This is intended for internal use to build other DTOs.
 */
type BasePromptDto = Pick<
  Prompt,
  "id" | "title" | "description" | "visibility" | "createdAt" | "updatedAt"
> & {
  author: Pick<User, "id" | "username"> | null;
  category: Pick<Category, "id" | "name">;
};

/**
 * DTO for a prompt as it appears in a list.
 * Used in GET /api/prompts
 */
export type PromptDto = BasePromptDto & {
  voteCount: number;
};

/**
 * DTO for a paginated list of prompts.
 * Used in GET /api/prompts response.
 */
export type PaginatedPromptsDto = {
  data: PromptDto[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

/**
 * DTO for the detailed view of a single prompt.
 * Includes full content and user-specific voting information.
 * Used in GET /api/prompts/{promptId} response.
 */
export type PromptDetailsDto = BasePromptDto &
  Pick<Prompt, "content"> & {
    voteCount: number;
    hasVoted: boolean;
  };

/**
 * DTO for a newly created prompt.
 * Used in POST /api/prompts response.
 */
export type CreatedPromptDto = BasePromptDto & Pick<Prompt, "content">;

/**
 * Command model for creating a new prompt.
 * Used in POST /api/prompts request.
 */
export type CreatePromptCommand = Pick<
  Prompt,
  "title" | "description" | "content" | "visibility" | "categoryId"
>;

/**
 * Command model for updating an existing prompt.
 * All fields are optional.
 * Used in PATCH /api/prompts/{promptId} request.
 */
export type UpdatePromptCommand = Partial<
  Pick<
    Prompt,
    "title" | "description" | "content" | "visibility" | "categoryId"
  >
>;
