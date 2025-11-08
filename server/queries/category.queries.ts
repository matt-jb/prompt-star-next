import prisma from "@/lib/prisma";

export const getCategories = () => prisma.category.findMany();

export type TCategories = Awaited<ReturnType<typeof getCategories>>;
