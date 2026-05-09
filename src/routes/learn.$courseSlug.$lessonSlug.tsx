import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Play,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { getCourseContent } from "@/lib/content";
import { findLesson as findMockLesson } from "@/lib/vslearn/data";
import { EditorPanel } from "@/components/editor";
import type { EditorFile, EditorPanelHandle } from "@/components/editor";

import type { CourseLesson, CourseContent, CourseModule } from "@/lib/content";

export const Route = createFileRoute("/learn/$courseSlug/$lessonSlug")({
  head: ({ params }) => {
    const data = getLessonMeta(params.courseSlug, params.lessonSlug);
    return {
      meta: [
        { title: data ? `${data.title} - ${data.courseTitle}` : "Lesson - VSLearn" },
        { name: "description", content: data?.description ?? "VSLearn lesson." },
      ],
    };
  },
  component: LessonRoute,
});

function LessonRoute() {
  return (
    <ProtectedRoute>
      <LessonView />
    </ProtectedRoute>
  );
}

type LessonData = {
  course: { id: string; title: string; modules: { id: string; lessons: { id: string; title: string }[] }[] };
  module: { id: string; title: string };
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: string;
    content: string;
    starterCode?: string;
    solution?: string;
    language?: string;
    expectedOutput?: string;
    quiz?: { q: string; options: string[]; answer: number }[];
  };
};

type ContentLessonData = {
  course: CourseContent;
  module: CourseModule;
  lesson: CourseLesson;
};

function getLessonMeta(courseSlug: string, lessonSlug: string) {
  const content = getCourseContent(courseSlug);
  if (content) {
    for (const m of content.modules) {
      const l = m.lessons.find((x) => x.slug === lessonSlug);
      if (l) {
        return {
          title: l.frontmatter.title,
          description: l.frontmatter.summary ?? l.body.slice(0, 150),
          courseTitle: content.title,
        };
      }
    }
  }
  const mock = findMockLesson(courseSlug, lessonSlug);
  if (mock) {
    return {
      title: mock.lesson.title,
      description: mock.lesson.content.slice(0, 150),
      courseTitle: mock.course.title,
    };
  }
  return null;
}

function toEditorFiles(lesson: {
  type?: string;
  starterCode?: string;
  language?: string;
  starterFiles?: EditorFile[];
}): EditorFile[] {
  if (lesson.starterFiles && lesson.starterFiles.length > 0) {
    return lesson.starterFiles.map((f) => ({ ...f }));
  }
  if (lesson.starterCode != null && lesson.type === "coding") {
    const lang = lesson.language ?? "javascript";
    const ext = lang === "typescript" || lang === "tsx" ? "tsx" : "js";
    return [{ path: `index.${ext}`, content: lesson.starterCode, language: lang }];
  }
  return [];
}

function solutionFiles(lesson: { solution?: string; language?: string; solutionFiles?: EditorFile[] }): EditorFile[] {
  if (lesson.solutionFiles && lesson.solutionFiles.length > 0) {
    return lesson.solutionFiles.map((f) => ({ ...f }));
  }
  if (lesson.solution) {
    const lang = lesson.language ?? "javascript";
    const ext = lang === "typescript" || lang === "tsx" ? "tsx" : "js";
    return [{ path: `index.${ext}`, content: lesson.solution, language: lang }];
  }
  return [];
}

