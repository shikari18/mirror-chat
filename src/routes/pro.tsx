import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "Get Pro Access — Nova AI" },
      {
        name: "description",
        content:
          "Unlock unlimited messages, GPT-5, Gemini and Claude answers, plus video and image generation with Nova AI Pro.",
      },
      { property: "og:title", content: "Get Pro Access — Nova AI" },
      {
        property: "og:description",
        content: "Unlimited messages, top AI models, video and image generation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pro,
});

const models = ["Gemini", "GPT-5", "Grok", "deepseek", "Claude"];
const perks = [
  "Unlimited Messages",
  "Answers from GPT-5, Gemini & Claude",
  "Video & Image Generation",
  "Ask Web & Analyze PDF",
];

function Pro() {
  const router = useRouter();
  const [plan, setPlan] = useState<"yearly" | "weekly">("yearly");

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-5 pb-8 text-foreground">
      <button
        aria-label="Close"
        onClick={() => router.history.back()}
        className="text-foreground/70"
      >
        <X className="h-7 w-7" />
      </button>

      <h1 className="mt-3 text-center text-4xl font-bold">Get Pro Access</h1>
      <p className="mt-2 text-center text-lg text-foreground/85">All in one place</p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {models.map((m) => (
          <span
            key={m}
            className="rounded-full bg-surface px-4 py-2 text-base font-medium"
          >
            {m}
          </span>
        ))}
      </div>

      <ul className="mt-9 space-y-4">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-base">{p}</span>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex items-center justify-between rounded-full border border-border px-6 py-4">
        <span className="text-lg">Enable Free Trial</span>
        <Switch />
      </div>

      <button
        onClick={() => setPlan("yearly")}
        className={`relative mt-4 flex items-center justify-between rounded-full border px-6 py-4 text-left ${
          plan === "yearly" ? "border-brand" : "border-border"
        }`}
      >
        <span className="absolute -top-3 right-6 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-foreground">
          87% OFF
        </span>
        <span>
          <span className="block text-lg font-semibold">YEARLY ACCESS</span>
          <span className="block text-sm text-muted-foreground">US$49.99 per year</span>
        </span>
        <span className="text-right text-base font-bold leading-tight">
          US$0.96
          <br />
          per week
        </span>
      </button>

      <button
        onClick={() => setPlan("weekly")}
        className={`mt-4 flex items-center justify-between rounded-full border px-6 py-4 text-left ${
          plan === "weekly" ? "border-brand" : "border-border"
        }`}
      >
        <span className="text-lg font-semibold">WEEKLY ACCESS</span>
        <span className="text-right text-base font-bold leading-tight">
          US$7.99
          <br />
          per week
        </span>
      </button>

      <button className="mt-6 flex items-center justify-center gap-4 rounded-full bg-primary px-8 py-4 text-xl font-medium text-primary-foreground">
        Continue <ArrowRight className="h-5 w-5" />
      </button>

      <p className="mt-4 text-center text-sm text-foreground/85">
        ✔ No commitment - Cancel anytime
      </p>
      <div className="mt-3 flex justify-center gap-8 text-sm text-muted-foreground underline">
        <button>Restore</button>
        <button>Terms of Use</button>
        <button>Privacy Policy</button>
      </div>
    </div>
  );
}
