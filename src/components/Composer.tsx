import { useState } from "react";
import {
  ArrowUp,
  AudioLines,
  Mic,
  Plus,
} from "lucide-react";

export function Composer({
  placeholder = "Ask anything",
  onSend,
  variant = "chat",
}: {
  placeholder?: string;
  onSend?: (text: string) => void;
  variant?: "chat" | "creative";
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend?.(text.trim());
      setText("");
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/15 px-3.5 py-2.5 shadow-2xl transition-all duration-200 ${
        variant === "creative" ? "bg-black/50" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Add attachment"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-surface-2 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </button>

      <input
        name="message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 px-1"
        placeholder={placeholder}
        aria-label="Message"
      />

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="Voice input"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:text-foreground transition-colors"
        >
          <Mic className="h-5 w-5" />
        </button>

        {hasText ? (
          <button
            type="submit"
            aria-label="Send message"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-bold transition-transform active:scale-95 shadow-md"
          >
            <ArrowUp className="h-5 w-5 text-black stroke-[2.5]" />
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Voice mode"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-white transition-transform active:scale-95 shadow-md hover:bg-blue-600"
          >
            <AudioLines className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
