import { useState } from "react";
import { Check, Copy, ExternalLink, Globe } from "lucide-react";

export function CodeBlock({
  language,
  code,
}: {
  language?: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-border bg-[#0e0e13] shadow-md">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface-2/60 px-4 py-2 text-xs font-mono text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider text-brand">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-foreground/80 hover:bg-surface-2 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-100">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function InlineTextFormatter({ text }: { text: string }) {
  // Strip raw BR HTML tags or uppercase BR artifacts
  const cleanText = text.replace(/<br\s*\/?>/gi, "").replace(/\s+BR\b/g, "");

  // Match inline elements: links [label](url), source pills [label], bold **text**, inline `code`
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\[[^\]]+\]|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = cleanText.split(tokenRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

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
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-foreground/90 border border-border/60 hover:bg-surface transition-colors mx-0.5"
              >
                <Globe className="h-3 w-3 text-brand" />
                <span>{label}</span>
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
              </a>
            );
          }
        }

        // Source pill without URL: [UEFA.com +1] or [source]
        if (part.startsWith("[") && part.endsWith("]") && !part.includes("(")) {
          const label = part.slice(1, -1);
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-foreground/90 border border-border/60 mx-0.5 cursor-pointer hover:bg-surface transition-colors"
            >
              <Globe className="h-3 w-3 text-brand shrink-0" />
              <span>{label}</span>
            </span>
          );
        }

        // Bold: **text**
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-bold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // Inline code: `code`
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm text-brand-foreground border border-border/50 mx-0.5"
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

function TableBlock({ lines }: { lines: string[] }) {
  // Filter out delimiter line like |---|---|
  const dataLines = lines.filter((l) => !/^\s*\|?\s*[-:]+[-|\s:]*$/.test(l));
  if (dataLines.length === 0) return null;

  const parseRow = (line: string) => {
    const cells = line.split("|");
    if (cells.length > 2) {
      return cells.slice(1, -1).map((c) => c.trim());
    }
    return cells.map((c) => c.trim()).filter(Boolean);
  };

  const headerCells = parseRow(dataLines[0]);
  const bodyRows = dataLines.slice(1).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-border/80 bg-surface/60 p-1 shadow-sm">
      <table className="w-full text-left text-sm border-collapse">
        {headerCells.length > 0 && (
          <thead>
            <tr className="border-b border-border bg-surface-2/80 text-foreground font-semibold">
              {headerCells.map((h, i) => (
                <th key={i} className="p-3 whitespace-nowrap">
                  <InlineTextFormatter text={h} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border/40 text-foreground/90">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-surface-2/40 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3">
                  <InlineTextFormatter text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormattedMessage({ text }: { text: string }) {
  // Split into code blocks vs non-code text
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed">
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

        // Split paragraphs by blank lines \n\n
        const paragraphs = part.split(/\n\n+/g);

        return (
          <div key={index} className="space-y-3">
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              const lines = trimmed.split("\n");

              // 1. Markdown Table Check (lines with |)
              const isTable = lines.length >= 2 && lines.some((l) => l.includes("|"));
              if (isTable) {
                return <TableBlock key={pIdx} lines={lines} />;
              }

              // 2. Header Check (#, ##, ###, ####)
              if (trimmed.startsWith("#")) {
                const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/s);
                if (headerMatch) {
                  const level = headerMatch[1].length;
                  const headerText = headerMatch[2];

                  if (level === 1) {
                    return (
                      <h1 key={pIdx} className="mt-4 mb-2 text-2xl font-bold tracking-tight text-foreground">
                        <InlineTextFormatter text={headerText} />
                      </h1>
                    );
                  }
                  if (level === 2) {
                    return (
                      <h2 key={pIdx} className="mt-4 mb-2 text-xl font-bold tracking-tight text-foreground">
                        <InlineTextFormatter text={headerText} />
                      </h2>
                    );
                  }
                  return (
                    <h3 key={pIdx} className="mt-3 mb-1.5 text-lg font-semibold text-foreground">
                      <InlineTextFormatter text={headerText} />
                    </h3>
                  );
                }
              }

              // 3. List Check (lines starting with - , * , • or 1. )
              const isList = lines.every((line) =>
                /^\s*([-*•]|\d+\.)\s+/.test(line)
              );

              if (isList) {
                return (
                  <ul key={pIdx} className="my-2 space-y-1.5 pl-1">
                    {lines.map((line, lIdx) => {
                      const content = line.replace(/^\s*([-*•]|\d+\.)\s+/, "");
                      return (
                        <li key={lIdx} className="flex items-start gap-2 text-lg">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                          <span className="flex-1">
                            <InlineTextFormatter text={content} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // 4. Regular Paragraph
              return (
                <p key={pIdx} className="text-lg leading-relaxed">
                  {lines.map((line, lIdx) => {
                    // Check if individual line is a header inside paragraph
                    if (/^(#{1,6})\s+/.test(line.trim())) {
                      const hText = line.trim().replace(/^(#{1,6})\s+/, "");
                      return (
                        <strong key={lIdx} className="block mt-3 mb-1 text-xl font-bold text-foreground">
                          <InlineTextFormatter text={hText} />
                        </strong>
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
