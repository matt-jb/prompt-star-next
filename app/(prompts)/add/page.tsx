import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PromptFormClient } from "@/app/features/prompts/components/prompt-form-client";

export default async function AddPromptPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  return <PromptFormClient />;
}
