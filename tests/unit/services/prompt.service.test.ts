import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { PromptService } from "@/server/services/prompt.service";
import db from "@/lib/prisma";
import { PromptVisibility } from "@/lib/generated/prisma";
import { NotFoundError, BadRequestError } from "@/server/errors";

describe("PromptService", () => {
  let promptService: PromptService;

  beforeEach(() => {
    promptService = new PromptService();
    jest.clearAllMocks();
  });

  describe("createPrompt", () => {
    it("should create a prompt with valid data", async () => {
      const mockCategory = {
        id: "clkz7x8x80000",
        name: "Testing",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrompt = {
        id: "clkz7x8x80001",
        title: "Test Prompt",
        description: "Test description",
        content: "Test content",
        visibility: PromptVisibility.PUBLIC,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: "clkz7x8x80002",
        categoryId: "clkz7x8x80000",
        isDeleted: false,
        voteCount: 0,
        author: {
          id: "clkz7x8x80002",
          username: "testuser",
        },
        category: {
          id: "clkz7x8x80000",
          name: "Testing",
        },
      };

      const mockTransaction = jest.fn(async (callback: any) => {
        const mockPrisma = {
          category: {
            findUnique: jest.fn().mockResolvedValue(mockCategory),
          },
          prompt: {
            create: jest.fn().mockResolvedValue(mockPrompt),
          },
        };
        return callback(mockPrisma);
      });

      (db.$transaction as jest.Mock) = mockTransaction;

      const data = {
        title: "Test Prompt",
        description: "Test description",
        content: "Test content",
        visibility: PromptVisibility.PUBLIC,
        categoryId: "clkz7x8x80000",
      };

      const result = await promptService.createPrompt(data, "clkz7x8x80002");

      expect(result).toMatchObject({
        id: "clkz7x8x80001",
        title: "Test Prompt",
        description: "Test description",
        content: "Test content",
        visibility: PromptVisibility.PUBLIC,
        author: {
          id: "clkz7x8x80002",
          username: "testuser",
        },
        category: {
          id: "clkz7x8x80000",
          name: "Testing",
        },
      });
      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should throw NotFoundError when category does not exist", async () => {
      const mockTransaction = jest.fn(async (callback: any) => {
        const mockPrisma = {
          category: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
          prompt: {
            create: jest.fn(),
          },
        };
        return callback(mockPrisma);
      });

      (db.$transaction as jest.Mock) = mockTransaction;

      const data = {
        title: "Test Prompt",
        description: "Test description",
        content: "Test content",
        visibility: PromptVisibility.PUBLIC,
        categoryId: "clkz9x9x99999", // Valid CUID format but non-existent
      };

      await expect(
        promptService.createPrompt(data, "clkz7x8x80002")
      ).rejects.toThrow(NotFoundError);
    });

    it("should validate data with Zod schema", async () => {
      const invalidData = {
        title: "", // Empty title should fail validation
        description: "Test",
        content: "Test",
        visibility: PromptVisibility.PUBLIC,
        categoryId: "clkz7x8x80000",
      };

      await expect(
        promptService.createPrompt(invalidData as any, "clkz7x8x80002")
      ).rejects.toThrow();
    });
  });

  describe("updatePrompt", () => {
    it("should update prompt with valid data", async () => {
      const existingPrompt = {
        id: "clkz7x8x80001",
        title: "Old Title",
        description: "Old description",
        content: "Old content",
        visibility: PromptVisibility.PUBLIC,
        authorId: "clkz7x8x80002",
        categoryId: "clkz7x8x80000",
        isDeleted: false,
        voteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPrompt = {
        ...existingPrompt,
        title: "New Title",
        description: "New description",
        author: {
          id: "clkz7x8x80002",
          username: "testuser",
        },
        category: {
          id: "clkz7x8x80000",
          name: "Testing",
        },
      };

      (db.prompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      (db.category.findUnique as jest.Mock).mockResolvedValue({
        id: "clkz7x8x80000",
        name: "Testing",
      });
      (db.prompt.update as jest.Mock).mockResolvedValue(updatedPrompt);

      const updateData = {
        title: "New Title",
        description: "New description",
      };

      const result = await promptService.updatePrompt(
        "clkz7x8x80001",
        "clkz7x8x80002",
        updateData
      );

      expect(result.title).toBe("New Title");
      expect(result.description).toBe("New description");
      expect(db.prompt.update).toHaveBeenCalledWith({
        where: { id: "clkz7x8x80001" },
        data: expect.objectContaining({
          title: "New Title",
          description: "New description",
        }),
        include: expect.any(Object),
      });
    });

    it("should throw NotFoundError when prompt does not exist", async () => {
      (db.prompt.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        promptService.updatePrompt("clkz9x9x99999", "clkz7x8x80002", {
          title: "New Title",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when user is not the author", async () => {
      const existingPrompt = {
        id: "clkz7x8x80001",
        title: "Test",
        authorId: "clkz9x9x99998",
        isDeleted: false,
      };

      (db.prompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      await expect(
        promptService.updatePrompt("clkz7x8x80001", "clkz7x8x80002", {
          title: "New Title",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError when new category does not exist", async () => {
      const existingPrompt = {
        id: "clkz7x8x80001",
        authorId: "clkz7x8x80002",
        isDeleted: false,
      };

      (db.prompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      (db.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        promptService.updatePrompt("clkz7x8x80001", "clkz7x8x80002", {
          categoryId: "clkz9x9x99999",
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("deletePrompt", () => {
    it("should successfully delete a prompt", async () => {
      (db.prompt.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await expect(
        promptService.deletePrompt("clkz7x8x80001", "clkz7x8x80002")
      ).resolves.not.toThrow();

      expect(db.prompt.updateMany).toHaveBeenCalledWith({
        where: {
          id: "clkz7x8x80001",
          authorId: "clkz7x8x80002",
          isDeleted: false,
        },
        data: {
          isDeleted: true,
        },
      });
    });

    it("should throw NotFoundError when prompt does not exist", async () => {
      (db.prompt.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (db.prompt.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        promptService.deletePrompt("clkz9x9x99999", "clkz7x8x80002")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when user is not the author", async () => {
      const existingPrompt = {
        id: "clkz7x8x80001",
        authorId: "clkz9x9x99998",
        isDeleted: false,
      };

      (db.prompt.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (db.prompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      await expect(
        promptService.deletePrompt("clkz7x8x80001", "clkz7x8x80002")
      ).rejects.toThrow();
    });
  });

  describe("getPromptDetails", () => {
    it("should return prompt details for public prompt", async () => {
      const mockPrompt = {
        id: "clkz7x8x80001",
        title: "Test Prompt",
        description: "Test description",
        content: "Test content",
        visibility: PromptVisibility.PUBLIC,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: "clkz7x8x80002",
        voteCount: 5,
        isDeleted: false,
        author: {
          id: "clkz7x8x80002",
          username: "testuser",
        },
        category: {
          id: "clkz7x8x80000",
          name: "Testing",
        },
      };

      (db.prompt.findUnique as jest.Mock).mockResolvedValue(mockPrompt);
      (db.vote.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await promptService.getPromptDetails("clkz7x8x80001");

      expect(result).toMatchObject({
        id: "clkz7x8x80001",
        title: "Test Prompt",
        content: "Test content",
        voteCount: 5,
        hasVoted: false,
      });
    });

    it("should throw NotFoundError when prompt does not exist", async () => {
      (db.prompt.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        promptService.getPromptDetails("clkz9x9x99999")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when accessing private prompt without authorization", async () => {
      const privatePrompt = {
        id: "clkz7x8x80001",
        visibility: PromptVisibility.PRIVATE,
        authorId: "clkz9x9x99998",
        isDeleted: false,
      };

      (db.prompt.findUnique as jest.Mock).mockResolvedValue(privatePrompt);

      await expect(
        promptService.getPromptDetails("clkz7x8x80001", "clkz7x8x80002")
      ).rejects.toThrow(NotFoundError);
    });

    it("should return hasVoted true when user has voted", async () => {
      const mockPrompt = {
        id: "clkz7x8x80001",
        title: "Test",
        description: "Test",
        content: "Test",
        visibility: PromptVisibility.PUBLIC,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: "clkz7x8x80002",
        voteCount: 5,
        isDeleted: false,
        author: { id: "clkz7x8x80002", username: "test" },
        category: { id: "clkz7x8x80000", name: "Test" },
      };

      const mockVote = {
        id: "clkz7x8x80003",
        userId: "clkz7x8x80004",
        promptId: "clkz7x8x80001",
      };

      (db.prompt.findUnique as jest.Mock).mockResolvedValue(mockPrompt);
      (db.vote.findUnique as jest.Mock).mockResolvedValue(mockVote);

      const result = await promptService.getPromptDetails(
        "clkz7x8x80001",
        "clkz7x8x80004"
      );

      expect(result.hasVoted).toBe(true);
    });
  });
});
