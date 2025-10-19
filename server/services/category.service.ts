import prisma from "@/lib/prisma";
import { CategoryDto } from "@/lib/dto";

export class CategoryService {
  public async getAllCategories(): Promise<CategoryDto[]> {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  }
}
