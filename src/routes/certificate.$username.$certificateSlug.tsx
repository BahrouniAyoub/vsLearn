import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { verifyCertificateBySlug } from "@/lib/certificates";
import type { Certificate } from "@/lib/certificates";
import {
  Award, CheckCircle2, ExternalLink, Share2, Twitter,
  Copy, ChevronLeft, BookOpen, Sparkles, Zap, Shield,
} from "lucide-react";

export const Route = createFileRoute("/certificate/$username/$certificateSlug")({
  head: ({ params }) => ({
    meta: [
      { title: "Certificate — VSLearn" },
      { name: "description", content: "Verified learning certificate." },
    ],
  }),
  component: CertificatePage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Award className="size-16 text-muted-foreground/30 mb-4" />
      <h1 className="text-2xl font-bold">Certificate not found</h1>
      <p className="text-muted-foreground mt-2">This certificate may have been revoked or the link is invalid.</p>
      <Link to="/" className="mt-6 text-primary hover:underline text-sm">Return home</Link>
    </div>
  ),
});

function CertificatePage() {
  const { certificateSlug } = Route.useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cert = verifyCertificateBySlug(certificateSlug);
    setCertificate(cert);
    setLoading(false);
  }, [certificateSlug]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = certificate
    ? `I earned a certificate in "${certificate.courseTitle}" on VSLearn!`
    : "";

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [pageUrl]);

  const shareTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText, pageUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="font-mono text-sm text-muted-foreground">verifying certificate...</div>
      </div>
    );
  }

  if (!certificate || certificate.status === "revoked") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Shield className="size-16 text-red-400/50 mb-4" />
        <h1 className="text-2xl font-bold">Certificate not found</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          {certificate?.status === "revoked"
            ? "This certificate has been revoked."
            : "This certificate doesn't exist or the link is invalid."}
        </p>
        <Link to="/" className="mt-6 text-primary hover:underline text-sm">Return home</Link>
      </div>
    );
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            VSLearn
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border border-border bg-secondary hover:bg-accent transition-colors"
            >
              <Copy className="size-3.5" />
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={shareTwitter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border border-border bg-secondary hover:bg-accent transition-colors"
            >
              <Twitter className="size-3.5" />
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 border-b border-border">
            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <Award className="size-4 text-yellow-400" />
              <span>VSLearn — Verified Certificate</span>
            </div>
          </div>

          <div className="px-8 py-10 sm:py-16 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono mb-8">
              <CheckCircle2 className="size-3.5" />
              Verified
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Certificate of Completion
            </h1>

            <p className="text-muted-foreground mt-4 text-sm max-w-md mx-auto">
              This certifies that
            </p>

            <p className="text-2xl sm:text-3xl font-bold mt-3 text-primary">
              {certificate.username}
            </p>

            <p className="text-muted-foreground mt-6 text-sm">
              has successfully completed the course
            </p>

            <p className="text-xl sm:text-2xl font-bold mt-2">
              {certificate.courseTitle}
            </p>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div>
                <div className="font-mono text-xs text-muted-foreground/60">Completed</div>
                <div className="font-medium text-foreground mt-0.5">{issuedDate}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="font-mono text-xs text-muted-foreground/60">Certificate</div>
                <div className="font-mono text-xs text-foreground mt-0.5">{certificate.certificateNumber}</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="font-mono text-xs text-muted-foreground/60">Lessons</div>
                <div className="font-medium text-foreground mt-0.5">{certificate.completedLessons}/{certificate.totalLessons}</div>
              </div>
            </div>

            <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-mono text-muted-foreground">
              <Shield className="size-3.5 text-green-400" />
              Verification ID: {certificate.verificationSlug}
            </div>
          </div>

          {certificate.projectLessons.length > 0 && (
            <div className="border-t border-border px-8 py-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="size-4 text-purple-400" />
                <h2 className="text-sm font-semibold">Completed projects</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {certificate.projectLessons.map((p) => (
                  <div
                    key={p.slug}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
                  >
                    <CheckCircle2 className="size-3.5 text-green-400 flex-shrink-0" />
                    <span className="truncate">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border px-8 py-4 bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5" />
              <span>VSLearn — Interactive coding courses</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Share2 className="size-3.5" />
                Share
              </button>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Sparkles className="size-3.5" />
                Start learning
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="size-4 text-green-400" />
              <h2 className="text-sm font-semibold">Verification</h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Certificate number</span>
                <span className="font-mono text-xs">{certificate.certificateNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification ID</span>
                <span className="font-mono text-xs">{certificate.verificationSlug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Issued</span>
                <span>{issuedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Course</span>
                <span>{certificate.courseTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
