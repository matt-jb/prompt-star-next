import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

/**
 * Clean the test database by deleting all data in the correct order
 * to respect foreign key constraints.
 */
export async function cleanDatabase() {
  await prisma.$transaction([
    prisma.vote.deleteMany(),
    prisma.prompt.deleteMany(),
    prisma.category.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

/**
 * Seed minimal test data required for E2E tests.
 * Creates a test user and sample categories.
 */
export async function seedTestData() {
  // Create test user
  const testUser = await prisma.user.create({
    data: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      displayUsername: "Test User",
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  // Create test account with password
  await prisma.account.create({
    data: {
      id: "test-account-id",
      accountId: "test-account-id",
      providerId: "credential",
      userId: testUser.id,
      // This is a hashed password for "password123"
      // You may need to generate this using BetterAuth's hash function
      password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    },
  });

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      { id: "cat-general", name: "General" },
      { id: "cat-coding", name: "Coding" },
      { id: "cat-writing", name: "Writing" },
      { id: "cat-marketing", name: "Marketing" },
    ],
  });

  return {
    user: testUser,
    categories,
  };
}

/**
 * Setup test database: clean and seed.
 */
export async function setupTestDatabase() {
  await cleanDatabase();
  return await seedTestData();
}

/**
 * Disconnect from the database.
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export { prisma };
