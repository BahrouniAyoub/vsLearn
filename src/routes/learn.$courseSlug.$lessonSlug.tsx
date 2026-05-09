import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Code, Eye, Send, CheckCircle2, ExternalLink } from "lucide-react";

import { ProtectedRoute } from "@/lib/auth";
import { getCourseContent } from "@/lib/content";
import { findLesson as findMockLesson } from "@/lib/vslearn/data";
import { EditorPanel } from "@/components/editor";
import type { EditorFile, EditorPanelHandle } from "@/components/editor";
import { PreviewPanel, ConsolePanel } from "@/components/preview";
import type { ConsoleMessage } from "@/components/preview";
import { ChallengeRunner } from "@/components/challenges";
import type { ChallengeTestConfig } from "@/lib/challenges";
import { lessonToTestConfig } from "@/lib/challenges";
import { useCompletion } from "@/lib/workspace";
import { useProgress } from "@/lib/progress";
import { LessonTracker } from "@/components/progress";
import { LessonLayout, LessonHeader, LessonInstructions, SolutionDialog } from "@/components/lesson";
import type { BottomPanelTab } from "@/components/lesson";
import type { ChallengeValidation, CourseLesson, CourseContent, CourseModule } from "@/lib/content";
import { useProjects, type ProjectSubmission } from "@/lib/projects";
import { ProjectForm, ProjectStatus } from "@/components/projects";

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

type MockLesson = {
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
    hints?: string[];
    quiz?: { q: string; options: string[]; answer: number }[];
  };
};

