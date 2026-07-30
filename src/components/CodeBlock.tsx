import { useState, useId } from "react";
import { Check, Copy, Play, Code2, ExternalLink, Globe } from "lucide-react";

export function CodeBlock({
  language,
  code,
}: {
  language?: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const iframeId = useId();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHtml =
    language?.toLowerCase() === "html" ||
    code.includes("<!DOCTYPE html>") ||
    code.includes("<html") ||
    (code.includes("<style>") && code.includes("</style>"));

  return (
    <div className="my-3 overflow-hidden rounded-3xl border border-border/70 bg-[#16171d] shadow-xl">
      {/* Header Matching ChatGPT Image 4 & 5 */}
      <div className="flex items-center justify-between border-b border-border/50 bg-[#1f2027] px-4 py-2.5 text-xs text-foreground/80">
        <div className="flex items-center gap-2 font-mono font-medium text-foreground/90">
          <Code2 className="h-4 w-4 text-brand" />
          <span className="uppercase tracking-wide">{language || "code"}</span>
        </div>

        <div className="flex items-center gap-2">
          {isHtml && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                aria-label="Code view"
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  activeTab === "code" ? "bg-surface-2 text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                aria-label="Live run preview"
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  activeTab === "preview" ? "bg-surface-2 text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            </>
          )}

          <button
            onClick={handleCopy}
            type="button"
            aria-label="Copy code"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Code Editor or Live Preview Card */}
      {activeTab === "preview" && isHtml ? (
        <div className="w-full bg-white p-4 min-h-[220px] max-h-[400px] overflow-auto text-black">
          <iframe
            id={iframeId}
            title="Live Code Preview"
            srcDoc={code}
            className="w-full h-[260px] border-0 bg-white"
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-100 bg-[#0e0e13]">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function InlineTextFormatter({ text }: { text: string }) {
  let clean = text.replace(/<br\s*\/?>/gi, "").replace(/\s+BR\b/g, "");
  clean = clean.replace(/^(#{1,6})\s+/, "");

  const tokenRegex = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\[[^\]]+\]|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  const parts = clean.split(tokenRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        // Image: ![alt](url)
        if (part.startsWith("![") && part.includes("](") && part.endsWith(")")) {
          const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (imgMatch) {
            const [, alt, url] = imgMatch;
            return (
              <img
                key={i}
                src={url}
                alt={alt || "Image"}
                className="my-3 rounded-2xl max-h-72 w-full object-cover border border-border/40 shadow-lg"
              />
            );
          }
        }

        // Link with URL: [label](url)
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (match) {
            const [, label, url] = match;
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline font-medium mx-0.5"
              >
                <span>{label}</span>
                <ExternalLink className="h-3 w-3 inline shrink-0" />
              </a>
            );
          }
        }

        // Source pill: [source]
        if (part.startsWith("[") && part.endsWith("]") && !part.includes("(")) {
          const label = part.slice(1, -1);
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-foreground/90 border border-border/60 mx-0.5 cursor-pointer hover:bg-surface transition-colors"
            >
              <Globe className="h-3 w-3 text-brand shrink-0" />
              <span>{label}</span>
            </span>
          );
        }

        // Bold: **text**
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // Italics: *text* or _text_
        if (
          (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) ||
          (part.startsWith("_") && part.endsWith("_") && part.length > 2)
        ) {
          return (
            <em key={i} className="italic text-foreground/90">
              {part.slice(1, -1)}
            </em>
          );
        }

        // Inline code: `code`
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-brand-foreground border border-border/50 mx-0.5"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function FormattedMessage({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-[14px] text-foreground/95">
      {parts.map((part, index) => {
        // Code Block
        if (part.startsWith("```") && part.endsWith("```")) {
          const firstLineEnd = part.indexOf("\n");
          let language = "";
          let code = "";

          if (firstLineEnd !== -1) {
            language = part.slice(3, firstLineEnd).trim();
            code = part.slice(firstLineEnd + 1, -3);
          } else {
            code = part.slice(3, -3);
          }

          return (
            <CodeBlock
              key={index}
              language={language}
              code={code.trimEnd()}
            />
          );
        }

        // Paragraphs split by blank lines \n\n
        const paragraphs = part.split(/\n\n+/g);

        return (
          <div key={index} className="space-y-2.5">
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              const lines = trimmed.split("\n");

              // Blockquote (> quote)
              if (trimmed.startsWith(">")) {
                const quoteText = trimmed.replace(/^>\s*/, "");
                return (
                  <blockquote
                    key={pIdx}
                    className="my-2 border-l-3 border-brand pl-3 py-1 italic bg-surface-2/30 rounded-r-xl text-foreground/90 text-[13.5px]"
                  >
                    <InlineTextFormatter text={quoteText} />
                  </blockquote>
                );
              }

              // Headers (#, ##, ###, ####)
              if (trimmed.startsWith("#")) {
                const headerText = trimmed.replace(/^(#{1,6})\s+/, "");
                return (
                  <div key={pIdx} className="mt-3 mb-1 text-[15px] font-semibold text-white">
                    <InlineTextFormatter text={headerText} />
                  </div>
                );
              }

              // Bullet List Check (- , * , • or 1. )
              const isList = lines.every((line) =>
                /^\s*([-*•]|\d+\.)\s+/.test(line)
              );

              if (isList) {
                return (
                  <ul key={pIdx} className="my-2 space-y-2 pl-0">
                    {lines.map((line, lIdx) => {
                      const content = line.replace(/^\s*([-*•]|\d+\.)\s+/, "");
                      return (
                        <li key={lIdx} className="flex items-start gap-2 text-[14px]">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60 select-none" />
                          <div className="flex-1 leading-relaxed">
                            <InlineTextFormatter text={content} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Regular Paragraph
              return (
                <p key={pIdx} className="text-[14px] leading-relaxed">
                  {lines.map((line, lIdx) => {
                    const lineTrimmed = line.trim();
                    if (/^(#{1,6})\s+/.test(lineTrimmed)) {
                      const hText = lineTrimmed.replace(/^(#{1,6})\s+/, "");
                      return (
                        <span key={lIdx} className="block mt-2 mb-1 text-[15px] font-semibold text-white">
                          <InlineTextFormatter text={hText} />
                        </span>
                      );
                    }

                    return (
                      <span key={lIdx}>
                        <InlineTextFormatter text={line} />
                        {lIdx < lines.length - 1 && <br />}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
