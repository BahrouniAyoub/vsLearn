import { describe, expect, it } from "vitest";

declare global {
  var __submittedFiles: Record<string, string> | undefined;
}

describe("semantic profile card", () => {
  it("uses semantic landmarks", async () => {
    const html = await readSubmittedFile("index.html");

    expect(html).toContain("<header");
    expect(html).toContain("<main");
    expect(html).toContain("<section");
    expect(html).toContain("<footer");
  });
});

async function readSubmittedFile(path: string) {
  return globalThis.__submittedFiles?.[path] ?? "";
}
