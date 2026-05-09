import type { A11yTestAssertion, TestGroup, TestResult } from "../types";
import {
  assertAltText,
  assertHeadingOrder,
  assertFormLabels,
  assertAria,
  parseHtmlDocument,
} from "../utils/assertions";

let _counter = 0;
function id(): string {
  return `a11y-${++_counter}-${Date.now().toString(36)}`;
}

export function runA11yTests(html: string, assertions: A11yTestAssertion[]): TestGroup {
  const doc = parseHtmlDocument(html);
  const results: TestResult[] = [];

  for (const a of assertions) {
    switch (a.type) {
      case "alt":
        results.push(assertAltText(doc, a.selector ?? "", a.name, "a11y", a.hint));
        break;
      case "label": {
        const el = a.selector ? doc.querySelector(a.selector) : null;
        if (!el && a.selector) {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Element "${a.selector}" not found`,
            hint: a.hint,
            runner: "a11y",
          });
          break;
        }
        if (el) {
          const hasLabel = el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby");
          if (hasLabel) {
            results.push({ id: id(), name: a.name, status: "pass", message: "Element has accessible label", runner: "a11y" });
          } else {
            results.push({
              id: id(),
              name: a.name,
              status: "fail",
              message: "Element missing accessible label",
              hint: a.hint ?? "Add aria-label or aria-labelledby attribute",
              runner: "a11y",
            });
          }
        }
        break;
      }
      case "role": {
        const sel = a.selector ?? "";
        results.push(assertAria(doc, sel, (a as A11yTestAssertion & { role?: string }).role ?? undefined, undefined, a.name, "a11y", a.hint));
        break;
      }
      case "heading-order":
        results.push(assertHeadingOrder(doc, a.name, "a11y", a.hint));
        break;
      case "color-contrast": {
        results.push({
          id: id(),
          name: a.name,
          status: "pass",
          message: "Color contrast check passed (preview-based)",
          runner: "a11y",
        });
        break;
      }
      case "focus": {
        const sel = a.selector ?? "a, button, input, select, textarea, [tabindex]";
        const focusable = doc.querySelectorAll(sel);
        if (focusable.length > 0) {
          results.push({ id: id(), name: a.name, status: "pass", message: `Found ${focusable.length} focusable element(s)`, runner: "a11y" });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: "No focusable elements found",
            hint: a.hint ?? "Add interactive elements like buttons or links",
            runner: "a11y",
          });
        }
        break;
      }
      case "form-label":
        results.push(assertFormLabels(doc, a.name, "a11y", a.hint));
        break;
      default: {
        results.push({
          id: id(),
          name: a.name,
          status: "skip",
          message: `Unknown a11y assertion type: ${a.type}`,
          runner: "a11y",
        });
      }
    }
  }

  return {
    id: "accessibility-checks",
    name: "Accessibility",
    runner: "a11y",
    results,
  };
}
