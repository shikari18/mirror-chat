import { useState, useId } from "react";
import { Check, Copy, Play, Code2, ExternalLink, Globe, CheckSquare, Square } from "lucide-react";

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
    <div className="my-3 overflow-hidden rounded-2xl border border-white/15 bg-[#16171d] shadow-xl">
      {/* Code Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1f2027] px-4 py-2.5 text-xs text-foreground/80">
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
                  activeTab === "code" ? "bg-white/20 text-white font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                aria-label="Live run preview"
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  activeTab === "preview" ? "bg-white/20 text-white font-bold" : "text-muted-foreground hover:text-foreground"
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
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Code Body or Preview */}
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

  // Split tokens: Images, Links, Bold-Italic, Bold, Strikethrough, Italics, Code, Checkboxes
  const tokenRegex = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\[[^\]]+\]|\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
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
                className="my-3 rounded-2xl max-h-72 w-full object-cover border border-white/20 shadow-lg"
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
                className="inline-flex items-center gap-1 text-blue-400 hover:underline font-medium mx-0.5"
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
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 border border-white/15 mx-0.5 cursor-pointer hover:bg-white/20 transition-colors"
            >
              <Globe className="h-3 w-3 text-blue-400 shrink-0" />
              <span>{label}</span>
            </span>
          );
        }

        // Bold-Italic: ***text*** or ___text___
        if (
          (part.startsWith("***") && part.endsWith("***") && part.length > 6) ||
          (part.startsWith("___") && part.endsWith("___") && part.length > 6)
        ) {
          return (
            <strong key={i} className="font-bold italic text-white">
              {part.slice(3, -3)}
            </strong>
          );
        }

        // Bold: **text** or __text__
        if (
          (part.startsWith("**") && part.endsWith("**") && part.length > 4) ||
          (part.startsWith("__") && part.endsWith("__") && part.length > 4)
        ) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // Strikethrough: ~~text~~
        if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
          return (
            <del key={i} className="line-through text-white/60">
              {part.slice(2, -2)}
            </del>
          );
        }

        // Italics: *text* or _text_
        if (
          (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) ||
          (part.startsWith("_") && part.endsWith("_") && part.length > 2 && !part.startsWith("__"))
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
              className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-blue-300 border border-white/10 mx-0.5"
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

// Markdown Table Parser Component
function MarkdownTable({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;

  const headerLine = lines[0];
  const bodyLines = lines.slice(2); // skip divider line |---|---|

  const parseRow = (line: string) =>
    line
      .split("|")
      .map((c) => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

  const headers = parseRow(headerLine);

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-white/15 bg-[#14151a]">
      <table className="w-full text-left text-[13.5px] text-foreground">
        <thead className="bg-white/10 border-b border-white/15 text-white font-semibold">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5">
                <InlineTextFormatter text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {bodyLines.map((rowLine, rIdx) => {
            const cells = parseRow(rowLine);
            return (
              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2 text-white/90">
                    <InlineTextFormatter text={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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

              // Horizontal Rule: --- or ***
              if (/^(\s*[-*_]\s*){3,}$/.test(trimmed)) {
                return <hr key={pIdx} className="my-4 border-t border-white/15" />;
              }

              const lines = trimmed.split("\n");

              // Table Check (| col 1 | col 2 |)
              if (lines.length >= 2 && lines[0].includes("|") && lines[1].includes("|")) {
                return <MarkdownTable key={pIdx} lines={lines} />;
              }

              // Blockquotes (> quote or >> nested quote)
              if (trimmed.startsWith(">")) {
                const quoteText = trimmed.replace(/^>+\s*/, "");
                const isNested = trimmed.startsWith(">>");

                return (
                  <blockquote
                    key={pIdx}
                    className={`my-2 pl-3.5 py-1.5 italic bg-white/5 rounded-r-xl border-l-3 text-white/90 text-[13.5px] ${
                      isNested ? "border-purple-400 ml-4" : "border-blue-400"
                    }`}
                  >
                    <InlineTextFormatter text={quoteText} />
                  </blockquote>
                );
              }

              // Headings (#, ##, ###, ####, #####, ######)
              if (trimmed.startsWith("#")) {
                const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
                if (match) {
                  const level = match[1].length;
                  const headerText = match[2];

                  const sizes = [
                    "text-[18px] font-bold text-white mt-4 mb-1", // H1
                    "text-[16.5px] font-bold text-white mt-3.5 mb-1", // H2
                    "text-[15.5px] font-semibold text-white mt-3 mb-1", // H3
                    "text-[14.5px] font-semibold text-white/95 mt-2.5 mb-1", // H4
                    "text-[14px] font-medium text-white/90 mt-2 mb-1", // H5
                    "text-[13.5px] font-medium text-white/80 mt-2 mb-1", // H6
                  ];

                  return (
                    <div key={pIdx} className={sizes[level - 1]}>
                      <InlineTextFormatter text={headerText} />
                    </div>
                  );
                }
              }

              // Checkbox Tasks (- [ ] or - [x])
              const isTask = lines.every((line) => /^\s*[-*•]\s+\[[ xX]\]\s+/.test(line));
              if (isTask) {
                return (
                  <div key={pIdx} className="my-2 space-y-2">
                    {lines.map((line, lIdx) => {
                      const checked = /^\s*[-*•]\s+\[[xX]\]\s+/.test(line);
                      const content = line.replace(/^\s*[-*•]\s+\[[ xX]\]\s+/, "");
                      return (
                        <div key={lIdx} className="flex items-center gap-2.5 text-[14px] text-white/90">
                          {checked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-white/40 shrink-0" />
                          )}
                          <span className={checked ? "line-through text-white/50" : ""}>
                            <InlineTextFormatter text={content} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Bullet List Check (- , * , • or 1. )
              const isList = lines.every((line) => /^\s*([-*•]|\d+\.)\s+/.test(line));

              if (isList) {
                return (
                  <ul key={pIdx} className="my-2 space-y-2 pl-0">
                    {lines.map((line, lIdx) => {
                      const content = line.replace(/^\s*([-*•]|\d+\.)\s+/, "");
                      const isNumbered = /^\s*\d+\.\s+/.test(line);
                      const numberMatch = line.match(/^\s*(\d+)\.\s+/);

                      return (
                        <li key={lIdx} className="flex items-start gap-2.5 text-[14px]">
                          {isNumbered ? (
                            <span className="font-semibold text-white/70 text-[13.5px] min-w-4 text-right select-none">
                              {numberMatch?.[1]}.
                            </span>
                          ) : (
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60 select-none" />
                          )}
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

                    // Check line-level headings
                    const matchH = lineTrimmed.match(/^(#{1,6})\s+(.*)$/);
                    if (matchH) {
                      const level = matchH[1].length;
                      const hText = matchH[2];
                      const sizes = [
                        "text-[18px] font-bold text-white mt-4 mb-1 block",
                        "text-[16.5px] font-bold text-white mt-3.5 mb-1 block",
                        "text-[15.5px] font-semibold text-white mt-3 mb-1 block",
                        "text-[14.5px] font-semibold text-white/95 mt-2.5 mb-1 block",
                        "text-[14px] font-medium text-white/90 mt-2 mb-1 block",
                        "text-[13.5px] font-medium text-white/80 mt-2 mb-1 block",
                      ];
                      return (
                        <span key={lIdx} className={sizes[level - 1]}>
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
