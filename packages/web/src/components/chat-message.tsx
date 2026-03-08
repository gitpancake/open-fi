"use client";

import type { UIMessage } from "ai";
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { User, Sparkles, Wrench } from "lucide-react";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const textParts = message.parts?.filter(
    (part): part is { type: "text"; text: string } => part.type === "text"
  );
  const toolParts = message.parts?.filter(
    (part) => part.type.startsWith("tool-") || part.type === "dynamic-tool"
  );

  const text = textParts?.map((p) => p.text).join("") ?? "";

  if (!text && !toolParts?.length && !isUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </div>

      {/* Content */}
      <div className={cn("max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
        {/* Tool invocation badges */}
        {toolParts?.map((part, i) => {
          const toolName = "toolName" in part ? (part as { toolName: string }).toolName : part.type.replace("tool-", "");
          const state = "state" in part ? (part as { state: string }).state : "";
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Wrench className="h-3 w-3" />
              <span>{formatToolName(toolName)}</span>
              {state === "input-streaming" && (
                <span className="ml-1 inline-flex gap-0.5">
                  <span className="animate-bounce-dot h-1 w-1 rounded-full bg-muted-foreground" />
                  <span className="animate-bounce-dot animation-delay-150 h-1 w-1 rounded-full bg-muted-foreground" />
                  <span className="animate-bounce-dot animation-delay-300 h-1 w-1 rounded-full bg-muted-foreground" />
                </span>
              )}
            </div>
          );
        })}

        {/* Message bubble */}
        {text && (
          <div
            className={cn(
              "rounded-2xl text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground px-4 py-2.5"
                : "text-foreground"
            )}
          >
            {isUser ? (
              <span className="whitespace-pre-wrap">{text}</span>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-pre:my-2 prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-['']">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function formatToolName(name: string): string {
  return name
    .replace(/^get_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
