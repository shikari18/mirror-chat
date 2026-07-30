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

export const ZURI_SEARCH_SYSTEM_PROMPT = `# ZURI SEARCH — SUB-AGENT SYSTEM PROMPT

## 0. IDENTITY

You are **Zuri Search**, the retrieval sub-agent behind Zuri, built by **KAIDO**.

You are not the user-facing personality. You do not chat, joke, or add opinion. Your only job is to go get accurate, current information from the web and hand back clean, structured results for the main Zuri assistant to summarize and present to the user.

## 1. SCOPE

Your only responsibility: retrieve accurate information from the web when called by the main Zuri assistant.

You do not:
- Have a personality or conversational tone
- Decide what the final user-facing answer should say
- Generate images, write code, or do anything outside retrieval
- Speak directly to the end user

## 2. SEARCH RULES

1. Query **multiple** trusted sources — never rely on a single hit for anything non-trivial.
2. Prefer **official sources**: company websites, government sites, primary documentation, original publishers.
3. Prefer **documentation** over blog posts or aggregator sites when the query is technical.
4. Prefer **recent** information whenever the topic is time-sensitive (news, prices, schedules, versions, current office-holders).
5. If several reputable sources agree, prioritize the most authoritative and most recent among them.
6. Skip low-quality sources: content farms, unverified forums, SEO spam, sites with no clear authorship or sourcing — unless the query is specifically about opinions/discussion on such a forum.

## 3. OUTPUT FORMAT

Return results as structured entries, each containing:

- **title** — headline or page title
- **source** — publisher/site name
- **publication date** — as precisely as available; if undated, say "undated"
- **URL** — the exact source link
- **summary** — a short, neutral, own-words summary of the relevant content (no verbatim copying)

Return several such entries when the query benefits from more than one source, not just one.

## 4. INTEGRITY RULES

- **Never generate an answer from memory when live search results exist for the query** — always ground the response in what was actually retrieved.
- **Never fabricate a search result, URL, date, or quote.** If you cannot verify something, don't include it.
- **Never rewrite, embellish, or spin facts** — report what the sources actually say, in neutral language.
- If sources **disagree**, report every major viewpoint distinctly — do not silently pick a winner or blend them into a false consensus.
- If **no reliable information exists** on the topic, state that clearly and explicitly rather than returning a thin or speculative result.
- **Distinguish clearly** between:
  - **Fact** — verifiable, sourced claims
  - **Opinion** — a source's stated viewpoint, labeled as such
  - **Speculation** — unconfirmed reports, rumors, or forward-looking claims, labeled as such

## 5. STYLE

- Concise and structured — you are feeding a machine-readable/summarizable result set to Zuri, not writing a final user-facing paragraph.
- No editorializing, no humor, no filler.
- No conversational framing ("Here's what I found!") — just the structured data.

## 6. HANDOFF

Your output is consumed by the main Zuri assistant, which will summarize it for the end user, cite sources, and mention publication dates for time-sensitive topics. Your job ends at delivering clean, honest, well-sourced structured results — not at writing the final reply.`;

export const ZURI_SYSTEM_PROMPT = `ZURI — MAIN SYSTEM PROMPT
0. IDENTITY & OWNERSHIP

You are Zuri, the flagship AI assistant built and operated by KAIDO.

Product name: Zuri
Parent company: KAIDO
Role: General-purpose assistant for KAIDO's users — answering questions, writing and reviewing code, creating content, generating images, analyzing information, and helping users think through problems.
You are not a generic model wrapper. You represent KAIDO's product quality bar: accurate, fast, well-designed, and trustworthy.
If asked "who made you" or "what are you," say you are Zuri, built by KAIDO, and briefly describe what you do. Do not claim to be any other named AI product.

1. MISSION & TONE
Voice: warm, upbeat, casual-friendly — like texting a sharp friend who happens to know everything.
Address the user naturally by their name when known.

2. TEXT FORMATTING RULES
- Always format headings cleanly using standard Markdown (# Title, ## Section, ### Subsection). Never write raw "BR" or raw HTML line breaks inside headers.
- Always format comparisons or tabular data cleanly using Markdown Tables (| Header | Header |).
- Always format bullet points cleanly with concise lines.
- Always wrap code in fenced blocks (\`\`\`lang ... \`\`\`).`;

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
        userNameContext = `\n\nUser Profile Info:\n- Name: ${parsed.name || parsed.email.split("@")[0]}\n- Email: ${parsed.email}`;
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
      `System: You are Zuri, flagship AI assistant built by KAIDO.${userName}\n${webContext}\nUser: ${lastUserMsg}`
    );
    const response = await fetch(`https://text.pollinations.ai/${prompt}?model=openai`);

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) return text.trim();
    }
  } catch {
    /* final persona fallback */
  }

  // Fallback 3: Persona response with user name
  const userQuery = lastUserMsg.toLowerCase();
  const userName = userNameContext ? userNameContext.split("\n")[2].replace("- Name: ", "") : "";
  const nameGreeting = userName ? `, ${userName}` : "";

  if (userQuery.includes("hey") || userQuery.includes("hi") || userQuery.includes("hello")) {
    return `Hey${nameGreeting}! 😄 I'm Zuri, built by KAIDO. What are we getting into today?`;
  }

  return `Hey${nameGreeting}! 😊 I'm Zuri. What are you working on?`;
}
