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
} from "lucide-react";

export function AppSidebar({
  open,
  onOpenChange,
  onOpenSettings,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenSettings: () => void;
}) {
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
            <span className="text-lg font-semibold">Emmanuel</span>
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
                placeholder="Search"
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
            <Link
              to="/chat"
              onClick={() => onOpenChange(false)}
              aria-label="New chat"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface"
            >
              <SquarePen className="h-5 w-5" />
            </Link>
          </div>

          <Section title="Projects" />
          <Row icon={<Plus className="h-4 w-4" />} label="New Project" />
          <Section title="Assistants" />
          <Row icon={<Plus className="h-4 w-4" />} label="Create an Assistant" />
          <p className="mt-3 pl-10 text-base italic text-muted-foreground">
            Explore all assistants →
          </p>
          <Section title="Chat History" />

          <div className="mt-16 flex flex-col items-center">
            <MessageSquare className="h-8 w-8 text-foreground/25" />
            <p className="mt-4 text-base text-muted-foreground">
              There is no chat history here.
            </p>
            <Link
              to="/chat"
              onClick={() => onOpenChange(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Start new chat
            </Link>
          </div>
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
