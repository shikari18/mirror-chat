import { createFileRoute } from "@tanstack/react-router";
import { ChatIndex } from "./index";

export const Route = createFileRoute("/chat")({
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
