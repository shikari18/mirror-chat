import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    // Only show splash screen once per session; do not popup on refresh
    return !sessionStorage.getItem("zuri_splash_shown");
  });
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Mark as shown so refreshes skip the splash screen
    try {
      sessionStorage.setItem("zuri_splash_shown", "true");
    } catch {
      /* storage unavailable */
    }

    // Show for 3 seconds (3000ms), then fade out over 400ms
    const timer = setTimeout(() => {
      setFadingOut(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 400);
      return () => clearTimeout(removeTimer);
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      aria-label="Loading splash screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black transition-opacity duration-400 ease-in-out ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <img
            src={logoImg}
            alt="Logo"
            className="h-20 w-20 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] animate-pulse"
          />
        </div>
      </div>
    </div>
  );
}
