import type { Prisma } from "@/lib/generated/prisma";
import db from "@/lib/prisma";
import type { z } from "zod";
import { getPromptsSchema } from "@/lib/schemas/prompt.schema";
import type { PaginatedPromptsDto, PromptDto } from "@/lib/dto";
import { PromptVisibility } from "@/lib/generated/prisma";
import type { getTopAndTrendingPromptsSchema } from "@/lib/schemas/prompt.schema";

type GetPromptsOptions = z.infer<typeof getPromptsSchema> & {
  currentUserId?: string;
};

export class PromptService {
  public async getPrompts(
    options: GetPromptsOptions
  ): Promise<PaginatedPromptsDto> {
    const { page, pageSize, sortBy, order, categoryId, userId, currentUserId } =
      options;

    const where: Prisma.PromptWhereInput = {
      isDeleted: false,
      // Optimistically assume the category exists if it's provided
      // TODO: Catch category not found error and return a 404
      category: categoryId ? { id: categoryId } : undefined,
      visibility: PromptVisibility.PUBLIC,
      authorId: userId ? userId : undefined,
    };

    if (currentUserId && userId === currentUserId) {
      where.visibility = {
        in: [PromptVisibility.PUBLIC, PromptVisibility.PRIVATE],
      };
    }

    const orderBy: Prisma.PromptOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [prompts, totalItems] = await db.$transaction([
      db.prompt.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          author: {
            select: { id: true, username: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      }),
      db.prompt.count({ where }),
    ]);

    const mappedPrompts: PromptDto[] = prompts.map((prompt) =>
      this._mapToPromptDto(prompt)
    );

    return {
      data: mappedPrompts,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  public async getTrendingPrompts(
    options: z.infer<typeof getTopAndTrendingPromptsSchema>
  ): Promise<PaginatedPromptsDto> {
    const { page, pageSize, period, categoryId } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const voteWhere: Prisma.VoteWhereInput = {
      createdAt: {
        gte: startDate,
      },
      prompt: {
        isDeleted: false,
        visibility: PromptVisibility.PUBLIC,
        ...(categoryId && { categoryId }),
      },
    };

    const topPromptsByVote = await db.vote.groupBy({
      by: ["promptId"],
      where: voteWhere,
      _count: {
        promptId: true,
      },
      orderBy: {
        _count: {
          promptId: "desc",
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    if (topPromptsByVote.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    const promptIds = topPromptsByVote.map((p) => p.promptId);

    const allTopPromptsByVote = await db.vote.groupBy({
      by: ["promptId"],
      where: voteWhere,
    });
    const totalItems = allTopPromptsByVote.length;

    const prompts = await db.prompt.findMany({
      where: {
        id: {
          in: promptIds,
        },
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    const promptsWithVoteCountInPeriod = prompts.map((prompt) => {
      const voteInfo = topPromptsByVote.find((p) => p.promptId === prompt.id);
      return {
        ...prompt,
        periodVoteCount: voteInfo?._count.promptId ?? 0,
      };
    });

    const orderedPrompts = promptIds
      .map((id) => promptsWithVoteCountInPeriod.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const mappedPrompts: PromptDto[] = orderedPrompts.map((prompt) =>
      this._mapToPromptDto(prompt)
    );

    return {
      data: mappedPrompts,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  public async getTopPrompts(
    options: z.infer<typeof getTopAndTrendingPromptsSchema>
  ): Promise<PaginatedPromptsDto> {
    const { page, pageSize, period, categoryId } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const where: Prisma.PromptWhereInput = {
      createdAt: {
        gte: startDate,
      },
      isDeleted: false,
      visibility: PromptVisibility.PUBLIC,
      ...(categoryId && { categoryId }),
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [prompts, totalItems] = await db.$transaction([
      db.prompt.findMany({
        where,
        orderBy: {
          voteCount: "desc",
        },
        skip,
        take,
        include: {
          author: {
            select: { id: true, username: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      }),
      db.prompt.count({ where }),
    ]);

    const mappedPrompts: PromptDto[] = prompts.map((prompt) =>
      this._mapToPromptDto(prompt)
    );

    return {
      data: mappedPrompts,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  private _mapToPromptDto(prompt: {
    id: string;
    title: string;
    description: string | null;
    visibility: PromptVisibility;
    createdAt: Date;
    updatedAt: Date;
    voteCount: number;
    author: { id: string; username: string | null } | null;
    category: { id: string; name: string };
    periodVoteCount?: number;
  }): PromptDto {
    return {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      visibility: prompt.visibility,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      author: prompt.author,
      category: prompt.category,
      voteCount: prompt.voteCount,
      ...(prompt.periodVoteCount !== undefined && {
        periodVoteCount: prompt.periodVoteCount,
      }),
    };
  }
}
