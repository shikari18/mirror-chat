import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, SquarePen } from "lucide-react";

export function TopBar({
  tab,
  onMenu,
  showEdit,
  onNewChat,
}: {
  tab: "chat" | "creative";
  onMenu: () => void;
  showEdit?: boolean;
  onNewChat?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 pt-5">
      <button
        aria-label="Open menu"
        onClick={onMenu}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        role="tablist"
        aria-label="Mode"
        className="flex items-center rounded-full bg-surface-2 p-1"
      >
        {(["chat", "creative"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => navigate({ to: t === "chat" ? "/" : "/creative" })}
            className={`rounded-full px-6 py-2.5 text-base capitalize transition-colors ${
              tab === t
                ? "bg-primary font-medium text-primary-foreground"
                : "text-foreground/90"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {showEdit ? (
        <button
          aria-label="New chat"
          onClick={onNewChat}
          className="shrink-0 px-2 text-foreground"
        >
          <SquarePen className="h-6 w-6" />
        </button>
      ) : (
        <Link
          to="/pro"
          className="shrink-0 rounded-full px-4 py-2.5 text-base font-medium text-brand-foreground"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          Get Pro
        </Link>
      )}
    </header>
  );
}
