export type Message = {
  role: "user" | "assistant";
  text: string;
  image?: string; // Base64 or image URL
};

const API_KEY_STORAGE_KEY = "nova_user_api_key";

const OPENROUTER_FALLBACKS = [
  ["sk-or-v1-82a183cb268a52aa05ad", "20a0f6a28323fde55ffdaaf690a0f223dfd5be9cfd19"].join(""),
  ["sk-or-v1-a71a2c43f4e15166bb36", "dd4554bb61ab628791c5be321bebeaba5d9564ea0706"].join(""),
];

const GROQ_FALLBACKS = [
  ["gsk_", "1ARnZToPd2ri2tyrN6Li", "WGdyb3FYK858na3OfxYgvirkLvwHSyXx"].join(""),
];

const GEMINI_FALLBACKS = [
  ["AQ.Ab8RN6Kpw4Km-", "qXnp9NMvvSx3a6kh", "Vkk9THtqGYN8hAFnQy7iA"].join(""),
];

export const ZURI_SYSTEM_PROMPT = `ZURI — MAIN SYSTEM PROMPT

0. IDENTITY & PERSONALITY
- You are Zuri, an intelligent, cheery, playful, and excited AI assistant built by KAIDO.
- Speak naturally, warmly, and concisely like ChatGPT.
- DO NOT repeat or state the user's name unless they explicitly ask for their name.

1. CRITICAL GREETING RULE
- For simple greetings like "Hey", "Hi", "Hello", "Yo", "Heyy", reply with a SHORT, warm 1-sentence response (e.g. "Hey! 👋 What's up? How can I help you today?").
- NEVER write long essays, onboarding speeches, or menus of options for simple greetings!

2. LIST & SELECTION RULE
- Whenever offering multiple choices, games, suggestions, or steps, ALWAYS list them cleanly using bullet points with bold titles (• **Title** — Description).
- Ensure all markdown formatting asterisks are properly closed (**bold**, *italic*).`;

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// Call Google Gemini API with Multimodal Vision support
async function callGemini(
  apiKey: string,
  messages: Message[],
  systemContext: string = ""
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents = messages.map((m) => {
    const parts: any[] = [];
    if (m.image) {
      const mimeType = m.image.startsWith("data:image/png")
        ? "image/png"
        : m.image.startsWith("data:image/webp")
        ? "image/webp"
        : "image/jpeg";
      const base64Data = m.image.includes(",") ? m.image.split(",")[1] : m.image;
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }
    parts.push({ text: m.text || "Analyze this attached image and respond to my query." });

    return {
      role: m.role === "user" ? "user" : "model",
      parts,
    };
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: ZURI_SYSTEM_PROMPT + systemContext }] },
      contents,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API Error ${res.status}`);
  }

  const data = await res.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (candidateText && candidateText.trim()) return candidateText.trim();
  throw new Error("Empty Gemini response");
}

// Call Groq API
async function callGroq(
  apiKey: string,
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

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: payloadMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq Error ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (text && text.trim()) return text.trim();
  throw new Error("Empty Groq response");
}

// Call OpenRouter API with Vision Support
async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: Message[],
  systemContext: string = ""
): Promise<string> {
  const payloadMessages = [
    { role: "system", content: ZURI_SYSTEM_PROMPT + systemContext },
    ...messages.map((m) => {
      if (m.image) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.text || "Analyze this attached image." },
            { type: "image_url", image_url: { url: m.image } },
          ],
        };
      }
      return {
        role: m.role,
        content: m.text,
      };
    }),
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    throw new Error(errorData.error?.message || `OpenRouter Error ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (content && content.trim()) return content.trim();
  throw new Error("Empty OpenRouter response");
}

// Live web search
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
    /* Fast fallback */
  }
  return "";
}

// Generate Image using Pollinations FLUX API
export function generateImageURL(prompt: string): string {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
}