function LessonView() {
  const { courseSlug, lessonSlug } = Route.useParams();

  const content = useMemo(() => getCourseContent(courseSlug), [courseSlug]);
  const contentLesson = useMemo(() => {
    if (!content) return null;
    for (const m of content.modules) {
      const l = m.lessons.find((x) => x.slug === lessonSlug);
      if (l) return { course: content, module: m, lesson: l } as ContentLessonData;
    }
    return null;
  }, [content, lessonSlug]);

  const mockFound = useMemo(() => {
    if (contentLesson) return null;
    return findMockLesson(courseSlug, lessonSlug) as LessonData | null;
  }, [contentLesson, courseSlug, lessonSlug]);

  const displayData = useMemo(() => {
    if (contentLesson) {
      return {
        course: { id: contentLesson.course.slug, title: contentLesson.course.title, modules: contentLesson.course.modules.map((m) => ({ id: m.slug, title: m.title, lessons: m.lessons.map((l) => ({ id: l.slug, title: l.frontmatter.title })) })) },
        module: { id: contentLesson.module.slug, title: contentLesson.module.title },
        lesson: {
          id: contentLesson.lesson.slug,
          title: contentLesson.lesson.frontmatter.title,
          type: contentLesson.lesson.frontmatter.type,
          duration: `${contentLesson.lesson.frontmatter.durationMinutes} min`,
          content: contentLesson.lesson.body,
          starterFiles: contentLesson.lesson.starterFiles.map((f) => ({ path: f.path, content: f.content, language: f.language })),
          solutionFiles: contentLesson.lesson.solutionFiles.map((f) => ({ path: f.path, content: f.content, language: f.language })),
        },
      } as LessonData & { lesson: { starterFiles: EditorFile[]; solutionFiles: EditorFile[] } };
    }
    if (mockFound) {
      return {
        ...mockFound,
        lesson: { ...mockFound.lesson, starterFiles: [], solutionFiles: [] },
      };
    }
    return null;
  }, [contentLesson, mockFound]);

  if (!displayData) throw notFound();

  const { course, module, lesson } = displayData;

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const idx = allLessons.findIndex((item) => item.id === lessonSlug);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  const files = useMemo(() => toEditorFiles(lesson), [lesson]);
  const sFiles = useMemo(() => solutionFiles(lesson), [lesson]);

  const editorRef = useRef<EditorPanelHandle>(null);

  const [output, setOutput] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  const isCoding = lesson.type === "coding";
  const isText = lesson.type === "text";
  const isQuiz = lesson.type === "quiz";
  const isHtmlLesson = files.some((f) => f.path.endsWith(".html"));

  const runCode = useCallback(
    (currentFiles: EditorFile[]) => {
      if (isHtmlLesson) {
        const html = currentFiles.find((f) => f.path.endsWith(".html"))?.content ?? "";
        const css = currentFiles.find((f) => f.path.endsWith(".css"))?.content ?? "";
        const js = currentFiles.find((f) => f.path.endsWith(".js"))?.content ?? "";
        const full = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
        const blob = new Blob([full], { type: "text/html" });
        setOutput(`Opening preview... (${currentFiles.length} files)`);
        window.open(URL.createObjectURL(blob), "_blank");
        return;
      }

      const mainFile = currentFiles.find((f) => f.path.endsWith(".js") || f.path.endsWith(".ts"));
      const code = mainFile?.content ?? currentFiles[0]?.content ?? "";
      try {
        const logs: string[] = [];
        const sandbox = { console: { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) } };
        new Function("console", code)(sandbox.console);
        setOutput(logs.join("\n") || "(no output)");
      } catch (error: unknown) {
        setOutput(`Error: ${error instanceof Error ? error.message : "Unknown execution error"}`);
      }
    },
    [isHtmlLesson],
  );

  const handleRun = useCallback(
    (currentFiles: EditorFile[]) => {
      runCode(currentFiles);
    },
    [runCode],
  );

  useEffect(() => {
    setOutput("");
    setShowSolution(false);
  }, [lessonSlug]);

  const fileExt =
    isCoding ? (lesson.language === "tsx" ? "tsx" : "js") : isQuiz ? "quiz" : "md";

  const isCorrect =
    !isHtmlLesson && lesson.expectedOutput && output.trim() === lesson.expectedOutput.trim();

  const tabTitle = isCoding
    ? `${lesson.id}.${fileExt}`
    : `${lesson.id}.${fileExt}`;

  const hasCodingContent = isCoding && files.length > 0;

  return (
    <AppShell
      tabs={[
        { id: course.id, title: `${course.id}.md`, path: `/learn/${course.id}`, icon: "text" },
        {
          id: lesson.id,
          title: tabTitle,
          path: `/learn/${course.id}/${lesson.id}`,
          icon: lesson.type,
        },
      ]}
      breadcrumbs={["vslearn", "learn", course.title, module.title, lesson.title]}
      terminalContent={
        hasCodingContent ? (
          <div className="space-y-1">
            <div>
              <span className="text-syntax-function">vslearn</span>
              <span className="text-syntax-keyword"> $ </span>
              {isHtmlLesson ? "open preview" : `node ${lesson.id}.js`}
            </div>
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="text-muted-foreground">
                › Press <kbd className="px-1 bg-secondary rounded text-[10px]">Ctrl+Enter</kbd> to run your code.
              </div>
            )}
            {isCorrect && (
              <div className="text-syntax-string">✓ output matches expected - well done!</div>
            )}
            {output && lesson.expectedOutput && !isCorrect && (
              <div className="text-destructive">✗ expected: {lesson.expectedOutput}</div>
            )}
          </div>
        ) : (
          <div>
            <span className="text-syntax-function">vslearn</span>
            <span className="text-syntax-keyword"> $ </span>
            reading {lesson.id}.{fileExt}...
            <div className="text-muted-foreground mt-1">› {lesson.duration} estimated</div>
          </div>
        )
      }
    >
      <article className="max-w-4xl mx-auto p-8">
        <div className="text-xs font-mono text-muted-foreground">
          {course.title} → {module.title}
        </div>
        <h1 className="text-3xl font-bold mt-1">{lesson.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span className="capitalize px-2 py-0.5 bg-secondary rounded border border-border">
            {lesson.type}
          </span>
          <span>{lesson.duration}</span>
          {hasCodingContent && (
            <span className="text-muted-foreground/60">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="prose prose-invert max-w-none mt-8">
          {lesson.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">
              {renderInline(paragraph)}
            </p>
          ))}
        </div>

        {lesson.type === "video" && (
          <div className="mt-6 aspect-video bg-card border border-border rounded-md flex items-center justify-center">
            <button className="size-16 rounded-full bg-primary flex items-center justify-center hover:opacity-90 glow-primary">
              <Play className="size-7 fill-current text-primary-foreground" />
            </button>
          </div>
        )}

        {hasCodingContent && (
          <div className="mt-8 border border-border rounded-md overflow-hidden">
            <div className="text-xs font-mono text-muted-foreground px-4 py-2 bg-secondary border-b border-border">
              Editor — {lesson.id}
            </div>
            <div className="h-[500px]">
              <EditorPanel
                ref={editorRef}
                files={files}
                starterFiles={sFiles.length > 0 ? sFiles : files}
                onRun={handleRun}
                storageKey={`${course.id}_${lesson.id}`}
              />
            </div>
            {sFiles.length > 0 && (
              <details className="border-t border-border" open={showSolution}>
                <summary
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSolution((v) => !v);
                  }}
                  className="px-4 py-2 text-xs cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground bg-secondary"
                >
                  <Lightbulb className="size-3.5" /> View solution
                </summary>
                <div className="p-3 space-y-3 max-h-72 overflow-y-auto">
                  {sFiles.map((sf) => (
                    <div key={sf.path}>
                      <div className="text-[10px] font-mono text-muted-foreground mb-1">{sf.path}</div>
                      <pre className="text-xs font-mono bg-editor border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap">
                        {sf.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {isQuiz && "quiz" in lesson && lesson.quiz && <Quiz questions={lesson.quiz} />}

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          {prev ? (
            <Link
              to="/learn/$courseSlug/$lessonSlug"
              params={{ courseSlug: course.id, lessonSlug: prev.id }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/learn/$courseSlug/$lessonSlug"
              params={{ courseSlug: course.id, lessonSlug: next.id }}
              className="flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              Mark complete & next <ChevronRight className="size-4" />
            </Link>
          ) : (
            <Link
              to="/learn/$courseSlug"
              params={{ courseSlug: course.id }}
              className="flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              <CheckCircle2 className="size-4" /> Finish course
            </Link>
          )}
        </div>
      </article>
    </AppShell>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={index}
        className="font-mono text-sm bg-secondary border border-border rounded px-1.5 py-0.5 text-syntax-attr"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function Quiz({ questions }: { questions: { q: string; options: string[]; answer: number }[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = Object.entries(answers).filter(
    ([index, value]) => questions[+index].answer === value,
  ).length;

  return (
    <div className="mt-8 space-y-6">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="border border-border bg-card rounded-md p-5">
          <div className="text-xs font-mono text-muted-foreground">
            question {questionIndex + 1}
          </div>
          <div className="font-medium mt-1">{question.q}</div>
          <div className="mt-3 space-y-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[questionIndex] === optionIndex;
              const correct = submitted && question.answer === optionIndex;
              const wrong = submitted && selected && question.answer !== optionIndex;
              return (
                <button
                  key={optionIndex}
                  disabled={submitted}
                  onClick={() =>
                    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))
                  }
                  className={`w-full text-left px-3 py-2 rounded border text-sm font-mono ${correct ? "border-green-500 bg-green-500/10" : ""} ${wrong ? "border-destructive bg-destructive/10" : ""} ${!submitted && selected ? "border-primary bg-primary/10" : "border-border"} ${!submitted ? "hover:border-primary/50" : ""}`}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          disabled={Object.keys(answers).length !== questions.length}
          onClick={() => setSubmitted(true)}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          Submit quiz
        </button>
      ) : (
        <div className="border border-primary bg-primary/10 rounded-md p-4 font-mono text-sm">
          ✓ You scored{" "}
          <span className="font-bold">
            {score}/{questions.length}
          </span>
        </div>
      )}
    </div>
  );
}
