import { NextResponse } from "next/server";
import { CategoryService } from "@/server/services/category.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: Request) {
  try {
    const categoryService = new CategoryService();
    const categories = await categoryService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
