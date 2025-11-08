"use client";

import { TPrompts } from "server/queries/prompt.queries";
import { PromptCard } from "./prompt-card";

type PromptListProps = {
  prompts: TPrompts;
};

export const PromptList = ({ prompts }: PromptListProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt: TPrompts[number]) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
};
