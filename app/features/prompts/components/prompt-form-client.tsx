"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";

type Category = {
  id: string;
  name: string;
};

type FormErrors = {
  title?: string;
  content?: string;
  categoryId?: string;
  visibility?: string;
  general?: string;
};

type PromptFormData = {
  title: string;
  description: string | null;
  content: string;
  categoryId: string;
  visibility: "PUBLIC" | "PRIVATE";
};

type PromptFormClientProps = {
  initialData?: PromptFormData;
  promptId?: string;
};

export function PromptFormClient({
  initialData,
  promptId,
}: PromptFormClientProps) {
  const router = useRouter();
  const isEditMode = !!promptId;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<PromptFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    categoryId: initialData?.categoryId || "",
    visibility: initialData?.visibility || "PUBLIC",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const url = isEditMode ? `/api/prompts/${promptId}` : "/api/prompts";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (Array.isArray(errorData)) {
          // Zod validation errors
          const zodErrors: FormErrors = {};
          errorData.forEach((error: { path: string[]; message: string }) => {
            const field = error.path[0];
            zodErrors[field as keyof FormErrors] = error.message;
          });
          setErrors(zodErrors);
        } else {
          setErrors({
            general:
              errorData.message ||
              `Failed to ${isEditMode ? "update" : "create"} prompt`,
          });
        }
        setIsLoading(false);
        return;
      }

      await response.json();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} prompt:`,
        error
      );
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditMode ? "Edit Prompt" : "Create New Prompt"}
          </CardTitle>
          <CardDescription>
            Share your prompt with the community or keep it private
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={128}
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter prompt title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="description"
                name="description"
                type="text"
                maxLength={512}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of your prompt"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-700"
              >
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={10}
                maxLength={50000}
                value={formData.content}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm ${
                  errors.content ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your prompt content (supports plaintext or Markdown)"
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="categoryId"
                  className="text-sm font-medium text-gray-700"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.categoryId ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="visibility"
                  className="text-sm font-medium text-gray-700"
                >
                  Visibility <span className="text-red-500">*</span>
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  required
                  value={formData.visibility}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.visibility ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
                {errors.visibility && (
                  <p className="text-sm text-red-600">{errors.visibility}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Prompt"
                  : "Create Prompt"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
