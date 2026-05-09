import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, Play, RotateCcw } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { findLesson } from "@/lib/vslearn/data";
import { CodeBlock, Highlight } from "@/lib/vslearn/highlight";

export const Route = createFileRoute("/learn/$courseSlug/$lessonSlug")({
  head: ({ params }) => {
    const found = findLesson(params.courseSlug, params.lessonSlug);
    return {
      meta: [
        { title: found ? `${found.lesson.title} - ${found.course.title}` : "Lesson - VSLearn" },
        { name: "description", content: found?.lesson.content.slice(0, 150) ?? "VSLearn lesson." },
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

function LessonView() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const found = findLesson(courseSlug, lessonSlug);
  if (!found) throw notFound();
  const { course, module, lesson } = found;

  const allLessons = course.modules.flatMap((item) => item.lessons);
  const idx = allLessons.findIndex((item) => item.id === lessonSlug);
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  const fileExt =
    lesson.type === "coding"
      ? lesson.language === "tsx"
        ? "tsx"
        : "js"
      : lesson.type === "quiz"
        ? "quiz"
        : "md";
  const [output, setOutput] = useState("");
  const [code, setCode] = useState(lesson.starterCode ?? "");

  useEffect(() => {
    setCode(lesson.starterCode ?? "");
    setOutput("");
  }, [lessonSlug, lesson.starterCode]);

  function runCode() {
    try {
      const logs: string[] = [];
      const sandbox = {
        console: { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) },
      };
      new Function("console", code)(sandbox.console);
      setOutput(logs.join("\n") || "(no output)");
    } catch (error: unknown) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown execution error"}`);
    }
  }

  const isCorrect = lesson.expectedOutput && output.trim() === lesson.expectedOutput.trim();

  return (
    <AppShell
      tabs={[
        { id: course.id, title: `${course.id}.md`, path: `/learn/${course.id}`, icon: "text" },
        {
          id: lesson.id,
          title: `${lesson.id}.${fileExt}`,
          path: `/learn/${course.id}/${lesson.id}`,
          icon: lesson.type,
        },
      ]}
      breadcrumbs={["vslearn", "learn", course.title, module.title, lesson.title]}
      terminalContent={
        lesson.type === "coding" ? (
          <div className="space-y-1">
            <div>
              <span className="text-syntax-function">vslearn</span>
              <span className="text-syntax-keyword"> $ </span>node {lesson.id}.js
            </div>
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="text-muted-foreground">› Click "Run" to execute your code.</div>
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

        {lesson.type === "coding" && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-muted-foreground">
                Editor - {lesson.id}.{fileExt}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCode(lesson.starterCode ?? "")}
                  className="text-xs px-3 py-1.5 border border-border bg-secondary rounded-md hover:bg-accent flex items-center gap-1"
                >
                  <RotateCcw className="size-3" /> Reset
                </button>
                <button
                  onClick={runCode}
                  className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1"
                >
                  <Play className="size-3 fill-current" /> Run
                </button>
              </div>
            </div>
            <div className="border border-border rounded-md overflow-hidden bg-editor relative">
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                className="w-full bg-transparent text-transparent caret-foreground font-mono text-[13px] leading-6 p-4 pl-12 outline-none absolute inset-0 resize-none z-10"
                rows={Math.max(6, code.split("\n").length)}
              />
              <pre className="font-mono text-[13px] leading-6 p-4 pl-12 pointer-events-none">
                <Highlight code={code} />
              </pre>
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-background/40 border-r border-border text-right pr-2 py-4 text-line-number text-[13px] leading-6 font-mono select-none">
                {code.split("\n").map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
            </div>
            {lesson.solution && (
              <details className="mt-3 border border-border rounded-md bg-card">
                <summary className="px-4 py-2 text-sm cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Lightbulb className="size-4" /> View solution
                </summary>
                <div className="p-2">
                  <CodeBlock code={lesson.solution} />
                </div>
              </details>
            )}
          </div>
        )}

        {lesson.type === "quiz" && lesson.quiz && <Quiz questions={lesson.quiz} />}

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
