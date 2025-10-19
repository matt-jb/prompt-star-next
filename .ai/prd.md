# Product Requirements Document (PRD) - Prompt Star

## 1. Product Overview

Prompt Star is a web-based platform designed for users of large language models (LLMs). It serves as a centralized repository for storing, managing, and sharing text-based and Markdown-formatted prompts. The platform aims to build a community where users can discover and utilize prompts created by others, fostering a collaborative environment for prompt engineering. The initial version (MVP) will focus on core functionalities such as prompt creation, public sharing, and a voting system to identify high-quality content.

## 2. User Problem

Currently, individuals and teams who work with LLMs lack a dedicated, centralized system to organize their prompts effectively. Prompts are often scattered across various documents, notes, or internal wikis, making them difficult to manage, share, and reuse. Furthermore, there is no straightforward way to discover and leverage the collective knowledge of a broader community to find effective, pre-built prompts for various tasks. Prompt Star addresses this by providing a single service for prompt storage and a public space for sharing and discovering prompts from other users.

## 3. Functional Requirements

### 3.1. User Account Management

- **FR-001:** Users must be able to register for a new account using a unique username, a valid email address, and a password.
- **FR-002:** After registration, users must verify their email address by clicking a link sent to them.
- **FR-003:** Users must be able to log in to their account using their email and password.
- **FR-004:** The system must provide a "Forgot Password" functionality to allow users to reset their password via email.
- **FR-005:** Users must be able to log out of their account.

### 3.2. Prompt Management (CRUD)

- **FR-006:** Authenticated users must be able to create new prompts via a dedicated form (`/prompts/new`).
- **FR-007:** A prompt must include a title, a description, the prompt content (plaintext or Markdown), a category, and a visibility setting (public/private).
- **FR-008:** Categories will be selected from a predefined, static list managed by the administrator.
- **FR-009:** Authenticated users must be able to view a list of all their created prompts on their profile page.
- **FR-010:** Authenticated users must be able to edit the details of their own prompts.
- **FR-011:** Authenticated users must be able to delete their own prompts, with a confirmation modal to prevent accidental deletion.
- **FR-012:** Private prompts must only be visible to their creator.
- **FR-013:** Public prompts must be visible to all visitors (both guests and authenticated users).

### 3.3. Community and Interaction Features

- **FR-014:** All visitors can view the full content of public prompts without needing to register.
- **FR-015:** Authenticated users can upvote any public prompt. A user can only vote once per prompt.
- **FR-016:** The UI must provide clear feedback when a user has voted (e.g., button color change).
- **FR-017:** Authenticated users will have access to a "Copy to Clipboard" button for every prompt.
- **FR-018:** A modal encouraging registration will appear when an unauthenticated user attempts to use a feature restricted to logged-in users (e.g., copying a prompt).

### 3.4. Navigation and Content Discovery

- **FR-019:** The homepage will display a list of public prompts.
- **FR-020:** The homepage will feature two main calls to action: "Browse Prompts" and "Join for Free".
- **FR-021:** Users will be able to filter the list of public prompts by category.
- **FR-022:** Users will be able to view "Top" prompts to discover high-quality content.
- **FR-023:** Each user will have a simple, public profile page displaying their username and a gallery of their public prompts.

## 4. Product Boundaries

### 4.1. In Scope for MVP

- User registration, login, and password reset.
- Full CRUD (Create, Read, Update, Delete) functionality for user-owned prompts.
- Support for plaintext and Markdown formats for prompt content.
- Public vs. Private visibility settings for prompts.
- A predefined, static list of categories for prompts.
- Upvoting system for public prompts (one vote per user per prompt).
- Display of top prompts.
- Public user profiles showing a user's public prompts.
- "Copy to Clipboard" functionality for authenticated users.
- Modal-based encouragement for user registration.
- Manual measurement of success metrics via direct database queries.

### 4.2. Out of Scope for MVP