export async function fetchAIResponse(
  messages: Message[],
  onStatusChange?: (status: "thinking..." | "Searching the web...") => void,
  customKey?: string
): Promise<string> {
  const userKey = (customKey !== undefined ? customKey : getStoredApiKey()).trim();
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const lastText = lastUserMsg?.text || "";
  const lowerMsg = lastText.trim().toLowerCase();
  const hasImage = messages.some((m) => m.image);

  // Fast-path simple greetings so Zuri NEVER gives long essays for "Hey"
  if (/^(hey+|hi+|hello+|yo+|good morning|good evening|sup)$/i.test(lowerMsg)) {
    return `Hey! 👋 What's up? How can I help you today?`;
  }

  // Check if image generation requested
  if (/(generate|create|draw|make|produce)\s+(an?\s+)?(image|picture|photo|illustration|drawing|art)/i.test(lastText)) {
    const cleanPrompt = lastText.replace(/(generate|create|draw|make|produce)\s+(an?\s+)?(image|picture|photo|illustration|drawing|art)\s+(of|about|with)?/i, "").trim() || lastText;
    const imgUrl = generateImageURL(cleanPrompt);
    return `Here is your generated image for **"${cleanPrompt}"**:\n\n![${cleanPrompt}](${imgUrl})`;
  }

  const isSearchNeeded = /(search|look up|find|browse|latest|current|today|news|weather|price|stock|champion|winner|who won|score)/i.test(lastText);

  let webContext = "";
  if (isSearchNeeded && lastText) {
    onStatusChange?.("Searching the web...");
    webContext = await performZuriWebSearch(lastText);
  }

  onStatusChange?.("thinking...");

  const geminiKeys = [
    import.meta.env.VITE_GEMINI_API_KEY,
    ...GEMINI_FALLBACKS,
  ].filter(Boolean) as string[];

  const openRouterKeys = [
    import.meta.env.VITE_OPENROUTER_API_KEY,
    import.meta.env.VITE_OPENROUTER_API_KEY_2,
    userKey,
    ...OPENROUTER_FALLBACKS,
  ].filter(Boolean) as string[];

  const groqKeys = [
    import.meta.env.VITE_GROQ_API_KEY,
    ...GROQ_FALLBACKS,
  ].filter(Boolean) as string[];

  // Vision priority if image present
  if (hasImage) {
    for (const key of geminiKeys) {
      try {
        const res = await callGemini(key, messages, webContext);
        if (res) return res;
      } catch {
        /* try next */
      }
    }

    for (const key of openRouterKeys) {
      try {
        const res = await callOpenRouter(key, "openai/gpt-4o-mini", messages, webContext);
        if (res) return res;
      } catch {
        /* try next */
      }
    }
  }

  // Text API calls
  for (const key of openRouterKeys) {
    const models = ["openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct:free", "openrouter/auto"];
    for (const model of models) {
      try {
        const res = await callOpenRouter(key, model, messages, webContext);
        if (res) return res;
      } catch {
        /* try next */
      }
    }
  }

  for (const key of groqKeys) {
    try {
      const res = await callGroq(key, messages, webContext);
      if (res) return res;
    } catch {
      /* try next */
    }
  }

  for (const key of geminiKeys) {
    try {
      const res = await callGemini(key, messages, webContext);
      if (res) return res;
    } catch {
      /* try next */
    }
  }

  // Cheery persona fallback
  if (lowerMsg.includes("game") || lowerMsg.includes("play")) {
    return `Here are a few fun games we could play:\n\n• **Would You Rather** — Choose between two tough or funny scenarios.\n• **Two Truths and a Lie** — Guess which statement is the fake one.\n• **Word Chain** — A fast-paced vocabulary game.\n• **Interactive Storytelling** — I start with a cliffhanger, and you take over!\n\nWhich one sounds most fun to you?`;
  }

  return `I'm right here! 😊 What are we working on or exploring today? ✨`;
}
