import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getPrompts = <
  T extends Prisma.Args<typeof prisma.prompt, "findMany">,
>(
  query?: T
) =>
  prisma.prompt.findMany({
    ...query,
    where: {
      ...query?.where,
      isDeleted: false,
      visibility: "PUBLIC",
    },
    include: {
      ...query?.include,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          votes: true,
        },
      },
    },
  });

export type TPrompts = Awaited<ReturnType<typeof getPrompts>>;
