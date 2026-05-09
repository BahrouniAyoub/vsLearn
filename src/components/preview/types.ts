export type ConsoleMethod = "log" | "warn" | "error" | "info" | "debug";

export type ConsoleMessage = {
  id: string;
  method: ConsoleMethod;
  args: string[];
  timestamp: number;
};

export type RuntimeError = {
  message: string;
  stack?: string;
  lineno?: number;
  colno?: number;
  source?: string;
};

export type PreviewMessage =
  | { type: "console"; method: ConsoleMethod; args: string[]; timestamp: number }
  | { type: "error"; message: string; stack?: string; lineno?: number; colno?: number; source?: string; timestamp: number };

export function buildPreviewDocument(
  files: { path: string; content: string }[],
): string {
  const htmlFile = files.find((f) => /\.html?$/i.test(f.path));
  const cssFiles = files.filter((f) => /\.css$/i.test(f.path));
  const jsFiles = files.filter((f) => /\.js$/i.test(f.path));
  const bodyContent = htmlFile?.content ?? "";

  const bridgeScript = `
<script>
(function() {
  var methods = ['log','warn','error','info','debug'];
  methods.forEach(function(m) {
    var orig = console[m];
    console[m] = function() {
      var args = Array.prototype.slice.call(arguments).map(function(a) {
        try {
          return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
        } catch(e) { return String(a); }
      });
      try { parent.postMessage({ type:'console', method:m, args:args, timestamp:Date.now() }, '*'); } catch(e) {}
      try { orig.apply(console, arguments); } catch(e) {}
    };
  });
  window.onerror = function(msg, source, lineno, colno, err) {
    try {
      parent.postMessage({
        type:'error',
        message:String(msg),
        stack:err && err.stack ? err.stack : undefined,
        lineno:lineno,
        colno:colno,
        source:source,
        timestamp:Date.now()
      }, '*');
    } catch(e) {}
    return false;
  };
  window.addEventListener('unhandledrejection', function(event) {
    try {
      parent.postMessage({
        type:'error',
        message:'Unhandled Promise Rejection: ' + String(event.reason),
        stack:event.reason && event.reason.stack ? event.reason.stack : undefined,
        timestamp:Date.now()
      }, '*');
    } catch(e) {}
  });
})();
<\/script>`;

  const cssHtml = cssFiles
    .map((f) => `<style>/* ${f.path} */\n${f.content}\n</style>`)
    .join("\n");

  const jsHtml = jsFiles
    .map((f) => `<script>/* ${f.path} */\n${f.content}\n<\/script>`)
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${cssHtml}
</head>
<body>
${bodyContent}
${bridgeScript}
${jsHtml}
</body>
</html>`;
}

export function messageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
