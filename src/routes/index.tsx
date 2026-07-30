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
  Loader2,
  Repeat2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import fanCam from "@/assets/card-fancam.jpg";
import space from "@/assets/card-space.jpg";
import mermaid from "@/assets/card-mermaid.jpg";
import boxer from "@/assets/card-boxer.jpg";
import { fetchAIResponse, type Message } from "@/lib/ai-api";

const emptyCards = [
  { label: "Fan Cam", src: fanCam, prompt: "Create a fan cam video concept" },
  { label: "Space", src: space, prompt: "Describe a sci-fi space exploration scene" },
  { label: "Mermaid", src: mermaid, prompt: "Give me ideas for a magical underwater visual" },
  { label: "Boxer", src: boxer, prompt: "Generate a workout & athletic video prompt" },
];

export const Route = createFileRoute("/")({
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
  component: ChatIndex,
});

const STORAGE_KEY = "nova-chat-messages";

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

export function ChatIndex() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const persist = (next: Message[]) => {
    setMessages(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isGenerating) return;

    const userMessage: Message = { role: "user", text: userText.trim() };
    const updatedWithUser = [...messages, userMessage];
    persist(updatedWithUser);
    setIsGenerating(true);

    try {
      const responseText = await fetchAIResponse(updatedWithUser);
      const assistantMessage: Message = {
        role: "assistant",
        text: responseText,
      };
      persist([...updatedWithUser, assistantMessage]);
    } catch (err) {
      console.error(err);
      persist([
        ...updatedWithUser,
        {
          role: "assistant",
          text: "Sorry, I couldn't process your request right now. Please try again.",
        },
      ]);
    } finally {
      setIsGenerating(false);
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
              <button
                key={c.label}
                onClick={() => handleSend(c.prompt)}
                className="relative aspect-[3/4] w-[23%] overflow-hidden rounded-xl bg-surface transition-transform hover:scale-105"
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
              </button>
            ))}
          </div>
          <div className="space-y-3 px-6 text-center">
            <h1 className="text-xl font-semibold">The next era of video creation</h1>
            <p className="text-base text-muted-foreground">
              More creativity, more control - create stunning videos, graphics, and
              realistic photos with even more precision.
            </p>
            <button
              onClick={() => handleSend("Create a new video idea for me!")}
              className="rounded-full bg-primary px-7 py-2.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
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
                <p className="text-lg whitespace-pre-wrap leading-relaxed">{m.text}</p>
                <div className="mt-3 flex items-center gap-5 text-foreground/50">
                  <button
                    onClick={() => navigator.clipboard.writeText(m.text)}
                    aria-label="Copy text"
                    className="hover:text-foreground transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <Volume2 className="h-5 w-5 hover:text-foreground transition-colors" />
                  <span className="flex items-center">
                    <Repeat2 className="h-5 w-5 hover:text-foreground transition-colors" />
                    <ChevronDown className="h-4 w-4" />
                  </span>
                  <ThumbsUp className="h-5 w-5 hover:text-foreground transition-colors" />
                  <ThumbsDown className="h-5 w-5 hover:text-foreground transition-colors" />
                  <Ellipsis className="h-5 w-5 hover:text-foreground transition-colors" />
                </div>
              </div>
            )
          )}

          {isGenerating && (
            <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              <span className="text-base">Nova is thinking...</span>
            </div>
          )}

          <div ref={endRef} />
        </main>
      )}

      <footer className="px-3 pb-5">
        <Composer
          placeholder="Give me a task — Consider it done."
          onSend={(text) => handleSend(text)}
        />
      </footer>
    </div>
  );
}
