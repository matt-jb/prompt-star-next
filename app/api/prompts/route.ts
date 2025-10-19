import { NextRequest, NextResponse } from "next/server";
import { getPromptsSchema } from "@/lib/schemas/prompt.schema";
import { PromptService } from "@/server/services/prompt.service";
import { auth } from "@/lib/auth";

const promptService = new PromptService();

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validation = getPromptsSchema.safeParse(searchParams);

    if (!validation.success) {
      return NextResponse.json(validation.error.issues, { status: 400 });
    }

    const result = await promptService.getPrompts({
      ...validation.data,
      currentUserId: session?.user?.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
