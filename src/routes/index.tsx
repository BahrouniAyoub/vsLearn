import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Code2, Sparkles, Terminal, Zap, Star, Play } from "lucide-react";
import { courses, categories } from "@/lib/vslearn/data";
import { CodeBlock } from "@/lib/vslearn/highlight";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VSLearn — Learn development in a VS Code-inspired workspace" },
      { name: "description", content: "Interactive courses for HTML, CSS, JavaScript, React, Node.js and more — in a familiar editor environment." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <CategoriesSection />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">{"<>"}</span>
          VS<span className="text-primary">Learn</span>
        </Link>
        <nav className="ml-10 hidden md:flex gap-6 text-sm text-muted-foreground">
          <Link to="/courses" className="hover:text-foreground">Courses</Link>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <Link to="/admin" className="hover:text-foreground">Admin</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">Sign in</Link>
          <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:opacity-90">Get started</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const sample = `// welcome.ts
function learn(skill: string) {
  const path = ["watch", "code", "build"];
  return path.map(step => \`\${step} → \${skill}\`);
}

learn("react");`;
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 scanline-grid opacity-50" />
      <div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-primary/20 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground font-mono">
            <Sparkles className="size-3 text-primary" /> v1.0 — now in early access
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Learn development in a <span className="text-primary">VS Code-inspired</span> workspace.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Interactive lessons, real coding challenges, quizzes and projects — all delivered in the editor environment you already love.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md hover:opacity-90 glow-primary">
              <Play className="size-4 fill-current" /> Start Learning
            </Link>
            <Link to="/courses" className="inline-flex items-center gap-2 border border-border bg-secondary px-5 py-3 rounded-md hover:bg-accent">
              Explore Courses <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div><span className="text-foreground font-semibold">120k+</span> learners</div>
            <div><span className="text-foreground font-semibold">340</span> lessons</div>
            <div className="flex items-center gap-1"><Star className="size-4 fill-yellow-400 text-yellow-400" /><span className="text-foreground font-semibold">4.9</span></div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-lg overflow-hidden border border-border shadow-2xl bg-card">
            <div className="h-9 bg-titlebar border-b border-border flex items-center px-3 gap-1.5 text-xs">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-muted-foreground font-mono">welcome.ts — vslearn</span>
            </div>
            <div className="flex">
              <div className="w-44 bg-sidebar-bg border-r border-border text-xs py-2">
                <div className="px-3 py-1 text-[10px] uppercase text-muted-foreground tracking-wider">Explorer</div>
                {["📁 javascript", "  📄 welcome.ts", "📁 react", "📁 node"].map((f) => (
                  <div key={f} className={`px-3 py-1 ${f.includes("welcome") ? "bg-accent/50 text-foreground" : "text-muted-foreground"}`}>{f}</div>
                ))}
              </div>
              <div className="flex-1">
                <CodeBlock code={sample} />
                <div className="border-t border-border bg-terminal p-3 font-mono text-xs">
                  <div className="text-muted-foreground">$ ts-node welcome.ts</div>
                  <div className="text-syntax-string">[ "watch → react", "code → react", "build → react" ]</div>
                  <div className="text-syntax-comment">// ✓ all tests passed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Code2, title: "Editor-style lessons", body: "Lessons render like a real codebase — files, tabs, breadcrumbs, the works." },
    { icon: Terminal, title: "Live terminal", body: "Run challenges and see the output exactly where you'd expect it." },
    { icon: Zap, title: "Instant feedback", body: "Quizzes and code checks scored on the spot, with friendly hints." },
    { icon: Sparkles, title: "Command palette", body: "Press ⌘K from anywhere to navigate, search, or jump into a lesson." },
  ];
  return (
    <section id="features" className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-syntax-comment font-mono text-sm">// what makes us different</div>
        <h2 className="mt-2 text-4xl font-bold tracking-tight">Built like the editor you ship in.</h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="border border-border bg-card p-6 rounded-md hover:border-primary/50 transition-colors">
              <f.icon className="size-6 text-primary" />
              <div className="mt-4 font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-syntax-comment font-mono text-sm">// pick your path</div>
            <h2 className="mt-2 text-4xl font-bold tracking-tight">Course categories</h2>
          </div>
          <Link to="/courses" className="text-sm text-primary hover:underline">Browse all →</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <div key={c.name} className="border border-border bg-card p-4 rounded-md hover:border-primary/50 transition-colors cursor-pointer">
              <div className="size-10 rounded-md flex items-center justify-center text-lg font-bold" style={{ background: `${c.color}20`, color: c.color }}>{c.icon}</div>
              <div className="mt-3 font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {courses.filter((co) => co.category === c.name).length} courses
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Free", price: "$0", desc: "Get started with the fundamentals.", features: ["6 starter courses", "Quizzes & coding exercises", "Community access"], cta: "Start free", highlight: false },
    { name: "Pro", price: "$15", desc: "Go deep — everything to land your first dev role.", features: ["All 80+ courses", "Real-world projects", "Certificates", "Priority support"], cta: "Upgrade to Pro", highlight: true },
    { name: "Teams", price: "$49", desc: "For squads leveling up together.", features: ["Everything in Pro", "Team analytics", "Custom learning paths", "SSO & SCIM"], cta: "Contact sales", highlight: false },
  ];
  return (
    <section id="pricing" className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-syntax-comment font-mono text-sm text-center">// pricing</div>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-center">Simple, transparent plans.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div key={t.name} className={`p-6 rounded-md border bg-card ${t.highlight ? "border-primary glow-primary" : "border-border"}`}>
              {t.highlight && <div className="text-xs font-mono text-primary mb-2">{"// most popular"}</div>}
              <div className="font-semibold text-lg">{t.name}</div>
              <div className="mt-2 text-4xl font-bold">{t.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <div className="mt-1 text-sm text-muted-foreground">{t.desc}</div>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="size-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <button className={`mt-6 w-full py-2 rounded-md text-sm font-medium ${t.highlight ? "bg-primary text-primary-foreground" : "border border-border bg-secondary"}`}>{t.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { name: "Maya R.", role: "Frontend dev @ Stripe", text: "Felt like onboarding into a real codebase. Best learning experience I've had." },
    { name: "Diego P.", role: "Bootcamp grad", text: "The editor-style lessons make everything click. The terminal feedback is gold." },
    { name: "Lin H.", role: "Engineering lead", text: "I roll out VSLearn to every new junior on my team." },
  ];
  return (
    <section className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-syntax-comment font-mono text-sm">// from learners</div>
        <h2 className="mt-2 text-4xl font-bold tracking-tight">Loved by 120k+ developers.</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {quotes.map((q) => (
            <div key={q.name} className="p-6 border border-border bg-card rounded-md">
              <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-sm">{q.text}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                <div className="text-foreground font-semibold">{q.name}</div>
                {q.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} VSLearn — Built for developers, by developers.</div>
        <div className="flex gap-4">
          <Link to="/courses" className="hover:text-foreground">Courses</Link>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
