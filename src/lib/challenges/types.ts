export type TestStatus = "pass" | "fail" | "error" | "skip";

export type TestResult = {
  id: string;
  name: string;
  status: TestStatus;
  message: string;
  hint?: string;
  runner: TestRunnerKind;
};

export type TestRunnerKind = "dom" | "html" | "css" | "javascript" | "a11y";

export type TestGroup = {
  id: string;
  name: string;
  runner: TestRunnerKind;
  results: TestResult[];
};

export type TestSuite = {
  id: string;
  startedAt: number;
  finishedAt: number;
  groups: TestGroup[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
  };
};

export type DomTestAssertion = {
  id: string;
  name: string;
  selector: string;
  type: "exists" | "count" | "text" | "attribute" | "class" | "nesting";
  expected?: string | number | boolean;
  attribute?: string;
  parentSelector?: string;
  hint?: string;
};

export type HtmlTestAssertion = {
  id: string;
  name: string;
  type: "doctype" | "meta" | "semantic" | "nesting" | "structure";
  selector?: string;
  expected?: string | number | boolean;
  hint?: string;
};

export type CssTestAssertion = {
  id: string;
  name: string;
  selector: string;
  property: string;
  expectedValue?: string;
  type?: "property" | "selector" | "media" | "animation";
  hint?: string;
};

export type JsTestAssertion = {
  id: string;
  name: string;
  type: "output" | "expression" | "function" | "variable" | "type";
  code?: string;
  expression?: string;
  expected?: unknown;
  fn?: string;
  args?: unknown[];
  variable?: string;
  hint?: string;
};

export type A11yTestAssertion = {
  id: string;
  name: string;
  type: "alt" | "label" | "role" | "heading-order" | "color-contrast" | "focus" | "form-label";
  selector?: string;
  hint?: string;
};

export type ChallengeTestConfig = {
  dom?: DomTestAssertion[];
  html?: HtmlTestAssertion[];
  css?: CssTestAssertion[];
  javascript?: JsTestAssertion[];
  a11y?: A11yTestAssertion[];
};

export function emptyTestSuite(id: string): TestSuite {
  return {
    id,
    startedAt: 0,
    finishedAt: 0,
    groups: [],
    summary: { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 },
  };
}

export function computeSummary(groups: TestGroup[]): TestSuite["summary"] {
  const summary = { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 };
  for (const group of groups) {
    for (const r of group.results) {
      summary.total++;
      if (r.status === "pass") summary.passed++;
      else if (r.status === "fail") summary.failed++;
      else if (r.status === "error") summary.errors++;
      else if (r.status === "skip") summary.skipped++;
    }
  }
  return summary;
}
