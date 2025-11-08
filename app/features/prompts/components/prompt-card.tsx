"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { TPrompts } from "server/queries/prompt.queries";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

type PromptCardProps = {
  prompt: TPrompts[number];
  session: Session | null;
};

export const PromptCard = ({ prompt, session }: PromptCardProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const isAuthor = session?.user?.id === prompt.author?.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete prompt");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      alert("Failed to delete prompt. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle>{prompt.title}</CardTitle>
            <CardDescription>{prompt.description}</CardDescription>
          </div>
          {isAuthor && (
            <div className="flex gap-2 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/edit/${prompt.id}`)}
              >
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this prompt? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p>{prompt.content}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <p>Author: {prompt.author?.username ?? "Unknown User"}</p>

        <div className="flex items-center gap-2">
          <Badge>{prompt.category?.name}</Badge>
          <span>Votes: {prompt._count.votes}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
