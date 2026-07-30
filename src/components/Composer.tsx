import { useState } from "react";
import {
  ArrowUp,
  AudioLines,
  Image as ImageIcon,
  Mic,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

export function Composer({
  placeholder,
  onSend,
  variant = "chat",
  modelLabel,
  toolLabel = "Nano Banana Pro",
}: {
  placeholder: string;
  onSend?: (text: string) => void;
  variant?: "chat" | "creative";
  modelLabel?: string;
  toolLabel?: string;
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
      className={`rounded-3xl p-4 transition-all duration-200 bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl ${
        variant === "creative" ? "bg-black/80" : ""
      }`}
    >
      <input
        name="message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70"
        placeholder={placeholder}
        aria-label="Message"
      />
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Add attachment"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2/80 hover:bg-surface-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>

        {variant === "creative" ? (
          <>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-surface-2/80 px-4 py-2 text-sm"
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </button>
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-full bg-surface-2/80 px-3.5 py-2 text-xs"
            >
              {toolLabel}
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <button type="button" aria-label="Settings">
                <SlidersHorizontal className="h-5 w-5 text-foreground/80" />
              </button>
              <button
                type="submit"
                aria-label="Send"
                disabled={!hasText}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  hasText
                    ? "bg-white text-black scale-105 shadow-md"
                    : "bg-surface-2 text-foreground/40 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            {modelLabel ? (
              <button
                type="button"
                className="rounded-full bg-surface-2/80 px-4 py-2 text-sm"
              >
                {modelLabel}
              </button>
            ) : null}
            <div className="ml-auto flex items-center gap-3">
              <button type="button" aria-label="Voice input">
                <Mic className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
              </button>

              {hasText ? (
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold transition-all transform active:scale-95 shadow-lg"
                >
                  <ArrowUp className="h-5 w-5 text-black stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Voice waveform"
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundImage: "var(--gradient-voice)" }}
                >
                  <AudioLines className="h-5 w-5 text-brand-foreground" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
