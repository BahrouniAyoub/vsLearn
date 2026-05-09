import type { ChallengeTestConfig, TestSuite, TestGroup } from "./types";
import { emptyTestSuite, computeSummary } from "./types";
import { runDomTests } from "./runners/dom";
import { runHtmlTests } from "./runners/html";
import { runCssTests } from "./runners/css";
import { runJsTests } from "./runners/javascript";
import { runA11yTests } from "./runners/a11y";
import { extractHtmlContent, extractCssContent, extractJsContent, resetIdCounter } from "./utils/assertions";

export type RunOptions = {
  files: { path: string; content: string }[];
  config: ChallengeTestConfig;
  suiteId?: string;
};

export function runChallengeTests(options: RunOptions): TestSuite {
  const { files, config } = options;
  const suiteId = options.suiteId ?? `suite-${Date.now()}`;

  resetIdCounter();

  const startedAt = Date.now();
  const groups: TestGroup[] = [];

  const html = extractHtmlContent(files);
  const css = extractCssContent(files);
  const js = extractJsContent(files);

  if (config.dom && config.dom.length > 0) {
    try {
      groups.push(runDomTests(html, config.dom));
    } catch (e) {
      groups.push({
        id: "dom-tests",
        name: "DOM Tests",
        runner: "dom",
        results: [{
          id: `err-${Date.now()}`,
          name: "DOM Test Runner",
          status: "error",
          message: `DOM test runner crashed: ${e instanceof Error ? e.message : String(e)}`,
          runner: "dom",
        }],
      });
    }
  }

  if (config.html && config.html.length > 0) {
    try {
      groups.push(runHtmlTests(html, config.html));
    } catch (e) {
      groups.push({
        id: "html-structure",
        name: "HTML Structure",
        runner: "html",
        results: [{
          id: `err-${Date.now()}`,
          name: "HTML Test Runner",
          status: "error",
          message: `HTML test runner crashed: ${e instanceof Error ? e.message : String(e)}`,
          runner: "html",
        }],
      });
    }
  }

  if (config.css && config.css.length > 0) {
    try {
      groups.push(runCssTests(css, config.css));
    } catch (e) {
      groups.push({
        id: "css-tests",
        name: "CSS Tests",
        runner: "css",
        results: [{
          id: `err-${Date.now()}`,
          name: "CSS Test Runner",
          status: "error",
          message: `CSS test runner crashed: ${e instanceof Error ? e.message : String(e)}`,
          runner: "css",
        }],
      });
    }
  }

  if (config.javascript && config.javascript.length > 0) {
    try {
      groups.push(runJsTests(js, config.javascript));
    } catch (e) {
      groups.push({
        id: "javascript-tests",
        name: "JavaScript Tests",
        runner: "javascript",
        results: [{
          id: `err-${Date.now()}`,
          name: "JS Test Runner",
          status: "error",
          message: `JS test runner crashed: ${e instanceof Error ? e.message : String(e)}`,
          runner: "javascript",
        }],
      });
    }
  }

  if (config.a11y && config.a11y.length > 0) {
    try {
      groups.push(runA11yTests(html, config.a11y));
    } catch (e) {
      groups.push({
        id: "accessibility-checks",
        name: "Accessibility",
        runner: "a11y",
        results: [{
          id: `err-${Date.now()}`,
          name: "A11y Test Runner",
          status: "error",
          message: `Accessibility test runner crashed: ${e instanceof Error ? e.message : String(e)}`,
          runner: "a11y",
        }],
      });
    }
  }

  const finishedAt = Date.now();

  return {
    id: suiteId,
    startedAt,
    finishedAt,
    groups,
    summary: computeSummary(groups),
  };
}
