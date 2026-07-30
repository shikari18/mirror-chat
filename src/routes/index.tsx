import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TopBar } from "@/components/TopBar";
import { Composer } from "@/components/Composer";
import { FormattedMessage } from "@/components/CodeBlock";
import { AuthModal } from "@/components/AuthModal";
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
import { fetchAIResponse, type Message } from "@/lib/ai-api";
import {
  loadThreads,
  getActiveThreadId,
  setActiveThreadId,
  updateThreadMessages,
  createNewThread,
  type ChatThread,
} from "@/lib/chat-threads";

const emptyCards = [
  { label: "Fan Cam", src: fanCam, prompt: "Create a fan cam video concept" },
  { label: "Space", src: space, prompt: "Describe a sci-fi space exploration scene" },
  { label: "Mermaid", src: mermaid, prompt: "Give me ideas for a magical underwater visual" },
  { label: "Boxer", src: boxer, prompt: "Generate a workout & athletic video prompt" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zuri AI — KAIDO Assistant" },
      {
        name: "description",
        content:
          "Chat with Zuri: ask anything, get instant answers, and switch to creative mode for images and video.",
      },
      { property: "og:title", content: "Zuri AI — KAIDO Assistant" },
      {
        property: "og:description",
        content: "Ask anything and get instant answers from Zuri AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatIndex,
});

function TypewriterText({
  text,
  speed = 12,
  animate = true,
}: {
  text: string;
  speed?: number;
  animate?: boolean;
}) {
  const [displayedLength, setDisplayedLength] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setDisplayedLength(text.length);
      return;
    }

    setDisplayedLength(0);
    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev + speed >= text.length) {
          clearInterval(interval);
          return text.length;
        }
        return prev + speed;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [text, speed, animate]);

  const currentText = text.slice(0, displayedLength);

  return (
    <div className="text-[15px] leading-relaxed">
      <FormattedMessage text={currentText} />
      {displayedLength < text.length && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-brand animate-pulse align-middle" />
      )}
    </div>
  );
}

export function ChatIndex() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeThreadId, setActiveThreadState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<"thinking..." | "Searching the web...">("thinking...");
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto open AuthModal on first launch if user is not signed in
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zuri_user");
      if (!stored) {
        setAuthOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Load active thread on mount
  useEffect(() => {
    const currentId = getActiveThreadId();
    const threads = loadThreads();

    if (currentId) {
      const active = threads.find((t) => t.id === currentId);
      if (active) {
        setActiveThreadState(active.id);
        setMessages(active.messages);
        return;
      }
    }

    // Default to fresh empty state if no active thread
    setActiveThreadState(null);
    setMessages([]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, generatingStatus]);

  const persistMessages = (next: Message[]) => {
    setMessages(next);
    let targetId = activeThreadId;

    if (!targetId) {
      const newThread = createNewThread(next);
      setActiveThreadState(newThread.id);
      targetId = newThread.id;
    } else {
      updateThreadMessages(targetId, next);
    }
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
    setActiveThreadState(null);
    setMessages([]);
    setAnimatingIndex(null);
  };

  const handleSelectThread = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    setActiveThreadState(thread.id);
    setMessages(thread.messages);
    setAnimatingIndex(null);
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isGenerating) return;

    const userMessage: Message = { role: "user", text: userText.trim() };
    const updatedWithUser = [...messages, userMessage];
    persistMessages(updatedWithUser);
    setIsGenerating(true);
    setGeneratingStatus("thinking...");

    try {
      const responseText = await fetchAIResponse(
        updatedWithUser,
        (status) => setGeneratingStatus(status)
      );
      const assistantMessage: Message = {
        role: "assistant",
        text: responseText,
      };
      const finalMessages = [...updatedWithUser, assistantMessage];
      setAnimatingIndex(finalMessages.length - 1);
      persistMessages(finalMessages);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        text: "Hey! 😊 I ran into a temporary connection bump, but I'm right here — what are you trying to work on?",
      };
      const finalMessages = [...updatedWithUser, errorMessage];
      setAnimatingIndex(finalMessages.length - 1);
      persistMessages(finalMessages);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <TopBar
        tab="chat"
        onMenu={() => setMenuOpen(true)}
        showEdit={messages.length > 0}
        onNewChat={handleNewChat}
      />

      <AppSidebar
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenSettings={() => {
          setMenuOpen(false);
          setSettingsOpen(true);
        }}
        onOpenAuth={() => setAuthOpen(true)}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
      />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      {messages.length === 0 ? (
        <main className="flex flex-1 flex-col justify-center gap-6 pb-24">
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
            <p className="text-sm text-muted-foreground">
              More creativity, more control - create stunning videos, graphics, and
              realistic photos with even more precision.
            </p>
            <button
              onClick={() => handleSend("Create a new video idea for me!")}
              className="rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try Now
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 space-y-6 px-4 pt-4 pb-28">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end my-3">
                <p className="max-w-[82%] rounded-3xl bg-[#2b2c32] px-4.5 py-3 text-[15px] text-white">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={i} className="my-3">
                <TypewriterText
                  text={m.text}
                  speed={12}
                  animate={i === animatingIndex}
                />
                <div className="mt-3 flex items-center gap-4 text-foreground/40">
                  <button
                    onClick={() => navigator.clipboard.writeText(m.text)}
                    aria-label="Copy text"
                    className="hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <Volume2 className="h-4 w-4 hover:text-foreground transition-colors" />
                  <span className="flex items-center">
                    <Repeat2 className="h-4 w-4 hover:text-foreground transition-colors" />
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                  <ThumbsUp className="h-4 w-4 hover:text-foreground transition-colors" />
                  <ThumbsDown className="h-4 w-4 hover:text-foreground transition-colors" />
                  <Ellipsis className="h-4 w-4 hover:text-foreground transition-colors" />
                </div>
              </div>
            )
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 py-2">
              <span className="thinking-shimmer text-base font-medium tracking-wide">
                {generatingStatus}
              </span>
            </div>
          )}

          <div ref={endRef} />
        </main>
      )}

      {/* Pinned Transparent Glass Composer Footer */}
      <footer className="sticky bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pt-2 pb-4 px-3">
        <Composer
          placeholder="Ask anything"
          onSend={(text) => handleSend(text)}
        />
      </footer>
    </div>
  );
}
