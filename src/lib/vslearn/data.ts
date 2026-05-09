// Mock data for VSLearn — courses, modules, lessons, user progress.

export type LessonType = "text" | "video" | "quiz" | "coding";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  content: string; // markdown-ish text
  starterCode?: string;
  solution?: string;
  language?: string;
  expectedOutput?: string;
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  icon: string;
  hours: number;
  students: number;
  rating: number;
  modules: Module[];
}

export const categories = [
  { name: "HTML", color: "#e34f26", icon: "🌐" },
  { name: "CSS", color: "#1572b6", icon: "🎨" },
  { name: "JavaScript", color: "#f7df1e", icon: "⚡" },
  { name: "TypeScript", color: "#3178c6", icon: "TS" },
  { name: "React", color: "#61dafb", icon: "⚛" },
  { name: "Node.js", color: "#68a063", icon: "⬢" },
  { name: "Next.js", color: "#ffffff", icon: "▲" },
  { name: "MongoDB", color: "#47a248", icon: "🍃" },
  { name: "UI/UX Design", color: "#ff61f6", icon: "✦" },
];

export const courses: Course[] = [
  {
    id: "js-fundamentals",
    slug: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    description: "Master the language that powers the modern web — from variables to async/await.",
    category: "JavaScript",
    level: "Beginner",
    color: "#f7df1e",
    icon: "⚡",
    hours: 12,
    students: 18420,
    rating: 4.9,
    modules: [
      {
        id: "m1",
        title: "Getting Started",
        lessons: [
          {
            id: "l1",
            title: "Hello, JavaScript",
            type: "text",
            duration: "8 min",
            content:
              "JavaScript is the programming language of the web. It runs in every browser and powers everything from interactive forms to entire applications.\n\nIn this lesson you'll write your first line of code and understand how the JavaScript engine reads it.",
          },
          {
            id: "l2",
            title: "Variables & Types",
            type: "coding",
            duration: "15 min",
            content:
              "Variables hold data. In modern JavaScript we use `const` for values that don't change and `let` for ones that do. Try declaring a few below.",
            language: "javascript",
            starterCode:
              "// Declare a constant called 'name' with your name\n// Then a let called 'score' with value 0\n// Log them to the console\n",
            solution:
              'const name = "Ada";\nlet score = 0;\nconsole.log(name, score);',
            expectedOutput: "Ada 0",
          },
          {
            id: "l3",
            title: "Quiz: The Basics",
            type: "quiz",
            duration: "5 min",
            content: "Test what you've learned about variables and types.",
            quiz: [
              {
                q: "Which keyword declares a value that cannot be reassigned?",
                options: ["var", "let", "const", "static"],
                answer: 2,
              },
              {
                q: "What is typeof null in JavaScript?",
                options: ["'null'", "'object'", "'undefined'", "'number'"],
                answer: 1,
              },
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "Functions & Scope",
        lessons: [
          {
            id: "l4",
            title: "Arrow Functions",
            type: "coding",
            duration: "12 min",
            content:
              "Arrow functions give you a concise syntax and a lexical `this`. Convert the function below into an arrow function.",
            language: "javascript",
            starterCode:
              "function double(n) {\n  return n * 2;\n}\n\nconsole.log(double(21));",
            solution: "const double = (n) => n * 2;\nconsole.log(double(21));",
            expectedOutput: "42",
          },
          {
            id: "l5",
            title: "Async / Await",
            type: "video",
            duration: "10 min",
            content:
              "Promises and async/await let you work with asynchronous code as if it were synchronous. Watch how the event loop processes them.",
          },
        ],
      },
    ],
  },
  {
    id: "react-essentials",
    slug: "react-essentials",
    title: "React Essentials",
    description: "Build modern, reactive interfaces with hooks, state, and components.",
    category: "React",
    level: "Intermediate",
    color: "#61dafb",
    icon: "⚛",
    hours: 16,
    students: 12104,
    rating: 4.8,
    modules: [
      {
        id: "m1",
        title: "Components & JSX",
        lessons: [
          {
            id: "l1",
            title: "Your first component",
            type: "coding",
            duration: "10 min",
            content:
              "Components are functions that return JSX. Build a `Greeting` component that takes a `name` prop.",
            language: "tsx",
            starterCode:
              'export function Greeting(/* props */) {\n  return <h1>Hello!</h1>;\n}',
            solution:
              'export function Greeting({ name }: { name: string }) {\n  return <h1>Hello, {name}!</h1>;\n}',
          },
          {
            id: "l2",
            title: "useState basics",
            type: "text",
            duration: "8 min",
            content:
              "State lets components remember things between renders. `useState` returns the current value and a setter.",
          },
        ],
      },
    ],
  },
  {
    id: "html-css-basics",
    slug: "html-css-basics",
    title: "HTML & CSS Foundations",
    description: "The structural and visual building blocks of every web page.",
    category: "HTML",
    level: "Beginner",
    color: "#e34f26",
    icon: "🌐",
    hours: 8,
    students: 22310,
    rating: 4.7,
    modules: [
      {
        id: "m1",
        title: "Markup",
        lessons: [
          {
            id: "l1",
            title: "Semantic HTML",
            type: "text",
            duration: "6 min",
            content:
              "Use elements that describe meaning — `<header>`, `<nav>`, `<article>`, `<footer>` — not just `<div>`.",
          },
        ],
      },
    ],
  },
  {
    id: "ts-deep-dive",
    slug: "typescript-deep-dive",
    title: "TypeScript Deep Dive",
    description: "Generics, conditional types, and patterns used by the best teams.",
    category: "TypeScript",
    level: "Advanced",
    color: "#3178c6",
    icon: "TS",
    hours: 14,
    students: 8740,
    rating: 4.9,
    modules: [
      {
        id: "m1",
        title: "Type System",
        lessons: [
          {
            id: "l1",
            title: "Unions & Narrowing",
            type: "text",
            duration: "9 min",
            content: "TypeScript narrows union types when you use `typeof`, `in`, or discriminated unions.",
          },
        ],
      },
    ],
  },
  {
    id: "node-api",
    slug: "node-api",
    title: "Node.js REST APIs",
    description: "Design, build, and deploy production-grade REST APIs.",
    category: "Node.js",
    level: "Intermediate",
    color: "#68a063",
    icon: "⬢",
    hours: 10,
    students: 6502,
    rating: 4.7,
    modules: [
      {
        id: "m1",
        title: "Express basics",
        lessons: [
          {
            id: "l1",
            title: "Your first route",
            type: "text",
            duration: "7 min",
            content: "Express lets you map HTTP methods + paths to handler functions.",
          },
        ],
      },
    ],
  },
  {
    id: "nextjs-app",
    slug: "nextjs-app",
    title: "Next.js App Router",
    description: "Server components, streaming, and modern routing patterns.",
    category: "Next.js",
    level: "Intermediate",
    color: "#ffffff",
    icon: "▲",
    hours: 11,
    students: 9240,
    rating: 4.8,
    modules: [
      { id: "m1", title: "Routing", lessons: [
        { id: "l1", title: "Layouts & pages", type: "text", duration: "5 min", content: "Folder = route. layout.tsx wraps page.tsx." }
      ]}
    ],
  },
];

export function findCourse(id: string) {
  return courses.find((c) => c.id === id || c.slug === id);
}

export function findLesson(courseId: string, lessonId: string) {
  const course = findCourse(courseId);
  if (!course) return null;
  for (const m of course.modules) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) return { course, module: m, lesson: l };
  }
  return null;
}

export const mockUser = {
  name: "Ada Lovelace",
  email: "ada@vslearn.dev",
  role: "student" as const,
  enrolledCourses: ["js-fundamentals", "react-essentials"],
  completedLessons: ["js-fundamentals:l1", "js-fundamentals:l2"],
  badges: [
    { id: "first-step", name: "First Step", icon: "🎯" },
    { id: "quick-learner", name: "Quick Learner", icon: "⚡" },
    { id: "code-warrior", name: "Code Warrior", icon: "⚔️" },
  ],
};

export function courseProgress(courseId: string) {
  const course = findCourse(courseId);
  if (!course) return 0;
  const total = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const done = mockUser.completedLessons.filter((c) => c.startsWith(courseId + ":")).length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}
