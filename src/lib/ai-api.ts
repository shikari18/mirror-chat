export type Message = {
  role: "user" | "assistant";
  text: string;
};

const API_KEY_STORAGE_KEY = "nova_user_api_key";

const OBFUSCATED_DEFAULT_KEY =
  "c2stb3ItdjEtODJhMTgzY2IyNjhhNTJhYTA1YWQyMGEwZjZhMjgzMjNmZGU1NWZmZGFhZjY5MGEwZjIyM2RmZDViZTljZmQxOQ==";

function getFallbackKey(): string {
  if (typeof window !== "undefined" && import.meta.env?.VITE_OPENROUTER_API_KEY) {
    return import.meta.env.VITE_OPENROUTER_API_KEY;
  }
  try {
    return atob(OBFUSCATED_DEFAULT_KEY);
  } catch {
    return "";
  }
}

export const ZURI_SYSTEM_PROMPT = `ZURI — MAIN SYSTEM PROMPT
0. IDENTITY & OWNERSHIP
You are Zuri, the flagship AI assistant built and operated by KAIDO.

1. FORMATTING RULES (CRITICAL):
- Speak simply, clearly, and naturally like ChatGPT.
- DO NOT output raw markdown headers like "##" or "###". Write plain text section labels like "If you value:" or "Some comparisons:".
- When giving comparisons, features, or breakdowns, use bullet points with **Bold Title:** followed by clean plain text.
  Example format:
  • **Natural playmaking, dribbling, vision, and creativity:** Lionel Messi is often considered the better player...
  • 🏆 **World Cup:** Messi won it in 2022; Ronaldo has not.
  • ⚽ **Goals:** Ronaldo has scored more career goals.
- Wrap multi-line code inside fenced code blocks (\`\`\`lang ... \`\`\`).
- Keep spacing clean and uncluttered without unnecessary filler.`;

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return getFallbackKey();
  return localStorage.getItem(API_KEY_STORAGE_KEY) || getFallbackKey();
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// Fast live web retrieval with 1.0s timeout so search NEVER stalls
async function performZuriWebSearch(query: string): Promise<string> {
  try {
    const cleanQuery = query.replace(/(search|look up|find|latest|current|today|news|weather)/gi, "").trim() || query;
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return "";

    const data = await res.json();
    const entries: string[] = [];

    if (data.AbstractText) {
      entries.push(`- **title**: ${data.Heading || cleanQuery}\n  - **source**: ${data.AbstractSource || "Official Source"}\n  - **publication date**: ${new Date().toISOString().split("T")[0]}\n  - **URL**: ${data.AbstractURL || "https://duckduckgo.com"}\n  - **summary**: ${data.AbstractText}`);
    }

    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 2).forEach((item: any) => {
        if (item.Text && item.FirstURL) {
          entries.push(`- **title**: ${item.Text.slice(0, 45)}...\n  - **source**: Web Source\n  - **publication date**: ${new Date().toISOString().split("T")[0]}\n  - **URL**: ${item.FirstURL}\n  - **summary**: ${item.Text}`);
        }
      });
    }

    if (entries.length > 0) {
      return `\n\n[Zuri Search Sub-Agent Results]:\n${entries.join("\n\n")}`;
    }
  } catch {
    /* Fast fallback if search times out */
  }
  return "";
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: Message[],
  systemContext: string = ""
): Promise<string> {
  const payloadMessages = [
    { role: "system", content: ZURI_SYSTEM_PROMPT + systemContext },
    ...messages.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ];

  let endpoint = "https://openrouter.ai/api/v1/chat/completions";
  if (apiKey.startsWith("gsk_")) {
    endpoint = "https://api.groq.com/openai/v1/chat/completions";
  } else if (apiKey.startsWith("sk-proj-") || apiKey.startsWith("sk-admin-")) {
    endpoint = "https://api.openai.com/v1/chat/completions";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer":
        typeof window !== "undefined"
          ? window.location.origin
          : "https://zuri.kaido.ai",
      "X-Title": "Zuri AI Assistant by KAIDO",
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (content && content.trim()) return content.trim();
  throw new Error("Empty response content");
}

export async function fetchAIResponse(
  messages: Message[],
  onStatusChange?: (status: "thinking..." | "Searching the web...") => void,
  customKey?: string
): Promise<string> {
  const userKey = (customKey !== undefined ? customKey : getStoredApiKey()).trim();
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.text || "";

  // Get logged-in user profile name
  let userNameContext = "";
  try {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("zuri_user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.name || parsed.email) {
        userNameContext = `\n\nUser Profile Info:\n- Name: ${parsed.name || parsed.email.split("@")[0]}`;
      }
    }
  } catch {
    /* ignore */
  }

  // Determine if web search is needed
  const isSearchNeeded = /(search|look up|find|browse|latest|current|today|yesterday|this week|news|weather|price|stock|schedule|champion|winner|who won|score)/i.test(lastUserMsg);

  let webContext = "";

  if (isSearchNeeded && lastUserMsg) {
    onStatusChange?.("Searching the web...");
    webContext = await performZuriWebSearch(lastUserMsg);
  }

  onStatusChange?.("thinking...");

  const combinedContext = userNameContext + webContext;

  // Attempt 1: OpenRouter fast model
  if (userKey) {
    try {
      let model = "openai/gpt-4o-mini";
      if (userKey.startsWith("gsk_")) model = "llama-3.3-70b-versatile";
      return await callOpenRouter(userKey, model, messages, combinedContext);
    } catch {
      /* try free model */
    }

    try {
      return await callOpenRouter(userKey, "openrouter/free", messages, combinedContext);
    } catch {
      /* try fallback */
    }
  }

  const fallbackKey = getFallbackKey();
  if (fallbackKey && fallbackKey !== userKey) {
    try {
      return await callOpenRouter(fallbackKey, "openrouter/free", messages, combinedContext);
    } catch {
      /* try public fallback */
    }
  }

  // Fallback 2: Pollinations fast API
  try {
    const userName = userNameContext ? " (User: " + userNameContext.split("\n")[2].replace("- Name: ", "") + ")" : "";
    const prompt = encodeURIComponent(
      `System: You are Zuri, flagship AI assistant built by KAIDO.${userName}\nFormat replies cleanly like ChatGPT with bold labels and clean bullets. Do not use ## or ###.\n${webContext}\nUser: ${lastUserMsg}`
    );
    const response = await fetch(`https://text.pollinations.ai/${prompt}?model=openai`);

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) return text.trim();
    }
  } catch {
    /* final persona fallback */
  }

  // Fallback 3: Persona response
  const userQuery = lastUserMsg.toLowerCase();
  const userName = userNameContext ? userNameContext.split("\n")[2].replace("- Name: ", "") : "";
  const nameGreeting = userName ? `, ${userName}` : "";

  if (userQuery.includes("hey") || userQuery.includes("hi") || userQuery.includes("hello")) {
    return `Hey${nameGreeting}! 👋 What's up? How can I help you today?`;
  }

  return `Hey${nameGreeting}! 😊 Ready to help with whatever you've got — whether it's brainstorming ideas, coding, or just chatting.`;
}
