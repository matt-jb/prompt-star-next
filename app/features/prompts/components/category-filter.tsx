"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/ui/badge";
import { TCategories } from "server/queries/category.queries";

type CategoryFilterProps = {
  categories: TCategories;
};

export const CategoryFilter = ({ categories }: CategoryFilterProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);

    if (params.get("categoryId") === categoryId) {
      params.delete("categoryId");
    } else {
      params.set("categoryId", categoryId);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const selectedCategory = searchParams.get("categoryId");

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((category) => (
        <Badge
          className="cursor-pointer"
          variant={selectedCategory === category.id ? "default" : "secondary"}
          onClick={() => handleCategoryClick(category.id)}
          key={category.id}
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
};
