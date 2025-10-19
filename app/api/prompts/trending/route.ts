import { NextRequest, NextResponse } from "next/server";
import { getTopAndTrendingPromptsSchema } from "@/lib/schemas/prompt.schema";
import { PromptService } from "@/server/services/prompt.service";

const promptService = new PromptService();

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validation = getTopAndTrendingPromptsSchema.safeParse(searchParams);

    if (!validation.success) {
      return NextResponse.json(validation.error.issues, { status: 400 });
    }

    const result = await promptService.getTrendingPrompts(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Error fetching trending prompts:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
