import { useState, useRef, useEffect } from "react";
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

  const inputRef = useRef<HTMLDivElement>(null);
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

  const handleSubmit = () => {
    const currentText = inputRef.current?.innerText || text;
    if (currentText.trim() || selectedImage) {
      const fullText = deepThink ? `[DeepThink Mode Active]\n${currentText.trim()}` : currentText.trim();
      onSend?.(fullText, selectedImage || undefined);
      if (inputRef.current) inputRef.current.innerText = "";
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
                deepThink ? "bg-white text-black" : "bg-surface-2 text-amber-400"
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
          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/20 shadow-md">
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

      {/* Pure Black & White Input Container (No Form, ContentEditable for Zero iOS Keyboard Accessory Bar) */}
      <div
        className={`flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/15 px-3.5 py-2.5 shadow-2xl transition-all duration-200 ${
          variant === "creative" ? "bg-black/50" : ""
        }`}
      >
        <button
          type="button"
          aria-label="Add attachment"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            menuOpen ? "bg-white/15 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* ContentEditable Div completely eliminates iOS Safari form accessory toolbar (^ ∨ ✓) */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <div
            ref={inputRef}
            contentEditable
            role="textbox"
            aria-multiline="false"
            aria-label="Message"
            onInput={() => setText(inputRef.current?.innerText || "")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full min-w-0 bg-transparent text-[14px] text-white outline-none max-h-24 overflow-y-auto px-1 leading-normal whitespace-pre-wrap select-text"
          />
          {!text && (
            <span className="pointer-events-none absolute left-1 text-[14px] text-white/40 select-none">
              {deepThink ? "Ask anything (DeepThink active)..." : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Voice input"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
          >
            <Mic className="h-5 w-5" />
          </button>

          {hasContent ? (
            <button
              type="button"
              onClick={handleSubmit}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-bold transition-transform active:scale-95 shadow-md"
            >
              <ArrowUp className="h-5 w-5 text-black stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              aria-label="Voice mode"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-transform active:scale-95 shadow-md hover:bg-white/20 border border-white/10"
            >
              <AudioLines className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
