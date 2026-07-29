import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TopBar } from "@/components/TopBar";
import { Composer } from "@/components/Composer";
import hero from "@/assets/hero-worldcup.jpg";
import fanCam from "@/assets/card-fancam.jpg";
import space from "@/assets/card-space.jpg";
import mermaid from "@/assets/card-mermaid.jpg";
import flash1 from "@/assets/card-flash1.jpg";
import flash2 from "@/assets/card-flash2.jpg";
import gta from "@/assets/card-gta.jpg";
import boxer from "@/assets/card-boxer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creative — Nova AI Video & Image Studio" },
      {
        name: "description",
        content:
          "Explore trending AI video and image styles, then generate stunning videos, graphics and realistic photos in seconds.",
      },
      { property: "og:title", content: "Creative — Nova AI Video & Image Studio" },
      {
        property: "og:description",
        content: "Trending AI video and image styles, ready to try in one tap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const videoTrends = [
  { label: "Fan Cam", src: fanCam },
  { label: "Space", src: space },
  { label: "Mermaid", src: mermaid },
];

const imageTrends = [
  { label: "Flash Effect", src: flash1 },
  { label: "Flash Effect", src: flash2 },
  { label: "GTA", src: gta },
  { label: "Boxer", src: boxer },
];

function TrendCard({ label, src }: { label: string; src: string }) {
  return (
    <button className="relative aspect-[3/4] w-[45%] shrink-0 snap-start overflow-hidden rounded-xl bg-surface">
      <img
        src={src}
        alt={label}
        loading="lazy"
        width={512}
        height={768}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-left text-base font-medium text-primary">
        {label}
      </span>
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button className="text-base text-brand">See all</button>
    </div>
  );
}

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

      <main className="flex-1 space-y-6 pb-56 pt-4">
        <section className="px-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
            <img
              src={hero}
              alt="World Cup: Brazil AI video trend"
              width={1280}
              height={720}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute left-4 top-1/3 text-5xl leading-none">🇧🇷</span>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 to-transparent pb-6 pt-12">
              <h1 className="text-2xl font-semibold text-primary">World Cup: Brazil</h1>
              <Link
                to="/chat"
                className="rounded-full bg-white/15 px-6 py-1.5 text-base text-primary backdrop-blur"
              >
                Try Now
              </Link>
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Video Trends" />
          <div className="flex snap-x gap-2 overflow-x-auto px-3 pb-1">
            {videoTrends.map((c) => (
              <TrendCard key={c.label} {...c} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Image Trends" />
          <div className="flex snap-x gap-2 overflow-x-auto px-3 pb-1">
            {imageTrends.map((c, i) => (
              <TrendCard key={`${c.label}-${i}`} {...c} />
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-3 pb-5 pt-6">
        <Composer variant="creative" placeholder="Upload a photo — Let's edit it." />
      </footer>
    </div>
  );
}
