import type { Message } from "./ai-api";

export type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
};

const THREADS_KEY = "zuri_chat_threads_v2";
const ACTIVE_THREAD_KEY = "zuri_active_thread_id_v2";

export function generateSmartTitle(userText: string): string {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  if (/^(hey|heyy|hello|hi|sup|yo|good morning|good evening|how far)\b/i.test(lower)) {
    return "Casual Greeting";
  }
  if (/(code|react|component|function|bug|error|js|ts|python|html|css)/i.test(lower)) {
    return "Code & Development";
  }
  if (/(video|image|photo|fan cam|design|creative|prompt|studio)/i.test(lower)) {
    return "Creative & Visual Concept";
  }
  if (/(who won|champions league|match|score|football|messi|ronaldo)/i.test(lower)) {
    return "Sports & Match Breakdown";
  }

  return trimmed.slice(0, 30) + (trimmed.length > 30 ? "..." : "");
}

export function loadThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? (JSON.parse(raw) as ChatThread[]) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch {
    /* storage unavailable */
  }
}

export function getActiveThreadId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_THREAD_KEY);
}

export function setActiveThreadId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(ACTIVE_THREAD_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_THREAD_KEY);
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

  // Move updated thread to top unless pinned
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
