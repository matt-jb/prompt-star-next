import { Badge } from "@/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { TPrompts } from "server/queries/prompt.queries";

type PromptCardProps = {
  prompt: TPrompts[number];
};

export const PromptCard = ({ prompt }: PromptCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{prompt.title}</CardTitle>
        <CardDescription>{prompt.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{prompt.content}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <p>Author: {prompt.author?.name}</p>

        <div className="flex items-center gap-2">
          <Badge>{prompt.category?.name}</Badge>
          <span>Votes: {prompt._count.votes}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
