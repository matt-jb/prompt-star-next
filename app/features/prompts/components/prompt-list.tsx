"use client";

import { TPrompts } from "server/queries/prompt.queries";
import { PromptCard } from "./prompt-card";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

type PromptListProps = {
  prompts: TPrompts;
  session: Session | null;
};

export const PromptList = ({ prompts, session }: PromptListProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt: TPrompts[number]) => (
        <PromptCard key={prompt.id} prompt={prompt} session={session} />
      ))}
    </div>
  );
};
