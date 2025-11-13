import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PromptService } from "@/server/services/prompt.service";
import {
  getPromptDetailsSchema,
  updatePromptSchema,
  deletePromptSchema,
} from "@/lib/schemas/prompt.schema";
import { ZodError } from "zod";

const promptService = new PromptService();

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ promptId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "Request body cannot be empty" },
        { status: 400 }
      );
    }

    const validatedData = updatePromptSchema.parse(body);

    const updatedPrompt = await promptService.updatePrompt(
      params.promptId,
      session.user.id,
      validatedData
    );

    return NextResponse.json(updatedPrompt, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.name === "NotFoundError") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error.name === "ForbiddenError") {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      if (error.name === "BadRequestError") {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ promptId: string }> }
) {
  const params = await props.params;
  try {
    const validation = getPromptDetailsSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(validation.error.issues, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const prompt = await promptService.getPromptDetails(
      validation.data.promptId,
      session?.user?.id
    );

    return NextResponse.json(prompt);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === "NotFoundError" ||
        error.message.includes("not found")
      ) {
        return NextResponse.json(
          { message: "Prompt not found" },
          { status: 404 }
        );
      }
      if (error.name === "ForbiddenError") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ promptId: string }> }
) {
  const params = await props.params;
  try {
    const validation = deletePromptSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(validation.error.issues, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await promptService.deletePrompt(validation.data.promptId, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.name === "NotFoundError") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error.name === "ForbiddenError") {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
    }
    console.error("Error deleting prompt:", {
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    });
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
