import { Suspense } from "react";
import { headers } from "next/headers";

import { PromptList } from "./features/prompts/components/prompt-list";
import { getCategories } from "server/queries/category.queries";
import { getPrompts } from "server/queries/prompt.queries";
import { CategoryFilter } from "./features/prompts/components/category-filter";
import { auth } from "@/lib/auth";

type HomePageProps = {
  searchParams: {
    categoryId?: string;
  };
};

export default async function Home({ searchParams }: HomePageProps) {
  const { categoryId } = await searchParams;
  const prompts = await getPrompts({
    where: {
      categoryId,
    },
  });
  const categories = await getCategories();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="container mx-auto">
      <h1 className="my-4 text-center text-4xl font-bold">Prompts</h1>

      <Suspense>
        <CategoryFilter categories={categories} />
      </Suspense>

      <div className="my-4">
        <PromptList prompts={prompts} session={session} />
      </div>
    </main>
  );
}
