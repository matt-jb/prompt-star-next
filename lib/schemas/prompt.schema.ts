import { z } from "zod";
import { PromptVisibility } from "../generated/prisma";

export const createPromptSchema = z.object({
  title: z.string().min(1, "Title is required").max(128),
  description: z
    .string()
    .max(512)
    .nullish()
    .transform((val) => val ?? null),
  content: z.string().min(1, "Content cannot be empty").max(50000),
  visibility: z.enum(PromptVisibility),
  categoryId: z.cuid("Invalid category ID"),
});

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

export const getPromptDetailsSchema = z.object({
  promptId: z.cuid({ message: "Invalid prompt ID" }),
});

export const updatePromptSchema = z.object({
  title: z.string().min(1).max(128).optional(),
  description: z
    .string()
    .max(512)
    .nullish()
    .transform((val) => val ?? null)
    .optional(),
  content: z.string().min(1, "Content cannot be empty").max(50000).optional(),
  visibility: z.enum(PromptVisibility).optional(),
  categoryId: z.cuid().optional(),
});

export const deletePromptSchema = z.object({
  promptId: z.cuid({ message: "Invalid prompt ID" }),
});
