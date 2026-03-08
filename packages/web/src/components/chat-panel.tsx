"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { ChatMessage } from "~/components/chat-message";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SUGGESTIONS = [
  "Where is my dog?",
  "How many steps today?",
  "How did she sleep?",
  "Collar status",
];

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleTextareaInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function handleSuggestion(text: string) {
    sendMessage({ text });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="mx-auto max-w-2xl space-y-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center gap-4 pt-24 text-center"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Ask about your dog
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Get real-time info about location, activity, sleep, and more.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Streaming indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <div className="flex gap-1">
                  <span className="animate-bounce-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span className="animate-bounce-dot animation-delay-150 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span className="animate-bounce-dot animation-delay-300 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border bg-muted/30 p-2 transition-colors focus-within:border-ring/50 focus-within:bg-muted/50"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTextareaInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your dog..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-8 w-8 shrink-0 rounded-xl"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
