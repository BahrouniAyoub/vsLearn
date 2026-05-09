import React from "react";

// Lightweight syntax highlighter — handles JS/TS/JSX/HTML/CSS well enough for lesson code.
// Returns React nodes with semantic token classes mapped to VS Code colors.

const KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while","do","switch","case",
  "break","continue","new","class","extends","import","export","from","default","async","await",
  "try","catch","finally","throw","typeof","instanceof","in","of","this","super","null","true","false",
  "void","undefined","interface","type","enum","public","private","protected","readonly","static","as"
]);

type Tok = { t: string; c?: string };

function tokenize(code: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    // line comment
    if (ch === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? code.length : end;
      out.push({ t: code.slice(i, stop), c: "comment" });
      i = stop;
      continue;
    }
    // block comment
    if (ch === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const stop = end === -1 ? code.length : end + 2;
      out.push({ t: code.slice(i, stop), c: "comment" });
      i = stop;
      continue;
    }
    // strings
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== ch) {
        if (code[j] === "\\") j += 2;
        else j++;
      }
      out.push({ t: code.slice(i, j + 1), c: "string" });
      i = j + 1;
      continue;
    }
    // numbers
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.]/.test(code[j])) j++;
      out.push({ t: code.slice(i, j), c: "number" });
      i = j;
      continue;
    }
    // identifier / keyword
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < code.length && /[A-Za-z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (KEYWORDS.has(word)) out.push({ t: word, c: "keyword" });
      else if (code[j] === "(") out.push({ t: word, c: "function" });
      else if (/^[A-Z]/.test(word)) out.push({ t: word, c: "tag" });
      else out.push({ t: word, c: "variable" });
      i = j;
      continue;
    }
    // operators / punctuation passthrough
    out.push({ t: ch });
    i++;
  }
  return out;
}

const colorMap: Record<string, string> = {
  keyword: "var(--syntax-keyword)",
  string: "var(--syntax-string)",
  number: "var(--syntax-number)",
  comment: "var(--syntax-comment)",
  function: "var(--syntax-function)",
  tag: "var(--syntax-tag)",
  variable: "var(--syntax-variable)",
};

export function Highlight({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} style={tok.c ? { color: colorMap[tok.c] } : undefined}>
          {tok.t}
        </span>
      ))}
    </>
  );
}

export function CodeBlock({ code, language = "js" }: { code: string; language?: string }) {
  const lines = code.split("\n");
  return (
    <pre className="font-mono text-[13px] leading-6 bg-editor border border-border rounded-md overflow-x-auto">
      <div className="flex">
        <div className="select-none py-3 px-3 text-right text-line-number bg-background/50 border-r border-border">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <code className="py-3 px-4 block flex-1">
          <Highlight code={code} />
        </code>
      </div>
    </pre>
  );
}
