import { useNavigate } from "@tanstack/react-router";
import { Menu, SquarePen } from "lucide-react";

export function TopBar({
  tab,
  onMenu,
  onNewChat,
}: {
  tab: "chat" | "creative";
  onMenu: () => void;
  showEdit?: boolean;
  onNewChat?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-md">
      <button
        aria-label="Open menu"
        onClick={onMenu}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2/80 text-foreground hover:bg-surface-2 transition-colors border border-border/40"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        role="tablist"
        aria-label="Mode"
        className="flex items-center rounded-full bg-surface-2 p-1 border border-border/40"
      >
        {(["chat", "creative"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => navigate({ to: t === "chat" ? "/" : "/creative" })}
            className={`rounded-full px-5 py-2 text-sm capitalize transition-all ${
              tab === t
                ? "bg-primary font-medium text-primary-foreground shadow-sm"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        aria-label="New chat"
        onClick={onNewChat}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2/80 text-foreground hover:bg-surface-2 transition-colors border border-border/40"
      >
        <SquarePen className="h-5 w-5" />
      </button>
    </header>
  );
}
