# Prompt Star - Final Database Schema Plan

This document outlines the final Prisma schema for the Prompt Star application, designed for a PostgreSQL database. The schema is based on the Product Requirements Document (PRD), decisions from the database planning session, and the established tech stack.

## 1. List of Tables, Columns, and Constraints

The schema integrates with the BetterAuth library, using its core models and adding project-specific models for prompts, categories, and votes.

### Authentication Models (from BetterAuth)

These models are used as-is, with one addition to the `User` model.

- **`User`**
  - `id`: String (Primary Key)
  - `name`: String
  - `email`: String (Unique)
  - `emailVerified`: Boolean (Default: `false`)
  - `image`: String (Optional)
  - `createdAt`: DateTime (Default: `now()`)
  - `updatedAt`: DateTime (Updated automatically)
  - `username`: String (Optional, Unique)
  - `displayUsername`: String (Optional)
  - **`lastLoginAt`: DateTime (New field, non-nullable)**

- **`Session`**
  - Handles user session data as required by BetterAuth.

- **`Account`**
  - Handles provider account data (e.g., OAuth) as required by BetterAuth.

- **`Verification`**
  - Stores tokens for actions like email verification and password reset.

### Application-Specific Models

- **`Prompt`**
  - `id`: String (Primary Key)
  - `title`: String (Constraint: Max 128 characters)
  - `description`: String (Optional, Constraint: Max 512 characters)
  - `content`: String (Constraint: Max 50,000 characters)
  - `visibility`: `PromptVisibility` ENUM (Default: `PUBLIC`)
  - `isDeleted`: Boolean (Default: `false` for soft-deletes)
  - `createdAt`: DateTime (Default: `now()`)
  - `updatedAt`: DateTime (Updated automatically)
  - `authorId`: String (Foreign Key to `User`, optional/nullable)
  - `categoryId`: String (Foreign Key to `Category`)
  - `voteCount`: Integer (Default: 0)

- **`Category`**
  - `id`: String (Primary Key)
  - `name`: String (Unique)
  - `createdAt`: DateTime (Default: `now()`)
  - `updatedAt`: DateTime (Updated automatically)

- **`Vote`**
  - `id`: String (Primary Key)
  - `userId`: String (Foreign Key to `User`)
  - `promptId`: String (Foreign Key to `Prompt`)
  - `createdAt`: DateTime (Default: `now()`)
  - `updatedAt`: DateTime (Updated automatically)
  - **Constraint**: A compound unique constraint on (`userId`, `promptId`) ensures a user can only vote once per prompt.

### ENUMs

- **`PromptVisibility`**
  - `PUBLIC`
  - `PRIVATE`

## 2. Relationships Between Tables

- **`User` and `Prompt`** (One-to-Many)
  - One `User` can author many `Prompts`.
  - The `author` relation on the `Prompt` model is optional (`User?`). This allows a `User` account to be deleted while their prompts are soft-deleted (retained but anonymized), preserving community content.

- **`User` and `Vote`** (One-to-Many)
  - One `User` can cast many `Votes`.
  - When a `User` is deleted, their associated `Votes` are automatically hard-deleted via a cascading delete rule.

- **`Category` and `Prompt`** (One-to-Many)
  - One `Category` can be assigned to many `Prompts`.

- **`Prompt` and `Vote`** (One-to-Many)
  - One `Prompt` can receive many `Votes`.
  - When a `Prompt` is hard-deleted, its associated `Votes` are automatically hard-deleted via a cascading delete rule.

## 3. Indexes

- **Primary Keys**: An index is automatically created for the `id` field of every table.
- **Unique Constraints**: Prisma automatically creates indexes for all fields with an `@unique` attribute:
  - `User(email)`
  - `User(username)`
  - `Category(name)`
- **Compound Unique Constraints**: A compound index is created for the `Vote` table on (`userId`, `promptId`) to enforce the one-vote-per-user-per-prompt rule.
- **Foreign Keys**: Prisma creates indexes on foreign key columns (`authorId`, `categoryId`, `userId`, `promptId`) to optimize query performance for joins.
- **No Additional Indexes**: Per the MVP strategy, no other custom indexes are defined. Performance will be monitored post-launch, and additional indexes will be added if required.

## 4. Prisma Policies

- Not applicable for this project. Authorization and access control will be managed at the application layer, not through database-level Row-Level Security (RLS).

## 5. Additional Notes and Design Decisions

- **Soft Deletes for Prompts**: The `Prompt` table includes an `isDeleted` flag to enable soft deletion. This prevents data loss if an author deletes their account and ensures that valuable community prompts can be retained. Soft-deleted prompts will be excluded from all application-level queries.
- **Vote Counting Strategy**: A denormalized `voteCount` on the `Prompt` table is used to store the number of votes for a prompt.
- **Data Integrity**: Character limits on `title`, `description`, and `content` are enforced at the database level to ensure data consistency. The unique constraint on `Vote` (`userId`, `promptId`) guarantees the integrity of the voting system.
- **Cascading Deletes for Votes**: The schema is configured to automatically remove all `Vote` records associated with a deleted `User` or `Prompt`. This maintains relational integrity and prevents orphaned rows in the database.
