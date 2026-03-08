import type { UIMessage } from "ai";
import { cn } from "~/lib/utils";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const textParts = message.parts?.filter(
    (part): part is { type: "text"; text: string } => part.type === "text"
  );

  const text = textParts?.map((p) => p.text).join("") ?? "";

  if (!text && !isUser) return null;

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}