type ContentLesson = {
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

type ViewMode = "editor" | "preview";

function LessonView() {
  const { courseSlug, lessonSlug } = Route.useParams();

  const content = useMemo(() => getCourseContent(courseSlug), [courseSlug]);
  const contentLesson = useMemo(() => {
    if (!content) return null;
    for (const m of content.modules) {
      const l = m.lessons.find((x) => x.slug === lessonSlug);
      if (l) return { course: content, module: m, lesson: l } as ContentLesson;
    }
    return null;
  }, [content, lessonSlug]);

  const mockFound = useMemo(() => {
    if (contentLesson) return null;
    return findMockLesson(courseSlug, lessonSlug) as MockLesson | null;
  }, [contentLesson, courseSlug, lessonSlug]);

  const displayData = useMemo(() => {
    if (contentLesson) {
      const { course, module, lesson } = contentLesson;
      return {
        course: { id: course.slug, title: course.title, modules: course.modules.map((m) => ({ id: m.slug, title: m.title, lessons: m.lessons.map((l) => ({ id: l.slug, title: l.frontmatter.title })) })) },
        module: { id: module.slug, title: module.title },
        lesson: {
          id: lesson.slug,
          title: lesson.frontmatter.title,
          type: lesson.frontmatter.type,
          duration: `${lesson.frontmatter.durationMinutes} min`,
          content: lesson.body,
          challenge: lesson.challenge,
          starterFiles: lesson.starterFiles.map((f) => ({ path: f.path, content: f.content, language: f.language })),
          solutionFiles: lesson.solutionFiles.map((f) => ({ path: f.path, content: f.content, language: f.language })),
        },
      };
    }
    if (mockFound) {
      return {
        ...mockFound,
        lesson: { ...mockFound.lesson, starterFiles: [], solutionFiles: [], challenge: null },
      };
    }
    return null;
  }, [contentLesson, mockFound]);

  const navigation = useMemo(() => {
    if (!displayData) return null;
    const { course, lesson: l } = displayData;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const idx = allLessons.findIndex((item) => item.id === lessonSlug);
    return {
      prev: idx > 0 ? allLessons[idx - 1] : null,
      next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
      allLessons,
      currentIndex: idx,
      totalLessons: allLessons.length,
    };
  }, [displayData, lessonSlug]);

  if (!displayData || !navigation) throw notFound();

  const { course, module, lesson } = displayData;

  const files = useMemo(() => toEditorFiles(lesson), [lesson]);
  const sFiles = useMemo(() => solutionFiles(lesson), [lesson]);
  const hasSsolution = sFiles.length > 0;

  const isCoding = lesson.type === "coding";
  const isQuiz = lesson.type === "quiz";
  const isProject = lesson.type === "project";
  const isHtmlLesson = files.some((f) => f.path.endsWith(".html"));
  const hasCodingContent = (isCoding || isProject) && files.length > 0;

  const challengeValidation: ChallengeValidation | null | undefined = contentLesson?.lesson.challenge?.validation;
  const challengeInstructions = contentLesson?.lesson.challenge?.instructions;

  const editorRef = useRef<EditorPanelHandle>(null);

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [currentFiles, setCurrentFiles] = useState<EditorFile[]>(files);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [hintsVisible, setHintsVisible] = useState(false);
  const [solutionDialogOpen, setSolutionDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const {
    isComplete,
    toggleComplete,
  } = useCompletion(course.id, navigation.totalLessons, true);
  const completed = isComplete(lesson.id);

  const progress = useProgress();
  const lessonProg = progress.getLessonProgress(course.id, lesson.id);
  const didMount = useRef(false);

  const {
    getProjectForLesson,
    startProject,
    updateDraft,
    submit: submitProject,
    setPublished,
  } = useProjects();

  const [currentProject, setCurrentProject] = useState<ProjectSubmission | null>(null);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const prevSlugRef = useRef(lessonSlug);

  useEffect(() => {
    if (didMount.current && prevSlugRef.current === lessonSlug) return;
    prevSlugRef.current = lessonSlug;
    didMount.current = true;
    progress.startLesson(course.id, lesson.id);

    if (isProject) {
      const existing = getProjectForLesson(course.id, lesson.id);
      if (existing) {
        setCurrentProject(existing);
      } else {
        const created = startProject(course.id, course.title, lesson.id, lesson.title);
        setCurrentProject(created);
      }
    }
  }, [course.id, lesson.id, lessonSlug, progress, isProject]);

  const handleRecordTime = useCallback(
    (seconds: number) => progress.recordTime(seconds),
    [progress],
  );

  const testConfig = useMemo<ChallengeTestConfig | null>(
    () => lessonToTestConfig(lesson.type, currentFiles, (lesson as Record<string, unknown>).expectedOutput as string | undefined, challengeValidation),
    [lesson.type, currentFiles, challengeValidation],
  );

  const mockHints = (lesson as Record<string, unknown>).hints as string[] | undefined;
  const hints = mockHints ?? [];

  useEffect(() => {
    setConsoleMessages([]);
    setCurrentFiles(files);
    setViewMode("editor");
    setHintsVisible(false);
    setSolutionDialogOpen(false);
    setRunning(false);
    setAllTestsPassed(false);
  }, [lessonSlug, files]);

  const handleFilesChange = useCallback((updatedFiles: EditorFile[]) => {
    setCurrentFiles(updatedFiles);
  }, []);

  const handleConsoleMessage = useCallback((msg: ConsoleMessage) => {
    setConsoleMessages((prev) => [...prev, msg]);
  }, []);

  const handleClearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  const handleRun = useCallback(() => {
    setRunning(true);
    setAllTestsPassed(false);
    progress.recordAttempt(course.id, lesson.id);

    if (isProject && currentProject) {
      const updated = updateDraft(currentProject, { files: currentFiles });
      setCurrentProject(updated);
    }

    if (!isHtmlLesson) {
      setViewMode("editor");
      const mainFile = currentFiles.find((f) => f.path.endsWith(".js") || f.path.endsWith(".ts"));
      const code = mainFile?.content ?? currentFiles[0]?.content ?? "";
      setConsoleMessages((prev) => [
        ...prev,
        {
          id: `run-${Date.now()}`,
          method: "log",
          args: [`> node ${lesson.id}.js`],
          timestamp: Date.now(),
        },
      ]);
      try {
        const logs: string[] = [];
        const sandbox = { console: { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) } };
        new Function("console", code)(sandbox.console);
        for (const line of logs) {
          setConsoleMessages((prev) => [
            ...prev,
            { id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, method: "log", args: [line], timestamp: Date.now() },
          ]);
        }
        const expectedOutput = (lesson as Record<string, unknown>).expectedOutput as string | undefined;
        if (logs.length === 0 && expectedOutput) {
          setConsoleMessages((prev) => [
            ...prev,
            { id: `hint-${Date.now()}`, method: "info", args: ["(no output)"], timestamp: Date.now() },
          ]);
        }
        if (expectedOutput) {
          const last = logs.join("\n").trim();
          if (last === expectedOutput.trim()) {
            setConsoleMessages((prev) => [
              ...prev,
              { id: `ok-${Date.now()}`, method: "info", args: ["✓ Output matches expected"], timestamp: Date.now() },
            ]);
          } else if (last) {
            setConsoleMessages((prev) => [
              ...prev,
              { id: `mismatch-${Date.now()}`, method: "warn", args: [`✗ Expected: ${expectedOutput}`], timestamp: Date.now() },
            ]);
          }
        }
      } catch (error: unknown) {
        setConsoleMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, method: "error", args: [error instanceof Error ? error.message : "Unknown execution error"], timestamp: Date.now() },
        ]);
      }
    } else {
      setViewMode("preview");
    }

    setTimeout(() => setRunning(false), 300);
  }, [isHtmlLesson, isProject, lesson.id, currentFiles, currentProject, updateDraft]);

  const handleReset = useCallback(() => {
    editorRef.current?.resetFiles();
  }, []);

  const handleToggleComplete = useCallback(() => {
    toggleComplete(lesson.id);
  }, [toggleComplete, lesson.id]);

  const handleProjectSave = useCallback(
    (updates: Partial<ProjectSubmission>) => {
      if (!currentProject) return;
      const updated = updateDraft(currentProject, { ...updates, files: currentFiles });
      setCurrentProject(updated);
    },
    [currentProject, updateDraft, currentFiles],
  );

  const handleProjectDeleteFile = useCallback(
    (path: string) => {
      if (!currentProject) return;
      const updated = updateDraft(currentProject, {
        files: currentProject.files.filter((f) => f.path !== path),
      });
      setCurrentProject(updated);
    },
    [currentProject, updateDraft],
  );

  const handleProjectSubmit = useCallback(() => {
    if (!currentProject || !challengeValidation) return;
    setProjectSubmitting(true);
    setProjectSubmitted(false);

    setTimeout(() => {
      const config = lessonToTestConfig("project", currentFiles, undefined, challengeValidation);
      if (config) {
        const result = submitProject(currentProject, config);
        setCurrentProject(result.project);
        if (result.testResults && result.testResults.failed === 0 && result.testResults.total > 0) {
          setAllTestsPassed(true);
          progress.completeLesson(course.id, lesson.id, result.testResults.total, result.testResults.total);
        }
      } else {
        const result = submitProject(currentProject, null);
        setCurrentProject(result.project);
        progress.completeLesson(course.id, lesson.id, 1, 1);
      }
      setProjectSubmitting(false);
      setProjectSubmitted(true);
    }, 200);
  }, [currentProject, challengeValidation, currentFiles, submitProject, course.id, lesson.id, progress]);

  const handleTestComplete = useCallback((suite: { summary: { failed: number; errors: number; total: number } }) => {
    const { failed, errors, total } = suite.summary;
    if (failed === 0 && errors === 0 && total > 0) {
      setAllTestsPassed(true);
      const score = total;
      progress.completeLesson(course.id, lesson.id, score, total);
    } else if (total > 0) {
      const passed = total - failed - errors;
      progress.recordAttempt(course.id, lesson.id, passed, total);
    }
  }, [course.id, lesson.id, progress]);

  const workspaceNav = (
    <div className="h-9 bg-sidebar-bg border-b border-border flex items-center px-3 gap-1 flex-shrink-0">
      <button
        type="button"
        onClick={() => setViewMode("editor")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
          viewMode === "editor"
            ? "bg-primary/10 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
      >
        <Code className="size-3.5" /> Editor
      </button>
      <button
        type="button"
        onClick={() => setViewMode("preview")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
          viewMode === "preview"
            ? "bg-primary/10 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
      >
        <Eye className="size-3.5" /> Preview
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={handleReset}
        className="text-[10px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border bg-secondary"
      >
        Reset
      </button>
    </div>
  );

  const workspaceContent = viewMode === "editor" ? (
    <EditorPanel
      ref={editorRef}
      files={files}
      starterFiles={sFiles.length > 0 ? sFiles : files}
      onFilesChange={handleFilesChange}
      onRun={handleRun}
      storageKey={`${course.id}_${lesson.id}`}
    />
  ) : (
    <PreviewPanel
      files={currentFiles}
      onConsoleMessage={handleConsoleMessage}
      debounceMs={400}
    />
  );

  const bottomTabs: BottomPanelTab[] = [];
  if (hasCodingContent) {
    bottomTabs.push({
      id: "terminal",
      label: "TERMINAL",
      content: <ConsolePanel messages={consoleMessages} onClear={handleClearConsole} />,
    });
    if (testConfig) {
      bottomTabs.push({
        id: "tests",
        label: "TESTS",
        content: (
          <ChallengeRunner
            files={currentFiles}
            config={testConfig}
            onSuiteComplete={handleTestComplete}
          />
        ),
      });
    }
  }

  if (isProject && currentProject) {
    bottomTabs.push({
      id: "project",
      label: "PROJECT",
      content: (
        <div className="p-4 space-y-4 overflow-y-auto h-full">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-semibold">Project Submission</h3>
            <ProjectStatus status={currentProject.status} />
            {currentProject.isPublished && (
              <Link
                to="/projects/$slug"
                params={{ slug: currentProject.slug }}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="size-3" />
                Public page
              </Link>
            )}
          </div>
          {projectSubmitted && currentProject.testResults && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-md px-4 py-3 text-sm text-green-400">
              <CheckCircle2 className="size-4 inline mr-2" />
              Project submitted! {currentProject.testResults.passed}/{currentProject.testResults.total} tests passed.
            </div>
          )}
          {currentProject.status === "draft" && (
            <p className="text-xs text-muted-foreground">
              Update your project details below, then submit for review.
            </p>
          )}
          <ProjectForm
            project={currentProject}
            onSave={handleProjectSave}
            onSubmit={handleProjectSubmit}
            onDeleteFile={handleProjectDeleteFile}
            isSubmitting={projectSubmitting}
          />
        </div>
      ),
    });
  }

  if (isProject && !currentProject) {
    bottomTabs.push({
      id: "project",
      label: "PROJECT",
      content: (
        <div className="p-4 text-sm text-muted-foreground">
          Loading project...
        </div>
      ),
    });
  }

  const prev = navigation.prev;
  const next = navigation.next;

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <LessonHeader
        courseSlug={course.id}
        lessonTitle={lesson.title}
        moduleTitle={module.title}
        courseTitle={course.title}
        lessonType={lesson.type}
        duration={lesson.duration}
        fileCount={files.length}
        prev={prev ? { id: prev.id, title: prev.title } : null}
        next={next ? { id: next.id, title: next.title } : null}
        completed={completed}
        hintsVisible={hintsVisible}
        hasSolution={hasSsolution}
        running={running}
        allTestsPassed={allTestsPassed}
        onRun={handleRun}
        onReset={handleReset}
        onToggleHints={() => setHintsVisible((v) => !v)}
        onRevealSolution={() => setSolutionDialogOpen(true)}
        onToggleComplete={handleToggleComplete}
        projectStatus={currentProject?.status}
        onPublishProject={
          currentProject && currentProject.status === "passed"
            ? () => {
                const updated = setPublished(currentProject, !currentProject.isPublished);
                setCurrentProject(updated);
              }
            : undefined
        }
        isPublished={currentProject?.isPublished}
      />
      <div className="flex-1 min-h-0">
        <LessonLayout
          instructions={
            <LessonInstructions
              title={lesson.title}
              content={lesson.content}
              instructions={challengeInstructions}
              hints={hints}
              hintsVisible={hintsVisible}
            />
          }
          workspace={
            <div className="h-full flex flex-col">
              {workspaceNav}
              <div className="flex-1 min-h-0">
                {workspaceContent}
              </div>
            </div>
          }
          bottomTabs={bottomTabs}
          defaultBottomTab={isProject ? "project" : testConfig ? "tests" : "terminal"}
        />
      </div>

      {hasSsolution && (
        <SolutionDialog
          open={solutionDialogOpen}
          onOpenChange={setSolutionDialogOpen}
          solutionFiles={sFiles}
        />
      )}
    </div>
  );
}
