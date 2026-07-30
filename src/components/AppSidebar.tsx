import { useState, useEffect, useRef } from "react";
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
  MoreVertical,
  Pin,
  PinOff,
} from "lucide-react";
import {
  loadThreads,
  setActiveThreadId,
  getActiveThreadId,
  deleteThread,
  togglePinThread,
  type ChatThread,
} from "@/lib/chat-threads";

export function AppSidebar({
  open,
  onOpenChange,
  onOpenSettings,
  onOpenAuth,
  onSelectThread,
  onNewChat,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenSettings: () => void;
  onOpenAuth?: () => void;
  onSelectThread?: (thread: ChatThread) => void;
  onNewChat?: () => void;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const activeId = getActiveThreadId();
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setThreads(loadThreads());
      setOpenMenuId(null);
      try {
        const stored = localStorage.getItem("zuri_user");
        if (stored) setUser(JSON.parse(stored));
      } catch {
        /* storage unavailable */
      }
    }
  }, [open]);

  // Handle global touch swipe to slide out/in sidebar
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchEnd - touchStartRef.current;

      // Swipe right from left edge opens sidebar
      if (!open && touchStartRef.current < 40 && diff > 60) {
        onOpenChange(true);
      }
      // Swipe left on open sidebar closes sidebar
      else if (open && diff < -60) {
        onOpenChange(false);
      }

      touchStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteThread(id);
    setThreads(loadThreads());
    setOpenMenuId(null);
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    togglePinThread(id);
    setThreads(loadThreads());
    setOpenMenuId(null);
  };

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88%] max-w-sm overflow-y-auto border-border bg-background p-0 [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="px-5 pt-4 pb-6">
          <button
            onClick={() => {
              onOpenChange(false);
              onOpenAuth?.();
            }}
            className="flex w-full items-center gap-3 rounded-2xl p-2.5 hover:bg-surface transition-colors text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold text-foreground">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5 text-foreground/70" />}
            </span>
            <div className="flex-1 min-w-0">
              <span className="block truncate text-lg font-semibold">
                {user ? user.name || user.email.split("@")[0] : "Sign in / Register"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user ? user.email : "Tap to log in or create account"}
              </span>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-foreground/60" />
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
                const isMenuOpen = openMenuId === t.id;

                return (
                  <div key={t.id} className="relative">
                    <div
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
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-base">{t.title}</span>
                        {t.pinned && (
                          <Pin className="h-3.5 w-3.5 text-brand shrink-0 rotate-45" />
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : t.id);
                        }}
                        aria-label="Options"
                        className="p-1 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 3-Dot Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-11 z-50 w-48 overflow-hidden rounded-xl border border-border bg-[#18191e] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                      >
                        <button
                          onClick={(e) => handleTogglePin(e, t.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-2 transition-colors text-left"
                        >
                          {t.pinned ? (
                            <>
                              <PinOff className="h-4 w-4 text-brand shrink-0" />
                              <span>Unmark conversation</span>
                            </>
                          ) : (
                            <>
                              <Pin className="h-4 w-4 text-brand shrink-0" />
                              <span>Mark conversation</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, t.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          <span>Delete conversation</span>
                        </button>
                      </div>
                    )}
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
