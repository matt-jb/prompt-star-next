import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { ConflictError, NotFoundError } from "@/server/errors";

export async function createVote(promptId: string, userId: string) {
  try {
    const vote = await prisma.$transaction(async (tx) => {
      const prompt = await tx.prompt.findUnique({
        where: { id: promptId, isDeleted: false },
      });

      if (!prompt) {
        throw new NotFoundError("Prompt not found.");
      }

      const newVote = await tx.vote.create({
        data: {
          promptId,
          userId,
        },
      });

      await tx.prompt.update({
        where: { id: promptId },
        data: {
          voteCount: {
            increment: 1,
          },
        },
      });

      return newVote;
    });

    return vote;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError("You have already voted for this prompt.");
      }
    }
    throw error;
  }
}

export async function deleteVote(promptId: string, userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.vote.delete({
        where: {
          userId_promptId: {
            userId,
            promptId,
          },
        },
      });

      await tx.prompt.update({
        where: { id: promptId },
        data: {
          voteCount: {
            decrement: 1,
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new NotFoundError("Vote not found.");
      }
    }
    throw error;
  }
}
