import type { DomTestAssertion, TestGroup, TestResult } from "../types";
import {
  assertElementExists,
  assertElementCount,
  assertTextContent,
  assertAttribute,
  assertClass,
  parseHtmlDocument,
} from "../utils/assertions";

export function runDomTests(html: string, assertions: DomTestAssertion[]): TestGroup {
  const doc = parseHtmlDocument(html);
  const results: TestResult[] = [];

  for (const a of assertions) {
    switch (a.type) {
      case "exists":
        results.push(assertElementExists(doc, a.selector, a.name, "dom", a.hint));
        break;
      case "count":
        results.push(assertElementCount(doc, a.selector, (a.expected as number) ?? 1, a.name, "dom", a.hint));
        break;
      case "text":
        results.push(
          assertTextContent(
            doc,
            a.selector,
            a.expected as string | RegExp,
            a.name,
            "dom",
            a.hint,
          ),
        );
        break;
      case "attribute":
        results.push(
          assertAttribute(
            doc,
            a.selector,
            a.attribute ?? "",
            a.expected as string | boolean,
            a.name,
            "dom",
            a.hint,
          ),
        );
        break;
      case "class":
        results.push(
          assertClass(
            doc,
            a.selector,
            a.expected as string,
            true,
            a.name,
            "dom",
            a.hint,
          ),
        );
        break;
      case "nesting": {
        const parent = a.parentSelector ? doc.querySelector(a.parentSelector) : doc;
        if (!parent) {
          results.push({
            id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: a.name,
            status: "fail",
            message: `Parent element "${a.parentSelector}" not found`,
            hint: a.hint,
            runner: "dom",
          });
          break;
        }
        const child = parent.querySelector(a.selector);
        if (child) {
          results.push({
            id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: a.name,
            status: "pass",
            message: `Found <${child.tagName.toLowerCase()}> within parent`,
            runner: "dom",
          });
        } else {
          results.push({
            id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: a.name,
            status: "fail",
            message: `Expected "${a.selector}" inside "${a.parentSelector}"`,
            hint: a.hint,
            runner: "dom",
          });
        }
        break;
      }
      default: {
        results.push({
          id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: a.name,
          status: "skip",
          message: `Unknown DOM assertion type: ${a.type}`,
          runner: "dom",
        });
      }
    }
  }

  return {
    id: "dom-tests",
    name: "DOM Tests",
    runner: "dom",
    results,
  };
}
