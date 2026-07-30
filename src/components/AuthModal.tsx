import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import logoImg from "@/assets/logo.png";

const DEFAULT_GOOGLE_CLIENT_ID =
  "145932144269-r368ordsgp037pskq43ihvgjanj4honr.apps.googleusercontent.com";

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [mode, setMode] = useState<"options" | "email" | "success">("options");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<{ email: string; name?: string; picture?: string } | null>(null);

  // Check for Google OAuth hash callback (#access_token=...)
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.replace("#", "?"));
        const token = params.get("access_token");
        if (token) {
          fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.email) {
                const loggedUser = {
                  email: data.email,
                  name: data.name || data.email.split("@")[0],
                  picture: data.picture,
                };
                setUser(loggedUser);
                localStorage.setItem("zuri_user", JSON.stringify(loggedUser));
                // Clean hash from URL
                window.history.replaceState(null, "", window.location.pathname);
              }
            })
            .catch(() => {});
        }
      }

      const stored = localStorage.getItem("zuri_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* storage unavailable */
    }
  }, []);

  if (!open) return null;

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = "email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(
      scope
    )}`;

    window.location.href = authUrl;
  };

  const handleLogin = (provider: string) => {
    const loggedUser = { email: email || `${provider.toLowerCase()}user@example.com` };
    setUser(loggedUser);
    localStorage.setItem("zuri_user", JSON.stringify(loggedUser));
    setMode("success");
    setTimeout(() => {
      onOpenChange(false);
      setMode("options");
    }, 1500);
  };

  return (
    <div
      aria-label="Authentication modal"
      className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Top Bar with X close button */}
      <div className="flex items-center justify-end px-5 pt-5">
        <button
          onClick={() => {
            onOpenChange(false);
            setMode("options");
          }}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2/80 text-foreground hover:bg-surface-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Centered White Circle Logo */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse">
          <img src={logoImg} alt="Logo" className="h-7 w-7 object-contain invert" />
        </div>
      </div>

      {/* Bottom Action Sheet Card */}
      <div className="w-full rounded-t-3xl bg-[#141519] border-t border-border/40 p-6 pb-8 space-y-3.5 shadow-2xl">
        {mode === "options" ? (
          <>
            <button
              type="button"
              onClick={() => handleLogin("Apple")}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-4 text-base font-semibold text-black transition-transform active:scale-[0.99] shadow-md hover:bg-slate-100"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.09-3.48-2.83-7.46-7.59-11.95-14.29-6.3-9.4-11.23-19.78-14.78-31.13-3.55-11.36-5.33-22.13-5.33-32.33 0-14.7 3.66-26.68 10.98-35.94 7.33-9.27 16.51-13.98 27.56-14.14 4.88 0 10.15 1.25 15.82 3.75 5.66 2.5 9.77 3.75 12.32 3.75 2.12 0 6.32-1.3 12.6-3.9 6.28-2.6 11.66-3.83 16.14-3.69 11.75.54 21.14 4.89 28.17 13.06-10.45 6.32-15.54 15.14-15.28 26.47.26 8.71 3.55 16.03 9.87 21.96 6.33 5.94 13.79 9.3 22.38 10.08-2.12 6.42-4.88 13.25-8.28 20.49zM119.22 31.84c0-7.07 2.56-13.88 7.68-20.43 5.12-6.55 11.53-10.74 19.23-12.57.7 7.07-1.46 13.87-6.48 20.4-5.02 6.53-11.45 10.78-19.29 12.76-.36-.05-.71-.11-1.14-.16z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#24252a] border border-border/40 px-5 py-4 text-base font-semibold text-white transition-transform active:scale-[0.99] hover:bg-[#2c2d33]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("email")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1c1d22] border border-border/40 px-5 py-4 text-base font-semibold text-white transition-transform active:scale-[0.99] hover:bg-[#25262c]"
            >
              <span>Log in or sign up</span>
            </button>
          </>
        ) : mode === "email" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) handleLogin("Email");
            }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-center text-foreground">
              Enter your email
            </h3>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-2xl bg-surface px-4 py-3.5 text-base text-foreground outline-none border border-border focus:border-brand"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("options")}
                className="w-1/3 rounded-2xl bg-[#1c1d22] py-3.5 text-base font-medium text-foreground hover:bg-[#25262c]"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="py-4 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Welcome to Zuri!</h3>
            <p className="text-sm text-muted-foreground">
              Signed in as {user?.name || user?.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
