import { useState, useRef } from "react";
import {
  ArrowUp,
  AudioLines,
  Camera,
  Brain,
  FileText,
  Image as ImageIcon,
  Mic,
  Plus,
  X,
} from "lucide-react";

export function Composer({
  placeholder = "Ask anything",
  onSend,
  variant = "chat",
}: {
  placeholder?: string;
  onSend?: (text: string, image?: string) => void;
  variant?: "chat" | "creative";
}) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deepThink, setDeepThink] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    setMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || selectedImage) {
      const fullText = deepThink ? `[DeepThink Mode Active]\n${text.trim()}` : text.trim();
      onSend?.(fullText, selectedImage || undefined);
      setText("");
      setSelectedImage(null);
    }
  };

  const hasContent = text.trim().length > 0 || !!selectedImage;

  return (
    <div className="relative w-full">
      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Plus Attachment Popup Drawer */}
      {menuOpen && (
        <div className="absolute bottom-16 left-0 z-50 w-64 overflow-hidden rounded-2xl border border-white/15 bg-[#18191e]/95 backdrop-blur-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-brand">
              <Camera className="h-4 w-4" />
            </span>
            <span>Camera</span>
          </button>

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-blue-400">
              <ImageIcon className="h-4 w-4" />
            </span>
            <span>Photos</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-purple-400">
              <FileText className="h-4 w-4" />
            </span>
            <span>Files</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDeepThink(!deepThink);
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors text-left"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                deepThink ? "bg-brand text-brand-foreground" : "bg-surface-2 text-amber-400"
              }`}
            >
              <Brain className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span>DeepThink</span>
              <span className="text-[11px] text-muted-foreground">
                {deepThink ? "Active (High reasoning)" : "Deep reasoning mode"}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Selected Image Thumbnail Preview */}
      {selectedImage && (
        <div className="mb-2 flex items-center gap-2 pl-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/20 shadow-md">
            <img src={selectedImage} alt="Attachment" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {deepThink && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/40">
              <Brain className="h-3 w-3" /> DeepThink ON
            </span>
          )}
        </div>
      )}

      {/* Input Glass Container */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/15 px-3.5 py-2.5 shadow-2xl transition-all duration-200 ${
          variant === "creative" ? "bg-black/50" : ""
        }`}
      >
        <button
          type="button"
          aria-label="Add attachment"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            menuOpen ? "bg-surface-2 text-foreground" : "text-foreground/70 hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Plus className="h-5 w-5" />
        </button>

        <input
          name="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 px-1"
          placeholder={deepThink ? "Ask anything (DeepThink active)..." : placeholder}
          aria-label="Message"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Voice input"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:text-foreground transition-colors"
          >
            <Mic className="h-5 w-5" />
          </button>

          {hasContent ? (
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-bold transition-transform active:scale-95 shadow-md"
            >
              <ArrowUp className="h-5 w-5 text-black stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Voice mode"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-white transition-transform active:scale-95 shadow-md hover:bg-blue-600"
            >
              <AudioLines className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