- Trending prompts based on recent vote velocity.
- Support for Bash scripts or combining prompts into workflows/collections (placeholders will be visible but disabled).
- Awarding a "Prompt Star" title to top users.
- Support for additional prompt formats (e.g., JSON, YAML).
- Direct sharing of prompts between specific users.
- AI-powered features like prompt enhancement.
- Tagging prompts with model recommendations.
- Commenting on prompts.
- "Favorite" or "Bookmark" functionality for prompts.
- Displaying a list of users who upvoted a prompt.
- Displaying a user's upvoted prompts on their profile.
- Advanced filtering and sorting options (e.g., by date).
- An administrative dashboard for metric tracking.
- User onboarding tours or tutorials.

## 5. User Stories

### 5.1. Unauthenticated User (Guest)

- **ID:** US-001
- **Title:** Browse Public Prompts
- **Description:** As a guest, I want to see a list of all public prompts on the homepage, with an option to view top prompts, so that I can discover popular and high-quality content.
- **Acceptance Criteria:**
  - The homepage displays a paginated list of public prompts, defaulting to the latest.
  - I can switch between views for "Latest" and "Top" prompts.
  - Each item in the list shows the prompt's title, description, author's username, and upvote count.
  - I can click on a prompt to view its full content on a dedicated page.

- **ID:** US-002
- **Title:** Filter Prompts by Category
- **Description:** As a guest, I want to filter the public prompts by category so that I can find content relevant to my interests.
- **Acceptance Criteria:**
  - A list of predefined categories is visible on the page with the public prompts.
  - Clicking on a category filters the list to show only prompts from that category.
  - The active category filter is clearly indicated.

- **ID:** US-003
- **Title:** View Full Prompt Content
- **Description:** As a guest, I want to view the full content of any public prompt without having to register an account.
- **Acceptance Criteria:**
  - Clicking the "Show full prompt" button (or similar) on a prompt reveals its entire content but also displays a modal encouraging me to register an account.
  - The full content is displayed clearly, with proper rendering for Markdown.

- **ID:** US-004
- **Title:** Be Prompted to Register on Copy to Clipboard
- **Description:** As a guest, when I try to use a feature available only to registered users, I want to see a message encouraging me to create an account.
- **Acceptance Criteria:**
  - When I click the "Copy to Clipboard" button, a modal appears.
  - The modal explains that this feature is for registered users and provides links to "Register" or "Log In".
  - The modal can be dismissed.

- **ID:** US-005
- **Title:** Be Prompted to Register on Upvote
- **Description:** As a guest, when I try to upvote a prompt, I want to see a message encouraging me to create an account.
- **Acceptance Criteria:**
  - When I click the "Upvote" button on a prompt, a modal appears.
  - The modal explains that this feature is for registered users and provides links to "Register" or "Log In".
  - The modal can be dismissed.

### 5.2. Authenticated User

- **ID:** US-005
- **Title:** Register for an Account
- **Description:** As a new user, I want to register for an account using my email, a unique username, and a password so I can access the full features of the platform.
- **Acceptance Criteria:**
  - The registration form requires a username, email, and password.
  - The system validates that the username and email are unique.
  - The password must meet minimum security requirements (e.g., length).
  - After submitting the form, the system sends a verification email to the provided email address.
  - I must click a link in the verification email to activate my account.
  - Upon successful verification, I am automatically logged in and redirected to the homepage.

- **ID:** US-006
- **Title:** Log In to Account
- **Description:** As a registered user, I want to log in with my email and password to access my account.
- **Acceptance Criteria:**
  - The login form accepts an email and password.
  - Upon successful authentication, I am redirected to the homepage.
  - If authentication fails, a clear error message is displayed.

- **ID:** US-007
- **Title:** Reset Password
- **Description:** As a registered user who has forgotten my password, I want to be able to reset it so I can regain access to my account.
- **Acceptance Criteria:**
  - A "Forgot Password?" link is available on the login page.
  - I can enter my email address to receive a password reset link.
  - The link in the email directs me to a page where I can set a new password.
  - After successfully resetting, I can log in with the new password.

