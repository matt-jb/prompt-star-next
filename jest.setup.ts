// Mock Prisma Client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    prompt: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    vote: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock BetterAuth
jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));
