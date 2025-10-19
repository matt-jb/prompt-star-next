import { z } from "zod";

export const getPromptsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  categoryId: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title", "voteCount"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  userId: z.string().optional(),
});

export const getTopAndTrendingPromptsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  period: z.coerce.number().int().min(1).default(7),
  categoryId: z.string().optional(),
});
