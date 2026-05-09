import type { JsTestAssertion, TestGroup, TestResult } from "../types";
import { assertJsExpression, assertJsFunction, assertJsOutput } from "../utils/assertions";

let _counter = 0;
function id(): string {
  return `js-${++_counter}-${Date.now().toString(36)}`;
}

export function runJsTests(code: string, assertions: JsTestAssertion[]): TestGroup {
  const results: TestResult[] = [];

  for (const a of assertions) {
    switch (a.type) {
      case "output":
        results.push(assertJsOutput(code, a.expected, a.name, "javascript", a.hint));
        break;
      case "expression":
        results.push(assertJsExpression(a.expression ?? "", a.expected, a.name, "javascript", a.hint));
        break;
      case "function": {
        const fnName = a.fn ?? "";
        const fnPattern = new RegExp(
          `(?:function\\s+${escapeRegex(fnName)}|const\\s+${escapeRegex(fnName)}\\s*=\\s*(?:\\([^)]*\\)|[^=]+)=>|let\\s+${escapeRegex(fnName)}\\s*=|var\\s+${escapeRegex(fnName)}\\s*=|${escapeRegex(fnName)}\\s*=\\s*(?:function|(?:\\([^)]*\\)|[^=]+)=>))`,
        );
        if (!fnPattern.test(code)) {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Function "${fnName}" not found in code`,
            hint: a.hint ?? `Define a function named "${fnName}"`,
            runner: "javascript",
          });
          break;
        }
        try {
          const logs: unknown[] = [];
          const sandbox = { console: { log: (...args: unknown[]) => logs.push(...args) } };
          new Function("console", code)(sandbox.console);
          const fnMatch = code.match(
            new RegExp(
              `(?:function\\s+${escapeRegex(fnName)}\\s*\\([^)]*\\)|const\\s+${escapeRegex(fnName)}\\s*=\\s*(?:\\([^)]*\\)|[^=]+)=>|let\\s+${escapeRegex(fnName)}\\s*=|var\\s+${escapeRegex(fnName)}\\s*=|${escapeRegex(fnName)}\\s*=\\s*(?:function|(?:\\([^)]*\\)|[^=]+)=>))([^]*?)(?:\\n\\S|$)`,
            ),
          );
          const fn = fnMatch
            ? new Function(`return ${fnMatch[0].replace(/^(const|let|var)\s+/, "")}`)()
            : null;
          if (fn && typeof fn === "function") {
            const result = fn(...(a.args ?? []));
            if (a.expected !== undefined) {
              const eq = JSON.stringify(result) === JSON.stringify(a.expected);
              if (eq) {
                results.push({ id: id(), name: a.name, status: "pass", message: `Function returns expected value`, runner: "javascript" });
              } else {
                results.push({
                  id: id(),
                  name: a.name,
                  status: "fail",
                  message: `Expected ${JSON.stringify(a.expected)}, got ${JSON.stringify(result)}`,
                  hint: a.hint,
                  runner: "javascript",
                });
              }
            } else {
              results.push({ id: id(), name: a.name, status: "pass", message: `Function "${fnName}" executed`, runner: "javascript" });
            }
          } else {
            results.push({ id: id(), name: a.name, status: "pass", message: `Function "${fnName}" found in code`, runner: "javascript" });
          }
        } catch (e) {
          results.push({
            id: id(),
            name: a.name,
            status: "error",
            message: `Error testing function: ${e instanceof Error ? e.message : String(e)}`,
            runner: "javascript",
          });
        }
        break;
      }
      case "variable": {
        const varName = a.variable ?? "";
        try {
          const logs: unknown[] = [];
          const sandbox = { console: { log: (...args: unknown[]) => logs.push(...args) } };
          new Function("console", `(${code}); console.log(${varName});`)(sandbox.console);
          results.push({ id: id(), name: a.name, status: "pass", message: `Variable "${varName}" exists`, runner: "javascript" });
        } catch {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Variable "${varName}" not found`,
            hint: a.hint ?? `Declare a variable named "${varName}"`,
            runner: "javascript",
          });
        }
        break;
      }
      case "type": {
        const varName = a.variable ?? "";
        try {
          const logs: unknown[] = [];
          const sandbox = { console: { log: (...args: unknown[]) => logs.push(...args) } };
          new Function("console", `(${code}); console.log(typeof ${varName});`)(sandbox.console);
          const actualType = logs[0];
          if (actualType === a.expected) {
            results.push({ id: id(), name: a.name, status: "pass", message: `typeof "${varName}" = "${a.expected}"`, runner: "javascript" });
          } else {
            results.push({
              id: id(),
              name: a.name,
              status: "fail",
              message: `Expected typeof "${varName}" = "${a.expected}", got "${actualType}"`,
              hint: a.hint,
              runner: "javascript",
            });
          }
        } catch {
          results.push({
            id: id(),
            name: a.name,
            status: "fail",
            message: `Variable "${varName}" not found for type check`,
            hint: a.hint,
            runner: "javascript",
          });
        }
        break;
      }
      default: {
        results.push({
          id: id(),
          name: a.name,
          status: "skip",
          message: `Unknown JS assertion type: ${a.type}`,
          runner: "javascript",
        });
      }
    }
  }

  return {
    id: "javascript-tests",
    name: "JavaScript Tests",
    runner: "javascript",
    results,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
