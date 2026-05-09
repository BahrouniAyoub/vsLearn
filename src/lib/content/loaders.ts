import {
  challengeSchema,
  contentFileSchema,
  courseMetadataSchema,
  moduleMetadataSchema,
} from "./schemas";
import { assertContentValid, parseMdxLesson } from "./mdx";
import type {
  Challenge,
  ContentFile,
  CourseContent,
  CourseLesson,
  CourseMetadata,
  CourseModule,
  ModuleMetadata,
} from "./types";

type JsonModule = { default?: unknown } | unknown;

const courseMetadataModules = import.meta.glob("../../../content/courses/*/course.json", {
  eager: true,
});

const moduleMetadataModules = import.meta.glob("../../../content/courses/*/modules/*/module.json", {
  eager: true,
});

const lessonMdxModules = import.meta.glob(
  "../../../content/courses/*/modules/*/lessons/*/lesson.mdx",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

const challengeModules = import.meta.glob(
  "../../../content/courses/*/modules/*/lessons/*/challenge.json",
  {
    eager: true,
  },
);

const starterFileModules = import.meta.glob(
  "../../../content/courses/*/modules/*/lessons/*/starter/**/*",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

const solutionFileModules = import.meta.glob(
  "../../../content/courses/*/modules/*/lessons/*/solution/**/*",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

const testFileModules = import.meta.glob(
  "../../../content/courses/*/modules/*/lessons/*/tests/**/*",
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

export function listCourseMetadata(): CourseMetadata[] {
  return Object.entries(courseMetadataModules)
    .map(([path, module]) => parseCourseMetadata(path, module))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getCourseContent(courseSlug: string): CourseContent | null {
  const courseEntry = Object.entries(courseMetadataModules).find(
    ([path]) => parseCoursePath(path)?.courseSlug === courseSlug,
  );
  if (!courseEntry) return null;

  const course = parseCourseMetadata(courseEntry[0], courseEntry[1]);
  const modules = course.modules
    .map((moduleSlug) => getCourseModule(course.slug, moduleSlug))
    .filter((module): module is CourseModule => Boolean(module));

  return { ...course, modules };
}

export function getCourseModule(courseSlug: string, moduleSlug: string): CourseModule | null {
  const moduleEntry = Object.entries(moduleMetadataModules).find(([path]) => {
    const parsed = parseModulePath(path);
    return parsed?.courseSlug === courseSlug && parsed.moduleSlug === moduleSlug;
  });
  if (!moduleEntry) return null;

  const metadata = parseModuleMetadata(moduleEntry[0], moduleEntry[1]);
  const lessons = metadata.lessons
    .map((lessonSlug) => getCourseLesson(courseSlug, moduleSlug, lessonSlug))
    .filter((lesson): lesson is CourseLesson => Boolean(lesson));

  return { ...metadata, courseSlug, lessons };
}

export function getCourseLesson(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): CourseLesson | null {
  const lessonEntry = Object.entries(lessonMdxModules).find(([path]) => {
    const parsed = parseLessonPath(path);
    return (
      parsed?.courseSlug === courseSlug &&
      parsed.moduleSlug === moduleSlug &&
      parsed.lessonSlug === lessonSlug
    );
  });
  if (!lessonEntry) return null;

  const raw = readRawModule(lessonEntry[1], lessonEntry[0]);
  const lesson = parseMdxLesson(raw);

  return {
    ...lesson,
    courseSlug,
    moduleSlug,
    slug: lessonSlug,
    challenge: getChallenge(courseSlug, moduleSlug, lessonSlug),
    starterFiles: getContentFiles(
      starterFileModules,
      courseSlug,
      moduleSlug,
      lessonSlug,
      "starter",
    ),
    solutionFiles: getContentFiles(
      solutionFileModules,
      courseSlug,
      moduleSlug,
      lessonSlug,
      "solution",
    ),
    testFiles: getContentFiles(testFileModules, courseSlug, moduleSlug, lessonSlug, "tests"),
  };
}

export function listCourseLessons(courseSlug: string): CourseLesson[] {
  const course = getCourseContent(courseSlug);
  return course?.modules.flatMap((module) => module.lessons) ?? [];
}

function getChallenge(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Challenge | null {
  const challengeEntry = Object.entries(challengeModules).find(([path]) => {
    const parsed = parseLessonAssetPath(path, "challenge.json");
    return (
      parsed?.courseSlug === courseSlug &&
      parsed.moduleSlug === moduleSlug &&
      parsed.lessonSlug === lessonSlug
    );
  });
  if (!challengeEntry) return null;

  return assertContentValid(
    challengeSchema,
    unwrapJsonModule(challengeEntry[1]),
    challengeEntry[0],
  );
}

function getContentFiles(
  modules: Record<string, unknown>,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
  directory: "starter" | "solution" | "tests",
): ContentFile[] {
  return Object.entries(modules)
    .map(([path, module]) => {
      const parsed = parseLessonAssetPath(path, `${directory}/`);
      if (
        !parsed ||
        parsed.courseSlug !== courseSlug ||
        parsed.moduleSlug !== moduleSlug ||
        parsed.lessonSlug !== lessonSlug
      )
        return null;

      return assertContentValid(
        contentFileSchema,
        {
          path: parsed.assetPath,
          content: readRawModule(module, path),
          language: inferLanguage(parsed.assetPath),
        },
        path,
      );
    })
    .filter((file): file is ContentFile => Boolean(file))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function parseCourseMetadata(path: string, module: JsonModule): CourseMetadata {
  return assertContentValid(courseMetadataSchema, unwrapJsonModule(module), path);
}

function parseModuleMetadata(path: string, module: JsonModule): ModuleMetadata {
  return assertContentValid(moduleMetadataSchema, unwrapJsonModule(module), path);
}

function unwrapJsonModule(module: JsonModule) {
  if (module && typeof module === "object" && "default" in module)
    return (module as { default: unknown }).default;
  return module;
}

function readRawModule(module: unknown, path: string) {
  if (typeof module !== "string") throw new Error(`Expected raw string content at ${path}`);
  return module;
}

function parseCoursePath(path: string) {
  const match = path.match(/content\/courses\/([^/]+)\/course\.json$/);
  return match ? { courseSlug: match[1] } : null;
}

function parseModulePath(path: string) {
  const match = path.match(/content\/courses\/([^/]+)\/modules\/([^/]+)\/module\.json$/);
  return match ? { courseSlug: match[1], moduleSlug: match[2] } : null;
}

function parseLessonPath(path: string) {
  const match = path.match(
    /content\/courses\/([^/]+)\/modules\/([^/]+)\/lessons\/([^/]+)\/lesson\.mdx$/,
  );
  return match ? { courseSlug: match[1], moduleSlug: match[2], lessonSlug: match[3] } : null;
}

function parseLessonAssetPath(path: string, marker: string) {
  const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = path.match(
    new RegExp(`content/courses/([^/]+)/modules/([^/]+)/lessons/([^/]+)/${escapedMarker}(.+)?$`),
  );
  if (!match) return null;
  return {
    courseSlug: match[1],
    moduleSlug: match[2],
    lessonSlug: match[3],
    assetPath: match[4] ?? marker,
  };
}

function inferLanguage(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    css: "css",
    html: "html",
    js: "javascript",
    json: "json",
    md: "markdown",
    mdx: "mdx",
    ts: "typescript",
    tsx: "tsx",
  };
  return languageMap[extension ?? ""] ?? "text";
}
