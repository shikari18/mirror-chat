import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Settings,
  SquarePen,
  Plus,
  MessageSquare,
  User,
  Trash2,
} from "lucide-react";
import {
  loadThreads,
  setActiveThreadId,
  getActiveThreadId,
  deleteThread,
  type ChatThread,
} from "@/lib/chat-threads";

export function AppSidebar({
  open,
  onOpenChange,
  onOpenSettings,
  onSelectThread,
  onNewChat,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenSettings: () => void;
  onSelectThread?: (thread: ChatThread) => void;
  onNewChat?: () => void;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const activeId = getActiveThreadId();

  useEffect(() => {
    if (open) {
      setThreads(loadThreads());
    }
  }, [open]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteThread(id);
    setThreads(loadThreads());
  };

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88%] max-w-sm overflow-y-auto border-border bg-background p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="px-5 pt-4 pb-6">
          <button className="flex w-full items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2">
              <User className="h-5 w-5 text-foreground/70" />
            </span>
            <span className="text-lg font-semibold">User</span>
            <ChevronRight className="ml-auto h-5 w-5 text-foreground/60" />
          </button>

          <Link
            to="/pro"
            onClick={() => onOpenChange(false)}
            className="mt-5 flex items-center gap-3 rounded-full p-3 pl-5"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            <span className="text-sm leading-tight text-brand-foreground">
              Get the full experience and enjoy{" "}
              <strong className="font-bold">unlimited access!</strong>
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-surface-2/80 px-4 py-2.5 text-sm font-semibold text-foreground">
              Get Pro
            </span>
          </Link>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-surface px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                aria-label="Search"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              aria-label="Settings"
              onClick={onOpenSettings}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              aria-label="New chat"
              onClick={() => {
                onNewChat?.();
                onOpenChange(false);
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface"
            >
              <SquarePen className="h-5 w-5" />
            </button>
          </div>

          <Section title="Projects" />
          <Row icon={<Plus className="h-4 w-4" />} label="New Project" />
          <Section title="Assistants" />
          <Row icon={<Plus className="h-4 w-4" />} label="Create an Assistant" />
          <p className="mt-3 pl-10 text-base italic text-muted-foreground">
            Explore all assistants →
          </p>

          <Section title="Recent Chats" />

          {filteredThreads.length > 0 ? (
            <div className="mt-3 space-y-1">
              {filteredThreads.map((t) => {
                const isActive = t.id === activeId;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveThreadId(t.id);
                      onSelectThread?.(t);
                      onOpenChange(false);
                    }}
                    className={`group flex items-center justify-between rounded-xl px-3 py-3 text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-surface-2 text-foreground font-medium"
                        : "hover:bg-surface/70 text-foreground/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-base">{t.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, t.id)}
                      aria-label="Delete chat"
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-base text-muted-foreground">
                There is no chat history here.
              </p>
              <button
                onClick={() => {
                  onNewChat?.();
                  onOpenChange(false);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Start new chat
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      <ChevronDown className="h-5 w-5 text-foreground/60" />
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="mt-3 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2">
        {icon}
      </span>
      <span className="text-base">{label}</span>
    </button>
  );
}
