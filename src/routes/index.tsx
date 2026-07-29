import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TopBar } from "@/components/TopBar";
import { Composer } from "@/components/Composer";
import fanCam from "@/assets/card-fancam.jpg";
import space from "@/assets/card-space.jpg";
import mermaid from "@/assets/card-mermaid.jpg";
import boxer from "@/assets/card-boxer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova AI — Chat & Creative Studio" },
      {
        name: "description",
        content:
          "Nova AI mobile assistant: chat, generate stunning videos, graphics and realistic photos with precision.",
      },
      { property: "og:title", content: "Nova AI — Chat & Creative Studio" },
      {
        property: "og:description",
        content:
          "Chat and create — videos, graphics and realistic photos with even more precision.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const cards = [
  { label: "Fan Cam", src: fanCam, rotate: "-4deg" },
  { label: "Space", src: space, rotate: "2deg" },
  { label: "Mermaid", src: mermaid, rotate: "-2deg" },
  { label: "Boxer", src: boxer, rotate: "3deg" },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopBar tab="creative" onMenu={() => setMenuOpen(true)} />

      <AppSidebar
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenSettings={() => {
          setMenuOpen(false);
          setSettingsOpen(true);
        }}
      />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="flex w-full items-end justify-center gap-1">
          {cards.map((c) => (
            <div
              key={c.label}
              style={{ transform: `rotate(${c.rotate})` }}
              className="relative h-40 flex-1 overflow-hidden rounded-xl border border-border/70 bg-surface"
            >
              <img
                src={c.src}
                alt={c.label}
                loading="lazy"
                width={512}
                height={768}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <span className="text-sm text-primary">{c.label}</span>
              </div>
            </div>
          ))}
        </div>

        <h1 className="mt-7 text-center text-2xl font-bold">
          The next era of video creation
        </h1>
        <p className="mt-3 text-center text-lg leading-snug text-foreground/85">
          More creativity, more control - create stunning videos, graphics, and
          realistic photos with even more precision.
        </p>

        <Link
          to="/chat"
          className="mt-7 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          Try Now
        </Link>
      </main>

      <footer className="px-3 pb-5">
        <Composer placeholder="Give me a task — Consider it done." />
      </footer>
    </div>
  );
}
