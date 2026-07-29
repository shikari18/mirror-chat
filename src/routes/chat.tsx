import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TopBar } from "@/components/TopBar";
import { Composer } from "@/components/Composer";
import {
  ChevronDown,
  Copy,
  Ellipsis,
  Repeat2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Nova AI Assistant" },
      {
        name: "description",
        content:
          "Chat with Nova AI: ask anything, get instant answers, and switch to creative mode for images and video.",
      },
      { property: "og:title", content: "Chat — Nova AI Assistant" },
      {
        property: "og:description",
        content: "Ask anything and get instant answers from Nova AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chat,
});

type Msg = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "nova-chat-messages";

function loadMessages(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Msg[]) : [];
  } catch {
    return [];
  }
}

function Chat() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const persist = (next: Msg[]) => {
    setMessages(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopBar
        tab="chat"
        onMenu={() => setMenuOpen(true)}
        showEdit
        onNewChat={() => persist([])}
      />

      <AppSidebar
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenSettings={() => {
          setMenuOpen(false);
          setSettingsOpen(true);
        }}
      />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

      <main className="flex-1 space-y-5 px-4 py-6">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] rounded-3xl bg-surface px-5 py-3 text-lg">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i}>
              <p className="text-lg">{m.text}</p>
              <div className="mt-3 flex items-center gap-5 text-foreground/50">
                <Copy className="h-5 w-5" />
                <Volume2 className="h-5 w-5" />
                <span className="flex items-center">
                  <Repeat2 className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </span>
                <ThumbsUp className="h-5 w-5" />
                <ThumbsDown className="h-5 w-5" />
                <Ellipsis className="h-5 w-5" />
              </div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </main>

      <footer className="px-3 pb-5">
        <Composer
          placeholder="Ask anything"
          onSend={(text) =>
            persist([
              ...messages,
              { role: "user", text },
              { role: "assistant", text: "Got it — let me work on that. 😊" },
            ])
          }
        />
      </footer>
    </div>
  );
}