- **ID:** US-008
- **Title:** Create a New Prompt
- **Description:** As an authenticated user, I want to create and save a new prompt, providing a title, description, content, category, and visibility.
- **Acceptance Criteria:**
  - A "Create Prompt" button is available in the UI.
  - The creation form includes fields for title, description, content (supporting plaintext/Markdown), a dropdown for category, and a toggle for public/private visibility.
  - All fields (except description) are required.
  - Upon saving, I am redirected to the page for my newly created prompt.

- **ID:** US-009
- **Title:** View My Prompts
- **Description:** As an authenticated user, I want to see a list of all the prompts I have created on my profile page.
- **Acceptance Criteria:**
  - My profile page lists all my prompts (both public and private).
  - Each list item indicates whether the prompt is public or private.
  - I can click on any prompt to navigate to its details page.

- **ID:** US-010
- **Title:** Edit a Prompt
- **Description:** As an authenticated user, I want to edit the details of a prompt I have created.
- **Acceptance Criteria:**
  - An "Edit" button is visible on the details page of prompts I own.
  - Clicking "Edit" presents a form pre-filled with the prompt's current data.
  - I can modify the title, description, content, category, and visibility.
  - Saving the changes updates the prompt and redirects me to its details page.
  - The upvote count is preserved after editing.

- **ID:** US-011
- **Title:** Delete a Prompt
- **Description:** As an authenticated user, I want to permanently delete a prompt I have created.
- **Acceptance Criteria:**
  - A "Delete" button is visible on the details page of prompts I own.
  - Clicking "Delete" triggers a confirmation modal asking, "Are you sure you want to delete this prompt?".
  - Confirming the action permanently removes the prompt from the system.
  - After deletion, I am redirected to my profile page.

- **ID:** US-012
- **Title:** Upvote a Public Prompt
- **Description:** As an authenticated user, I want to upvote a public prompt to show my appreciation and help highlight its quality.
- **Acceptance Criteria:**
  - An upvote button is present on all public prompts that I do not own.
  - I can click the upvote button once per prompt.
  - The UI updates immediately to reflect my vote (e.g., the button changes color and the count increments).
  - Clicking the button again revokes my upvote.
  - I cannot vote on my own prompts.
  - If I am not logged in, I am prompted to log in or register.

- **ID:** US-013
- **Title:** Copy Prompt to Clipboard
- **Description:** As an authenticated user, I want to easily copy the content of any prompt to my clipboard.
- **Acceptance Criteria:**
  - A "Copy to Clipboard" button is available on every prompt's detail page.
  - Clicking the button copies the full prompt content to the system clipboard.
  - A visual confirmation (e.g., a "Copied!" tooltip) is shown temporarily after clicking.
  - If I am not logged in, I am prompted to log in or register.

- **ID:** US-014
- **Title:** View Public User Profile
- **Description:** As any user, I want to be able to click on a username to view that user's public profile page.
- **Acceptance Criteria:**
  - Usernames on prompt listings are clickable links.
  - The public profile page displays the user's username and a gallery of their public prompts.
  - Private prompts are not visible on the public profile page.

## 6. Success Metrics

- **SC-001: Conversion Rate**
  - _Metric:_ 10% of visitors who interact with a feature requiring login (e.g., clicking "Copy") successfully create an account or log in.
  - _Measurement:_ (Number of new registrations from registration modal / Number of unique users who viewed the modal) \* 100. To be measured manually via database queries.

- **SC-002: User Engagement**
  - _Metric:_ 2% of authenticated users create at least one prompt or cast at least one upvote.
  - _Measurement:_ (Number of users with >= 1 prompt OR >= 1 upvote / Total number of registered users) \* 100. To be measured manually via database queries.

- **SC-003: User Retention**
  - _Metric:_ At least 30% of registered users return to the service within 30 days of their first login.
  - _Measurement:_ (Number of users who logged in again within 30 days of registration / Total new users in that cohort) \* 100. To be measured manually via database queries.
