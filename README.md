# Prompt Star

A web-based platform for storing, managing, and sharing LLM prompts to build a collaborative prompt engineering community.

---

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
  - [In Scope for MVP](#in-scope-for-mvp)
  - [Out of Scope for MVP](#out-of-scope-for-mvp)
- [Project Status](#project-status)
- [License](#license)

---

## Project Description

Prompt Star is a centralized repository designed for users of large language models (LLMs) to store, manage, and share prompts.

Currently, prompts are often scattered across various documents and notes, making them difficult to manage, share, and reuse. This platform addresses that problem by providing a single service for prompt storage and a public space for sharing and discovering high-quality prompts from other users, fostering a collaborative environment for prompt engineering.

## Tech Stack

The project is built with a modern, type-safe, and performant tech stack:

- **Framework**: [Next.js](https://nextjs.org/) 15
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5
- **UI**: [React](https://react.dev/) 19 & [Tailwind CSS](https://tailwindcss.com/) 4
- **Component Library**: [Shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [BetterAuth](https://better-auth.dev/)
- **Data Fetching**: [Tanstack Query](https://tanstack.com/query/latest)

## Getting Started Locally

Follow these instructions to set up the project on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed:

- **Node.js**: Version `22.20.0` (as specified in the `.nvmrc` file). We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
- **npm**: Comes with Node.js.
- **PostgreSQL**: A running instance of PostgreSQL.

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/prompt-star-next.git
    cd prompt-star-next
    ```

2.  **Set up the Node.js version:**
    If you are using `nvm`, run this command to switch to the correct Node.js version:

    ```sh
    nvm use
    ```

3.  **Install dependencies:**

    ```sh
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:

    ```sh
    cp .env.example .env
    ```

    Update the `.env` file with your database connection string and other required credentials.

    ```env
    # .env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Add other environment variables for services like BetterAuth
    # BETTER_AUTH_...
    ```

5.  **Run database migrations:**
    This command will apply the database schema from Prisma.

    ```sh
    npx prisma migrate dev
    ```

6.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the code to find and fix problems.
- `npm run format`: Formats all files.
- `npm run format:check`: Checks if all files are formatted correctly.

## Project Scope

The initial version (MVP) of the project has a defined scope to focus on core functionalities.

### In Scope for MVP

- **User Management**: Registration, login, password reset, and email verification.
- **Prompt CRUD**: Full Create, Read, Update, and Delete functionality for user-owned prompts.
- **Prompt Format**: Support for plaintext and Markdown.
- **Visibility**: Public vs. Private settings for prompts.
- **Voting System**: Upvoting for public prompts (one vote per user per prompt).
- **User Profiles**: Public profiles displaying a user's public prompts.
- **Interaction**: "Copy to Clipboard" for authenticated users and a registration modal for guests.

### Out of Scope for MVP

- Advanced prompt formats (e.g., JSON, YAML, Bash).
- Prompt collections or workflows.
- Direct sharing of prompts between users.
- Commenting, favoriting, or bookmarking prompts.
- Advanced filtering and sorting options.
- AI integration for prompt enhancement.
- An administrative dashboard.

## Project Status

**Active Development**: The project is currently under active development, focusing on delivering the features outlined in the MVP scope.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
