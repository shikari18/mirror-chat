import { ArrowUp, Image as ImageIcon, Mic, Plus, SlidersHorizontal } from "lucide-react";

export function Composer({
  placeholder,
  onSend,
  variant = "chat",
  modelLabel = "GPT-4.1 Mini",
  toolLabel = "Nano Banana Pro",
}: {
  placeholder: string;
  onSend?: (text: string) => void;
  variant?: "chat" | "creative";
  modelLabel?: string;
  toolLabel?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
        if (input.value.trim()) {
          onSend?.(input.value.trim());
          input.value = "";
        }
      }}
      className="rounded-3xl bg-surface p-4"
    >
      <input
        name="message"
        className="w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
        placeholder={placeholder}
        aria-label="Message"
      />
      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          aria-label="Add attachment"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2"
        >
          <Plus className="h-5 w-5" />
        </button>

        {variant === "creative" ? (
          <>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-base"
            >
              <ImageIcon className="h-5 w-5" />
              Image
            </button>
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-full bg-surface-2 px-3.5 py-2 text-sm"
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className="rounded-full bg-surface-2 px-4 py-2 text-base"
            >
              {modelLabel}
            </button>
            <div className="ml-auto flex items-center gap-3">
              <button type="button" aria-label="Voice input">
                <Mic className="h-6 w-6 text-foreground/80" />
              </button>
              <button
                type="submit"
                aria-label="Send message"
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundImage: "var(--gradient-voice)" }}
              >
                <ArrowUp className="h-5 w-5 text-brand-foreground" />
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
