import type { CssTestAssertion, TestGroup, TestResult } from "../types";
import { assertCssProperty } from "../utils/assertions";

let _counter = 0;
function id(): string {
  return `css-${++_counter}-${Date.now().toString(36)}`;
}

export function runCssTests(cssContent: string, assertions: CssTestAssertion[]): TestGroup {
  const results: TestResult[] = [];

  for (const a of assertions) {
    switch (a.type ?? "property") {
      case "property":
      case "selector": {
        results.push(assertCssProperty(cssContent, a.selector, a.property, a.expectedValue, a.name, "css", a.hint));
        break;
      }
      case "media": {
        const mediaPattern = /@media\s+([^{]+)\{/gi;
        let found = false;
        let match;
        while ((match = mediaPattern.exec(cssContent)) !== null) {
          if (match[1].trim().toLowerCase().includes((a.expectedValue ?? "").toLowerCase())) {
            found = true;
            break;
          }
        }
        if (found) {
          results.push({ id: id(), name: a.name, status: "pass", message: `Media query found`, runner: "css" });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Expected media query matching "${a.expectedValue}" not found`,
            hint: a.hint,
            runner: "css",
          });
        }
        break;
      }
      case "animation": {
        const namePattern = /@keyframes\s+([a-zA-Z0-9_-]+)/gi;
        let found = false;
        let match;
        while ((match = namePattern.exec(cssContent)) !== null) {
          if (match[1] === a.expectedValue) {
            found = true;
            break;
          }
        }
        if (found) {
          results.push({
            id: id(),
            name: a.name,
            status: "pass",
            message: `@keyframes "${a.expectedValue}" found`,
            runner: "css",
          });
        } else {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Expected @keyframes "${a.expectedValue}" not found`,
            hint: a.hint,
            runner: "css",
          });
        }
        break;
      }
      default: {
        results.push({
          id: id(),
          name: a.name,
          status: "skip",
          message: `Unknown CSS assertion type: ${a.type}`,
          runner: "css",
        });
      }
    }
  }

  return {
    id: "css-tests",
    name: "CSS Tests",
    runner: "css",
    results,
  };
}
