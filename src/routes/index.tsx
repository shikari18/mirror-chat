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

// Original 4 Card Assets
import fanCam from "@/assets/card-fancam.jpg";
import space from "@/assets/card-space.jpg";
import mermaid from "@/assets/card-mermaid.jpg";
import boxer from "@/assets/card-boxer.jpg";

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
  const abortControllerRef = useRef<AbortController | null>(null);

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
    handleStop();
    setActiveThreadId(null);
    setActiveThreadState(null);
    setMessages([]);
    setAnimatingIndex(null);
  };

  const handleSelectThread = (thread: ChatThread) => {
    handleStop();
    setActiveThreadId(thread.id);
    setActiveThreadState(thread.id);
    setMessages(thread.messages);
    setAnimatingIndex(null);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleSend = async (userText: string, image?: string) => {
    if ((!userText.trim() && !image) || isGenerating) return;

    const userMessage: Message = { role: "user", text: userText.trim(), image };
    const updatedWithUser = [...messages, userMessage];
    persistMessages(updatedWithUser);
    setIsGenerating(true);
    setGeneratingStatus("thinking...");

    abortControllerRef.current = new AbortController();

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
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
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
      abortControllerRef.current = null;
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
        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-28 text-center">
          {/* Restored Original 4 Rotated UI Cards */}
          <div className="relative mb-6 flex h-40 w-full max-w-xs items-center justify-center">
            <img
              src={fanCam}
              alt="Card FanCam"
              className="absolute left-4 top-2 h-28 w-20 rotate-[-12deg] rounded-xl object-cover shadow-lg border border-white/10"
            />
            <img
              src={space}
              alt="Card Space"
              className="absolute left-16 top-0 h-32 w-22 rotate-[-4deg] rounded-xl object-cover shadow-xl border border-white/10"
            />
            <img
              src={mermaid}
              alt="Card Mermaid"
              className="absolute right-16 top-0 h-32 w-22 rotate-[4deg] rounded-xl object-cover shadow-xl border border-white/10"
            />
            <img
              src={boxer}
              alt="Card Boxer"
              className="absolute right-4 top-2 h-28 w-20 rotate-[12deg] rounded-xl object-cover shadow-lg border border-white/10"
            />
          </div>

          <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Generate high-quality videos, graphics, and realistic photos with even more precision.
          </p>

          <button
            onClick={() => handleSend("Tell me what you can do!")}
            className="mt-4 rounded-full bg-foreground px-6 py-2 text-[13px] font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Try Now
          </button>
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
          isGenerating={isGenerating}
          onSend={(text, image) => handleSend(text, image)}
          onStop={handleStop}
        />
      </footer>
    </div>
  );
}
