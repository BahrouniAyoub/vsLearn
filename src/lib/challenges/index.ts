export { runChallengeTests } from "./engine";
export type { RunOptions } from "./engine";

export { validationToConfig, lessonToTestConfig } from "./convert";

export type {
  TestStatus,
  TestResult,
  TestRunnerKind,
  TestGroup,
  TestSuite,
  DomTestAssertion,
  HtmlTestAssertion,
  CssTestAssertion,
  JsTestAssertion,
  A11yTestAssertion,
  ChallengeTestConfig,
} from "./types";
export { emptyTestSuite, computeSummary } from "./types";

export {
  assertElementExists,
  assertElementCount,
  assertTextContent,
  assertAttribute,
  assertClass,
  assertCssProperty,
  assertJsExpression,
  assertJsFunction,
  assertJsOutput,
  assertAria,
  assertAltText,
  assertHeadingOrder,
  assertFormLabels,
  parseHtmlDocument,
  extractHtmlContent,
  extractCssContent,
  extractJsContent,
} from "./utils/assertions";

export { runDomTests } from "./runners/dom";
export { runHtmlTests } from "./runners/html";
export { runCssTests } from "./runners/css";
export { runJsTests } from "./runners/javascript";
export { runA11yTests } from "./runners/a11y";
