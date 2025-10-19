import { NextRequest, NextResponse } from "next/server";
import {
  getPromptsSchema,
  createPromptSchema,
} from "@/lib/schemas/prompt.schema";
import { PromptService } from "@/server/services/prompt.service";
import { auth } from "@/lib/auth";
import { NotFoundError } from "@/server/errors";
import { ZodError } from "zod";

const promptService = new PromptService();

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const data = createPromptSchema.parse(json);

    const newPrompt = await promptService.createPrompt(data, session.user.id);

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

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
