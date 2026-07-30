import type { Message } from "./ai-api";

export type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
};

function getActiveUserEmail(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = localStorage.getItem("zuri_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email) return parsed.email.toLowerCase().trim();
    }
  } catch {
    /* ignore */
  }
  return "guest";
}

function getThreadsKey(): string {
  return `zuri_threads_v3_${getActiveUserEmail()}`;
}

function getActiveThreadKey(): string {
  return `zuri_active_thread_v3_${getActiveUserEmail()}`;
}

export function generateSmartTitle(userText: string): string {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // Clean prompt-based titles
  if (/(akaza|tanjiro|demon slayer)/i.test(lower)) {
    return "Akaza vs Tanjiro";
  }
  if (/(fastest thing|fastest animal|speed)/i.test(lower)) {
    return "The Fastest Thing Alive";
  }
  if (/(dog|puppy|bingo|story)/i.test(lower)) {
    return "The Dog Story";
  }
  if (/(system prompt|claude|prompt engineering)/i.test(lower)) {
    return "System Prompt Guide";
  }
  if (/(html|code|website|sample)/i.test(lower)) {
    return "HTML Sample Code";
  }
  if (/^(hey|heyy|hello|hi|sup|yo)\b/i.test(lower)) {
    return "Casual Greeting";
  }

  // Capitalize first 4-5 words nicely
  const words = trimmed.split(/\s+/).slice(0, 5).join(" ");
  const cleanTitle = words.charAt(0).toUpperCase() + words.slice(1);
  return cleanTitle.length > 32 ? cleanTitle.slice(0, 30) + "..." : cleanTitle;
}

export function loadThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getThreadsKey());
    return raw ? (JSON.parse(raw) as ChatThread[]) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getThreadsKey(), JSON.stringify(threads));
  } catch {
    /* storage unavailable */
  }
}

export function getActiveThreadId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getActiveThreadKey());
}

export function setActiveThreadId(id: string | null): void {
  if (typeof window === "undefined") return;
  const key = getActiveThreadKey();
  if (id) {
    localStorage.setItem(key, id);
  } else {
    localStorage.removeItem(key);
  }
}

export function createNewThread(initialMessages: Message[] = []): ChatThread {
  const firstUserMsg = initialMessages.find((m) => m.role === "user");
  const title = firstUserMsg ? generateSmartTitle(firstUserMsg.text) : "New Chat";

  const newThread: ChatThread = {
    id: `thread_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    messages: initialMessages,
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const threads = loadThreads();
  const updated = [newThread, ...threads];
  saveThreads(updated);
  setActiveThreadId(newThread.id);
  return newThread;
}

export function updateThreadMessages(id: string, messages: Message[]): void {
  const threads = loadThreads();
  const index = threads.findIndex((t) => t.id === id);

  if (index === -1) {
    if (messages.length > 0) {
      createNewThread(messages);
    }
    return;
  }

  const firstUserMsg = messages.find((m) => m.role === "user");
  const title = firstUserMsg ? generateSmartTitle(firstUserMsg.text) : threads[index].title;

  threads[index] = {
    ...threads[index],
    title,
    messages,
    updatedAt: Date.now(),
  };

  if (!threads[index].pinned) {
    const [updatedThread] = threads.splice(index, 1);
    threads.unshift(updatedThread);
  }

  saveThreads(threads);
}

export function togglePinThread(id: string): void {
  const threads = loadThreads();
  const index = threads.findIndex((t) => t.id === id);
  if (index !== -1) {
    threads[index].pinned = !threads[index].pinned;
    saveThreads(threads);
  }
}

export function deleteThread(id: string): void {
  const threads = loadThreads().filter((t) => t.id !== id);
  saveThreads(threads);
  if (getActiveThreadId() === id) {
    setActiveThreadId(threads[0]?.id || null);
  }
}
