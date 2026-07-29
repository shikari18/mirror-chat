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
import fanCam from "@/assets/card-fancam.jpg";
import space from "@/assets/card-space.jpg";
import mermaid from "@/assets/card-mermaid.jpg";
import boxer from "@/assets/card-boxer.jpg";

const emptyCards = [
  { label: "Fan Cam", src: fanCam },
  { label: "Space", src: space },
  { label: "Mermaid", src: mermaid },
  { label: "Boxer", src: boxer },
];

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
        showEdit={messages.length > 0}
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

      {messages.length === 0 ? (
        <main className="flex flex-1 flex-col justify-center gap-6 pb-4">
          <div className="flex items-end justify-center gap-2 px-3">
            {emptyCards.map((c, i) => (
              <div
                key={c.label}
                className="relative aspect-[3/4] w-[23%] overflow-hidden rounded-xl bg-surface"
                style={{ transform: `rotate(${(i - 1.5) * 2}deg)` }}
              >
                <img
                  src={c.src}
                  alt={c.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-sm text-primary">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-3 px-6 text-center">
            <h1 className="text-xl font-semibold">The next era of video creation</h1>
            <p className="text-base text-muted-foreground">
              More creativity, more control - create stunning videos, graphics, and
              realistic photos with even more precision.
            </p>
            <button className="rounded-full bg-primary px-7 py-2.5 text-base font-medium text-primary-foreground">
              Try Now
            </button>
          </div>
        </main>
      ) : (
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
      )}

      <footer className="px-3 pb-5">
        <Composer
          placeholder="Give me a task — Consider it done."
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
