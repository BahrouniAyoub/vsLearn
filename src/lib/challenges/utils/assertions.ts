import type { TestResult, TestRunnerKind } from "../types";

let _counter = 0;
function nextId(): string {
  return `t${++_counter}-${Date.now().toString(36)}`;
}

export function resetIdCounter() {
  _counter = 0;
}

function pass(name: string, runner: TestRunnerKind, message?: string): TestResult {
  return {
    id: nextId(),
    name,
    status: "pass",
    message: message ?? "Passed",
    runner,
  };
}

function fail(name: string, runner: TestRunnerKind, message: string, hint?: string): TestResult {
  return {
    id: nextId(),
    name,
    status: "fail",
    message,
    hint,
    runner,
  };
}

function error(name: string, runner: TestRunnerKind, message: string): TestResult {
  return {
    id: nextId(),
    name,
    status: "error",
    message,
    runner,
  };
}

function skip(name: string, runner: TestRunnerKind, message?: string): TestResult {
  return {
    id: nextId(),
    name,
    status: "skip",
    message: message ?? "Skipped",
    runner,
  };
}

export function assertElementExists(
  doc: Document,
  selector: string,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const el = doc.querySelector(selector);
    if (el) return pass(name, runner, `Found <${el.tagName.toLowerCase()}> matching "${selector}"`);
    return fail(name, runner, `Expected element matching "${selector}" but found none`, hint);
  } catch (e) {
    return error(name, runner, `Invalid selector "${selector}": ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertElementCount(
  doc: Document,
  selector: string,
  expected: number,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const els = doc.querySelectorAll(selector);
    if (els.length === expected) return pass(name, runner, `Found ${els.length} element(s) matching "${selector}"`);
    return fail(name, runner, `Expected ${expected} element(s) matching "${selector}", found ${els.length}`, hint);
  } catch (e) {
    return error(name, runner, `Invalid selector "${selector}": ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertTextContent(
  doc: Document,
  selector: string,
  expected: string | RegExp,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
  trim = true,
): TestResult {
  try {
    const el = doc.querySelector(selector);
    if (!el) return fail(name, runner, `Expected element matching "${selector}" but found none`, hint);
    const text = trim ? (el.textContent ?? "").trim() : (el.textContent ?? "");
    if (typeof expected === "string") {
      if (text === expected) return pass(name, runner, `Text content matches "${expected}"`);
      return fail(name, runner, `Expected text "${expected}", got "${text}"`, hint);
    }
    if (expected.test(text)) return pass(name, runner, `Text content matches pattern`);
    return fail(name, runner, `Text "${text}" does not match pattern`, hint);
  } catch (e) {
    return error(name, runner, `Error checking text content: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertAttribute(
  doc: Document,
  selector: string,
  attr: string,
  expected: string | boolean,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const el = doc.querySelector(selector);
    if (!el) return fail(name, runner, `Expected element matching "${selector}" but found none`, hint);
    const has = el.hasAttribute(attr);
    if (typeof expected === "boolean") {
      if (has === expected) return pass(name, runner, `Attribute "${attr}" ${expected ? "present" : "absent"}`);
      return fail(name, runner, `Expected attribute "${attr}" ${expected ? "present" : "absent"}`, hint);
    }
    const value = el.getAttribute(attr);
    if (value === expected) return pass(name, runner, `Attribute "${attr}" = "${expected}"`);
    return fail(name, runner, `Expected attribute "${attr}" = "${expected}", got "${value}"`, hint);
  } catch (e) {
    return error(name, runner, `Error checking attribute: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertClass(
  doc: Document,
  selector: string,
  className: string,
  expected: boolean,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const el = doc.querySelector(selector);
    if (!el) return fail(name, runner, `Expected element matching "${selector}" but found none`, hint);
    const has = el.classList.contains(className);
    if (has === expected) return pass(name, runner, `Class "${className}" ${expected ? "found" : "not found"}`);
    return fail(name, runner, `Expected class "${className}" ${expected ? "present" : "absent"}`, hint);
  } catch (e) {
    return error(name, runner, `Error checking class: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertCssProperty(
  cssText: string,
  selector: string,
  property: string,
  expectedValue: string | undefined,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const rulePattern = new RegExp(`${escapeRegex(selector)}\\s*\\{([^}]+)\\}`, "i");
    const match = cssText.match(rulePattern);
    if (!match) return fail(name, runner, `No CSS rule found for selector "${selector}"`, hint);
    const block = match[1];
    const propPattern = new RegExp(`${escapeRegex(property)}\\s*:\\s*([^;]+)`, "i");
    const propMatch = block.match(propPattern);
    if (!propMatch) return fail(name, runner, `Property "${property}" not found in rule for "${selector}"`, hint);
    const value = propMatch[1].trim();
    if (!expectedValue) return pass(name, runner, `Property "${property}" found with value "${value}"`);
    if (normalizeCss(value) === normalizeCss(expectedValue)) {
      return pass(name, runner, `Property "${property}" = "${expectedValue}"`);
    }
    return fail(name, runner, `Expected "${property}: ${expectedValue}", got "${property}: ${value}"`, hint);
  } catch (e) {
    return error(name, runner, `Error checking CSS: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertJsExpression(
  expression: string,
  expected: unknown,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const result = new Function(`return (${expression})`)();
    if (deepEqual(result, expected)) return pass(name, runner, `Expression evaluates to expected value`);
    return fail(name, runner, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`, hint);
  } catch (e) {
    return error(name, runner, `Error evaluating expression: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertJsFunction(
  fnBody: string,
  args: unknown[],
  expected: unknown,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const fn = new Function(`return ${fnBody}`)();
    const result = fn(...args);
    if (deepEqual(result, expected)) return pass(name, runner, `Function returns expected value`);
    return fail(name, runner, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`, hint);
  } catch (e) {
    return error(name, runner, `Error executing function: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertJsOutput(
  code: string,
  expected: unknown,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const logs: unknown[] = [];
    const sandbox = { console: { log: (...args: unknown[]) => logs.push(...args) } };
    new Function("console", code)(sandbox.console);
    if (logs.length === 0) return fail(name, runner, "No output produced", hint);
    const output = logs.length === 1 ? logs[0] : logs;
    if (deepEqual(output, expected)) return pass(name, runner, `Output matches expected`);
    return fail(name, runner, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(output)}`, hint);
  } catch (e) {
    return error(name, runner, `Error executing code: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertAria(
  doc: Document,
  selector: string,
  role: string | undefined,
  label: string | undefined,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const el = doc.querySelector(selector);
    if (!el) return fail(name, runner, `Expected element matching "${selector}" but found none`, hint);
    if (role) {
      const actualRole = el.getAttribute("role") ?? el.tagName.toLowerCase();
      if (actualRole !== role) return fail(name, runner, `Expected role "${role}", got "${actualRole}"`, hint);
    }
    if (label) {
      const actualLabel = el.getAttribute("aria-label") ?? "";
      if (!actualLabel || !actualLabel.toLowerCase().includes(label.toLowerCase())) {
        return fail(name, runner, `Expected aria-label containing "${label}", got "${actualLabel}"`, hint);
      }
    }
    return pass(name, runner, `Accessibility check passed`);
  } catch (e) {
    return error(name, runner, `Error checking a11y: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertAltText(
  doc: Document,
  selector: string,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const imgs = selector ? doc.querySelectorAll(selector) : doc.querySelectorAll("img");
    if (imgs.length === 0) return fail(name, runner, "No images found to check", hint);
    for (const img of imgs) {
      const alt = img.getAttribute("alt");
      if (alt === null) return fail(name, runner, `<img> is missing alt attribute`, hint);
      if (alt.trim() === "") return fail(name, runner, `<img> has empty alt text (only valid for decorative images)`, hint);
    }
    return pass(name, runner, `All images have alt text`);
  } catch (e) {
    return error(name, runner, `Error checking alt text: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertHeadingOrder(
  doc: Document,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let lastLevel = 0;
    for (const h of headings) {
      const level = parseInt(h.tagName[1], 10);
      if (level - lastLevel > 1) return fail(name, runner, `Heading order skipped from h${lastLevel} to h${level}`, hint);
      lastLevel = level;
    }
    if (headings.length === 0) return fail(name, runner, "No headings found", hint);
    return pass(name, runner, `Heading order is valid`);
  } catch (e) {
    return error(name, runner, `Error checking headings: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function assertFormLabels(
  doc: Document,
  name: string,
  runner: TestRunnerKind,
  hint?: string,
): TestResult {
  try {
    const inputs = doc.querySelectorAll("input, select, textarea");
    if (inputs.length === 0) return pass(name, runner, "No form inputs to check");
    let allLabelled = true;
    for (const input of inputs) {
      const id = input.getAttribute("id");
      const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
      const hasAria = input.getAttribute("aria-label") || input.getAttribute("aria-labelledby");
      if (!hasLabel && !hasAria) {
        allLabelled = false;
      }
    }
    if (allLabelled) return pass(name, runner, "All form inputs have associated labels");
    return fail(name, runner, "Some form inputs are missing labels", hint);
  } catch (e) {
    return error(name, runner, `Error checking form labels: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCss(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\s*([:;,])\s*/g, "$1").trim().toLowerCase();
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return false;
}

export function parseHtmlDocument(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export function extractHtmlContent(files: { path: string; content: string }[]): string {
  const htmlFile = files.find((f) => /\.html?$/i.test(f.path));
  return htmlFile?.content ?? "";
}

export function extractCssContent(files: { path: string; content: string }[]): string {
  return files
    .filter((f) => /\.css$/i.test(f.path))
    .map((f) => f.content)
    .join("\n");
}

export function extractJsContent(files: { path: string; content: string }[]): string {
  return files
    .filter((f) => /\.js$/i.test(f.path))
    .map((f) => f.content)
    .join("\n");
}
