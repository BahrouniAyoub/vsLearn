import { Lightbulb, BookOpen, Target } from "lucide-react";

type LessonInstructionsProps = {
  title: string;
  content: string;
  instructions?: string;
  hints?: string[];
  hintsVisible: boolean;
};

export function LessonInstructions({
  title,
  content,
  instructions,
  hints,
  hintsVisible,
}: LessonInstructionsProps) {
  return (
    <div className="h-full overflow-y-auto bg-editor">
      <div className="p-5 max-w-none">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-4 text-syntax-keyword" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>

        <div className="space-y-3 text-xs text-foreground/85 leading-relaxed">
          {renderMdxContent(content)}
        </div>

        {instructions && (
          <div className="mt-5 bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-4 text-syntax-attr" />
              <h3 className="text-xs font-semibold text-foreground">Challenge</h3>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {instructions}
            </p>
          </div>
        )}

        {hints && hints.length > 0 && hintsVisible && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-3.5 text-syntax-keyword" />
              <h3 className="text-xs font-semibold text-foreground">Hints</h3>
            </div>
            {hints.map((hint, i) => (
              <div
                key={i}
                className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3"
              >
                <div className="text-[10px] font-mono text-amber-400/70 mb-1">
                  Hint {i + 1}
                </div>
                <p className="text-xs text-amber-300/90 leading-relaxed">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function renderMdxContent(text: string): React.ReactNode[] {
  const blocks = text.split(/(\n\n+)/);
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    if (block.startsWith("---") && block.endsWith("---")) {
      continue;
    }

    if (block.startsWith("```")) {
      const lines = block.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      nodes.push(
        <pre key={key++} className="bg-secondary border border-border rounded-lg p-3 overflow-x-auto my-3">
          {lang && (
            <div className="text-[9px] font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
              {lang}
            </div>
          )}
          <code className="text-xs font-mono leading-relaxed whitespace-pre-wrap">{code}</code>
        </pre>,
      );
      continue;
    }

    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      nodes.push(
        <ul key={key++} className="space-y-1 my-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-xs">
              <span className="text-syntax-attr mt-1 flex-shrink-0">•</span>
              <span>{renderInline(item.replace(/^- /, ""))}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").filter((l) => /^\d+\.\s/.test(l));
      nodes.push(
        <ol key={key++} className="space-y-1 my-2 list-decimal pl-4">
          {items.map((item, j) => (
            <li key={j} className="text-xs pl-1">
              {renderInline(item.replace(/^\d+\.\s/, ""))}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (block.startsWith("# ")) {
      nodes.push(
        <h1 key={key++} className="text-base font-bold text-foreground mt-5 mb-3">
          {renderInline(block.replace(/^# /, ""))}
        </h1>,
      );
      continue;
    }

    if (block.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} className="text-sm font-semibold text-foreground mt-4 mb-2">
          {renderInline(block.replace(/^## /, ""))}
        </h2>,
      );
      continue;
    }

    if (block.startsWith("### ")) {
      nodes.push(
        <h3 key={key++} className="text-xs font-semibold text-foreground mt-3 mb-2">
          {renderInline(block.replace(/^### /, ""))}
        </h3>,
      );
      continue;
    }

    nodes.push(
      <p key={key++} className="text-xs text-foreground/85 leading-relaxed mb-3">
        {renderInline(block)}
      </p>,
    );
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-[11px] bg-secondary border border-border rounded px-1.5 py-0.5 text-syntax-attr"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return <strong key={`${i}-${j}`} className="font-semibold text-foreground">{bp.slice(2, -2)}</strong>;
      }
      return <span key={`${i}-${j}`}>{bp}</span>;
    });
  });
}
