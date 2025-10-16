<conversation_summary>
<decisions>

1.  A dedicated `Category` table will be implemented instead of a static `ENUM`.
2.  Vote counts will be calculated via direct database queries for the MVP; a denormalized counter will not be used.
3.  The `BetterAuth` schema (`User`, `Account`, `Session`, `Verification`) will be used as-is, with no changes except for the addition of a `lastLoginAt` field to the `User` model.
4.  The `lastLoginAt` field will be non-nullable and populated upon user registration.
5.  Character limits will be enforced at the database level: `title` (100), `description` (500), and `content` (50,000).
6.  When a user account is deleted, their associated prompts will be soft-deleted by setting an `isDeleted` flag to `true`. Their votes will be hard-deleted via a cascading delete.
7.  The relationship between a soft-deleted prompt and its author will be maintained by making the author relation optional on the `Prompt` model.
8.  Additional indexes for performance optimization will not be created for the MVP.
9.  A `PromptVisibility` ENUM (`PUBLIC`, `PRIVATE`) will be used, with the default visibility for new prompts set to `PUBLIC`.
10. The application will assume all prompt content is Markdown.
11. Deleting a `Category` that is in use will be allowed; no `onDelete: Restrict` rule will be implemented, as this will be handled manually by administrators.
12. All new models (`Prompt`, `Category`, `Vote`) will include `createdAt` and `updatedAt` timestamps.
13. Category names will be unique.
14. Soft-deleted prompts will be inaccessible to all users through the application interface.
    </decisions>

<matched_recommendations>

1.  Implement a `Category` model/table with a one-to-many relationship to the `Prompt` model for long-term flexibility.
2.  Create a `Vote` model and enforce the "one vote per user per prompt" rule by defining a compound unique constraint on the `userId` and `promptId` fields.
3.  The schema should accommodate `BetterAuth` by using its standard models (`User`, `Account`, `Session`, `VerificationToken`).
4.  Add a `lastLoginAt` timestamp field to the `User` model to capture data required for success metrics.
5.  Configure a cascading delete rule for the `Vote` model so that when a `User` or `Prompt` is deleted, their associated votes are automatically removed.
6.  Use a `PromptVisibility` ENUM with `PUBLIC` and `PRIVATE` values to manage prompt visibility.
7.  Enforce character limits for `title` and `description` at the database level to ensure data integrity.
8.  Make the `author` relation on the `Prompt` model optional (`User?`) to handle cases where an author's account is deleted but their prompts are soft-deleted.
9.  Include `createdAt` and `updatedAt` timestamps on all new models as a best practice for auditing.
10. Enforce a unique constraint on the `name` field of the `Category` model to prevent duplicates.
    </matched_recommendations>

<database_planning_summary>
This summary outlines the database plan for the Prompt Star MVP, based on the product requirements and subsequent decisions.

**Main Requirements:**
The database must support user account management via `BetterAuth`, full CRUD functionality for prompts, a predefined list of categories, a voting system, and public/private visibility settings for prompts. The design prioritizes simplicity and data integrity for the MVP stage.

**Key Entities and Relationships:**

- **Authentication Models (`User`, `Account`, `Session`, `Verification`):** These will be based on the existing `BetterAuth` Prisma schema. The `User` model will be modified to include a non-nullable `lastLoginAt: DateTime` field, which will be set upon registration. No other changes will be made to these core models.
- **`Prompt`:** This is a central entity.
  - **Fields:** It will include `title` (String, 100 chars), `description` (String, 500 chars), `content` (String, 50,000 chars), `visibility` (ENUM `PromptVisibility`, default `PUBLIC`), `isDeleted` (Boolean, default `false` for soft-deletes), `createdAt`, and `updatedAt`.
  - **Relationships:** It will have a many-to-one relationship with `User` (the author) and `Category`. It will have a one-to-many relationship with `Vote`. The relation to `User` will be optional to support author deletion while retaining soft-deleted prompts.
- **`Category`:**
  - **Fields:** It will have a `name` (String, unique) and timestamps (`createdAt`, `updatedAt`).
  - **Relationships:** It has a one-to-many relationship with `Prompt`.
- **`Vote`:**
  - **Fields:** It will link a user and a prompt. A compound unique constraint on `userId` and `promptId` will be enforced at the database level to prevent duplicate votes. It will also include timestamps.
  - **Relationships:** It has many-to-one relationships with both `User` and `Prompt`.

**Data Integrity and Deletion Rules:**

- When a `User` is deleted, their `Prompts` are soft-deleted (`isDeleted` set to `true`), and their `Votes` are hard-deleted (cascade delete).
- When a `Prompt` is deleted, its associated `Votes` are hard-deleted (cascade delete).
- Character limits and unique constraints (`Category.name`, `Vote(userId, promptId)`) will be enforced at the database level.

**Security and Scalability Concerns:**

- **Security:** The "one vote per user per prompt" rule is guaranteed by a database constraint. Soft-deletion of prompts upon user account deletion prevents data loss while removing user-identifiable content from public view.
- **Scalability:** For the MVP, performance optimizations such as a denormalized `voteCount` on prompts and specialized indexes have been deferred. Read operations will rely on direct queries. This is acceptable for the initial launch but should be revisited as the platform scales.

</database_planning_summary>

<unresolved_issues>

- The initial, predefined list of category names needs to be provided. This list is required to create a database seed script that will populate the `Category` table upon initial setup.
  </unresolved_issues>
  </conversation_summary>
