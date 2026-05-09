import type { HtmlTestAssertion, TestGroup, TestResult } from "../types";
import { parseHtmlDocument } from "../utils/assertions";

let _counter = 0;
function id(): string {
  return `html-${++_counter}-${Date.now().toString(36)}`;
}

export function runHtmlTests(html: string, assertions: HtmlTestAssertion[]): TestGroup {
  const doc = parseHtmlDocument(html);
  const results: TestResult[] = [];

  for (const a of assertions) {
    switch (a.type) {
      case "doctype": {
        const hasDoctype = /^<!DOCTYPE\s+html/i.test(html.trim());
        if (hasDoctype) {
          results.push({ id: id(), name: a.name, status: "pass", message: "DOCTYPE html declared", runner: "html" });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: "Missing DOCTYPE html declaration",
            hint: a.hint ?? "Add <!DOCTYPE html> at the top of your HTML file",
            runner: "html",
          });
        }
        break;
      }
      case "meta": {
        const selector = a.selector ?? "meta";
        const els = doc.querySelectorAll(selector);
        if (els.length > 0) {
          results.push({ id: id(), name: a.name, status: "pass", message: `Found <${selector}>`, runner: "html" });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Expected <${selector}> not found`,
            hint: a.hint,
            runner: "html",
          });
        }
        break;
      }
      case "semantic": {
        const sel = a.selector ?? "";
        const el = doc.querySelector(sel);
        if (el) {
          results.push({ id: id(), name: a.name, status: "pass", message: `Found <${sel}> element`, runner: "html" });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Expected semantic element <${sel}> not found`,
            hint: a.hint ?? `Use the <${sel}> element for semantic HTML`,
            runner: "html",
          });
        }
        break;
      }
      case "nesting": {
        const sel = a.selector ?? "";
        const el = doc.querySelector(sel);
        if (el) {
          results.push({ id: id(), name: a.name, status: "pass", message: `Valid nesting: found ${sel}`, runner: "html" });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Invalid nesting: expected ${sel}`,
            hint: a.hint,
            runner: "html",
          });
        }
        break;
      }
      case "structure": {
        const sel = a.selector ?? "";
        const expectedCount = (a.expected as number) ?? 1;
        const els = doc.querySelectorAll(sel);
        if (els.length >= expectedCount) {
          results.push({
            id: id(),
            name: a.name,
            status: "pass",
            message: `Found ${els.length} element(s) matching "${sel}" (expected ≥${expectedCount})`,
            runner: "html",
          });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Expected ≥${expectedCount} element(s) matching "${sel}", found ${els.length}`,
            hint: a.hint,
            runner: "html",
          });
        }
        break;
      }
      default: {
        results.push({
          id: id(),
          name: a.name,
          status: "skip",
          message: `Unknown HTML assertion type: ${a.type}`,
          runner: "html",
        });
      }
    }
  }

  return {
    id: "html-structure",
    name: "HTML Structure",
    runner: "html",
    results,
  };
}
