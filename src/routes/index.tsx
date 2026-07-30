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
  Globe,
  ImageIcon,
  SquarePen,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import { fetchAIResponse, type Message } from "@/lib/ai-api";
import {
  loadThreads,
  getActiveThreadId,
  setActiveThreadId,
  updateThreadMessages,
  createNewThread,
  type ChatThread,
} from "@/lib/chat-threads";

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
    <div className="text-[14px] leading-relaxed">
      <FormattedMessage text={currentText} />
      {displayedLength < text.length && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-brand animate-pulse align-middle" />
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

  const handleSend = async (userText: string, image?: string) => {
    if ((!userText.trim() && !image) || isGenerating) return;

    const userMessage: Message = { role: "user", text: userText.trim(), image };
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
        text: "I'm right here! 😊 Ran into a quick network delay — click the Retry button below to try again!",
      };
      const finalMessages = [...updatedWithUser, errorMessage];
      setAnimatingIndex(finalMessages.length - 1);
      persistMessages(finalMessages);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = async () => {
    if (isGenerating || messages.length === 0) return;
    const userMessagesOnly = messages.filter((_, i) => !(i === messages.length - 1 && messages[i].role === "assistant"));
    setIsGenerating(true);
    setGeneratingStatus("thinking...");

    try {
      const responseText = await fetchAIResponse(
        userMessagesOnly,
        (status) => setGeneratingStatus(status)
      );
      const assistantMessage: Message = {
        role: "assistant",
        text: responseText,
      };
      const finalMessages = [...userMessagesOnly, assistantMessage];
      setAnimatingIndex(finalMessages.length - 1);
      persistMessages(finalMessages);
    } catch {
      /* ignore */
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
        <main className="flex flex-1 flex-col justify-center px-6 pb-28 space-y-4">
          <div className="space-y-3.5 max-w-sm mx-auto w-full">
            <button
              onClick={() => handleSend("Generate an image of a futuristic neon city skyline")}
              className="flex w-full items-center gap-3.5 rounded-2xl bg-surface/60 border border-border/40 p-4 text-left transition-colors hover:bg-surface"
            >
              <ImageIcon className="h-5 w-5 text-purple-400 shrink-0" />
              <span className="text-[14.5px] font-medium text-foreground">Create an image</span>
            </button>

            <button
              onClick={() => handleSend("Write a creative story or edit my text")}
              className="flex w-full items-center gap-3.5 rounded-2xl bg-surface/60 border border-border/40 p-4 text-left transition-colors hover:bg-surface"
            >
              <SquarePen className="h-5 w-5 text-blue-400 shrink-0" />
              <span className="text-[14.5px] font-medium text-foreground">Write or edit</span>
            </button>

            <button
              onClick={() => handleSend("Search the web for current news and updates")}
              className="flex w-full items-center gap-3.5 rounded-2xl bg-surface/60 border border-border/40 p-4 text-left transition-colors hover:bg-surface"
            >
              <Globe className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-[14.5px] font-medium text-foreground">Search the web</span>
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 space-y-5 px-4 pt-4 pb-28">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex flex-col items-end my-2.5 space-y-2">
                {m.image && (
                  <img
                    src={m.image}
                    alt="Uploaded attachment"
                    className="max-h-60 max-w-[80%] rounded-2xl border border-white/20 shadow-md object-cover"
                  />
                )}
                {m.text && (
                  <p className="max-w-[82%] rounded-3xl bg-[#2b2c32] px-4 py-2.5 text-[14px] text-white">
                    {m.text}
                  </p>
                )}
              </div>
            ) : (
              <div key={i} className="my-2.5">
                <TypewriterText
                  text={m.text}
                  speed={12}
                  animate={i === animatingIndex}
                />
                <div className="mt-2.5 flex items-center gap-3.5 text-foreground/40">
                  <button
                    onClick={() => navigator.clipboard.writeText(m.text)}
                    aria-label="Copy text"
                    className="hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <Volume2 className="h-4 w-4 hover:text-foreground transition-colors" />
                  <button
                    onClick={handleRetry}
                    aria-label="Regenerate response"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <ThumbsUp className="h-4 w-4 hover:text-foreground transition-colors" />
                  <ThumbsDown className="h-4 w-4 hover:text-foreground transition-colors" />
                  <Ellipsis className="h-4 w-4 hover:text-foreground transition-colors" />
                </div>
              </div>
            )
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 py-1">
              <span className="thinking-shimmer text-[14px] font-medium tracking-wide">
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
          onSend={(text, image) => handleSend(text, image)}
        />
      </footer>
    </div>
  );
}
