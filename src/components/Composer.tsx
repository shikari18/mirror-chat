import { Mic, Plus } from "lucide-react";

export function Composer({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend?: (text: string) => void;
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
        >
          <Plus className="h-5 w-5" />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" aria-label="Voice input">
            <Mic className="h-6 w-6 text-foreground/80" />
          </button>
          <button
            type="submit"
            aria-label="Talk to assistant"
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundImage: "var(--gradient-voice)" }}
          >
            <span className="flex items-end gap-[3px]">
              {[10, 16, 20, 16, 10].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-primary-foreground"
                  style={{ height: h }}
                />
              ))}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
