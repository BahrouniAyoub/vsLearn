import { z } from "zod";

import { lessonFrontmatterSchema } from "./schemas";
import type { ParsedMdxLesson } from "./types";

const frontmatterBlock = /^---\n([\s\S]*?)\n---\n?/;

export function parseMdxLesson(raw: string): ParsedMdxLesson {
  const match = raw.match(frontmatterBlock);
  if (!match) {
    throw new Error("Lesson MDX must start with YAML-like frontmatter.");
  }

  const frontmatter = parseSimpleFrontmatter(match[1]);
  return {
    frontmatter: lessonFrontmatterSchema.parse(frontmatter),
    body: raw.slice(match[0].length),
    raw,
  };
}

function parseSimpleFrontmatter(input: string): Record<string, unknown> {
  return input.split("\n").reduce<Record<string, unknown>>((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;

    const separator = trimmed.indexOf(":");
    if (separator === -1) return acc;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    acc[key] = coerceFrontmatterValue(value);
    return acc;
  }, {});
}

function coerceFrontmatterValue(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function assertContentValid<T>(schema: z.ZodType<T>, value: unknown, path: string): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Invalid content at ${path}: ${parsed.error.message}`);
  }
  return parsed.data;
}
