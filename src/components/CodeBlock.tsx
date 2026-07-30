import { useState } from "react";
import { Check, Copy } from "lucide-react";

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

export function FormattedMessage({ text }: { text: string }) {
  // Regex to split code blocks ```lang ... ``` vs plain text
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 leading-relaxed">
      {parts.map((part, index) => {
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

        // Render plain text with inline code blocks `code`
        const inlineParts = part.split(/(`[^`]+`)/g);

        return (
          <span key={index} className="whitespace-pre-wrap">
            {inlineParts.map((sub, subIdx) => {
              if (sub.startsWith("`") && sub.endsWith("`") && sub.length > 2) {
                return (
                  <code
                    key={subIdx}
                    className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm text-brand-foreground border border-border/50"
                  >
                    {sub.slice(1, -1)}
                  </code>
                );
              }
              return sub;
            })}
          </span>
        );
      })}
    </div>
  );
}
