import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PromptFormClient } from "@/app/features/prompts/components/prompt-form-client";
import { PromptService } from "@/server/services/prompt.service";
import { NotFoundError } from "@/server/errors";

const promptService = new PromptService();

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  let prompt;
  try {
    prompt = await promptService.getPromptDetails(promptId, session.user?.id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  // Verify user is the author
  if (prompt.author?.id !== session.user?.id) {
    return redirect("/");
  }

  // Map PromptDetailsDto to PromptFormData format
  const initialData = {
    title: prompt.title,
    description: prompt.description || null,
    content: prompt.content,
    categoryId: prompt.category.id,
    visibility: prompt.visibility as "PUBLIC" | "PRIVATE",
  };

  return <PromptFormClient initialData={initialData} promptId={promptId} />;
}
