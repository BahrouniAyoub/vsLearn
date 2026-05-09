import type {
  ChallengeTestConfig,
  DomTestAssertion,
  HtmlTestAssertion,
  CssTestAssertion,
  JsTestAssertion,
  A11yTestAssertion,
} from "./types";
import type { ChallengeValidation } from "@/lib/content";

export function validationToConfig(validation: ChallengeValidation | null | undefined): ChallengeTestConfig | null {
  if (!validation) return null;

  const config: ChallengeTestConfig = {};

  if (validation.dom && validation.dom.length > 0) {
    config.dom = validation.dom as DomTestAssertion[];
  }

  if (validation.html && validation.html.length > 0) {
    config.html = validation.html as HtmlTestAssertion[];
  }

  if (validation.css && validation.css.length > 0) {
    config.css = validation.css.map((a) => ({
      ...a,
      type: (a.type ?? "property") as CssTestAssertion["type"],
    })) as CssTestAssertion[];
  }

  if (validation.javascript && validation.javascript.length > 0) {
    config.javascript = validation.javascript as JsTestAssertion[];
  }

  if (validation.a11y && validation.a11y.length > 0) {
    config.a11y = validation.a11y as A11yTestAssertion[];
  }

  return config;
}

export function lessonToTestConfig(
  lessonType: string,
  files: { path: string; content: string }[],
  expectedOutput?: string,
  validation?: ChallengeValidation | null,
): ChallengeTestConfig | null {
  if (validation) {
    return validationToConfig(validation);
  }

  const config: ChallengeTestConfig = {};

  const hasHtml = files.some((f) => /\.html?$/i.test(f.path));
  const hasCss = files.some((f) => /\.css$/i.test(f.path));
  const hasJs = files.some((f) => /\.js$/i.test(f.path));

  if (hasHtml) {
    config.html = [
      {
        id: "html-doctype",
        name: "DOCTYPE declaration",
        type: "doctype",
        hint: "Add <!DOCTYPE html> at the top of your file",
      } as HtmlTestAssertion,
      {
        id: "html-meta-viewport",
        name: "Viewport meta tag",
        type: "meta",
        selector: "meta[name='viewport']",
        hint: "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
      } as HtmlTestAssertion,
      {
        id: "html-title",
        name: "Page title",
        type: "meta",
        selector: "title",
        hint: "Add a <title> element in the <head>",
      } as HtmlTestAssertion,
      {
        id: "html-body-structure",
        name: "Body element",
        type: "structure",
        selector: "body",
        hint: "Wrap your content in <body> tags",
      } as HtmlTestAssertion,
    ];

    config.dom = [
      {
        id: "dom-head",
        name: "Head section",
        selector: "head",
        type: "exists",
        hint: "Add a <head> element",
      } as DomTestAssertion,
    ];
  }

  if (hasCss) {
    config.css = [
      {
        id: "css-file-loaded",
        name: "CSS styles present",
        selector: "",
        property: "",
        type: "selector",
        hint: "Add CSS rules to your stylesheet",
      } as CssTestAssertion,
    ];
  }

  if (expectedOutput && hasJs) {
    config.javascript = [
      {
        id: "js-output",
        name: "Expected output",
        type: "output",
        expected: expectedOutput,
        hint: `Your code should output: ${expectedOutput}`,
      } as JsTestAssertion,
    ];
  }

  return config;
}
