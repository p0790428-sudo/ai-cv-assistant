import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Brain,
  Briefcase,
  GraduationCap,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CVUpload } from "@/components/CVUpload";
import { ScoreGauge } from "@/components/ScoreGauge";
import { SectionCard, TagList } from "@/components/SectionCard";
import { extractPdfText } from "@/lib/pdf";
import { analyzeCV, type CVAnalysis } from "@/lib/cv.functions";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const analyze = useServerFn(analyzeCV);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    setAnalysis(null);
    try {
      const text = await extractPdfText(file);
      if (text.length < 50) throw new Error("Couldn't extract enough text from this PDF.");
      const result = await analyze({ data: { text } });
      setAnalysis(result);
      toast.success("Analysis complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setFileName(null);
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {!analysis ? (
          <Hero>
            <CVUpload onFile={handleFile} isLoading={loading} fileName={fileName} />
          </Hero>
        ) : (
          <Dashboard analysis={analysis} fileName={fileName} onReset={reset} />
        )}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Hireform</p>
          <p className="text-[11px] text-muted-foreground">AI Recruitment Assistant</p>
        </div>
      </div>
      <a
        href="#"
        className="hidden rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground transition hover:text-foreground sm:block"
      >
        v1 · powered by Lovable AI
      </a>
    </header>
  );
}

function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="pt-10 text-center">
      <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        Smart CV screening in seconds
      </div>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
        Evaluate any candidate{" "}
        <span className="bg-gradient-primary bg-clip-text text-transparent">
          before your next coffee
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
        Upload a CV and our AI scores the candidate, extracts skills and
        experience, and suggests improvements — instantly.
      </p>
      <div className="mx-auto mt-10 max-w-2xl">{children}</div>
      <FeatureRow />
    </section>
  );
}

function FeatureRow() {
  const items = [
    { icon: Target, title: "0–100 score", desc: "Relevance for tech roles" },
    { icon: Brain, title: "Skill extraction", desc: "Technical + soft skills" },
    { icon: Lightbulb, title: "Actionable tips", desc: "ATS & content advice" },
  ];
  return (
    <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="rounded-xl border border-border bg-card/40 p-4 text-left"
        >
          <Icon className="h-5 w-5 text-primary" />
          <p className="mt-2.5 text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>
  );
}

function Dashboard({
  analysis,
  fileName,
  onReset,
}: {
  analysis: CVAnalysis;
  fileName: string | null;
  onReset: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Candidate analysis
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {analysis.candidateName || fileName || "Unnamed candidate"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{analysis.summary}</p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/50 hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Analyze another
        </button>
      </div>

      {/* Score + skills row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Overall score"
          icon={<TrendingUp className="h-4 w-4" />}
          className="flex flex-col items-center justify-center text-center"
        >
          <ScoreGauge score={analysis.score} />
          <p className="mt-4 text-sm text-muted-foreground">{analysis.scoreReasoning}</p>
        </SectionCard>

        <SectionCard
          title="Technical skills"
          icon={<Brain className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          <TagList items={analysis.technicalSkills} variant="primary" />
          <h4 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Soft skills
          </h4>
          <TagList items={analysis.softSkills} variant="muted" />
        </SectionCard>
      </div>

      {/* Experience & education */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Experience"
          icon={<Briefcase className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          {analysis.experience.length === 0 ? (
            <p className="text-sm text-muted-foreground">No experience detected.</p>
          ) : (
            <ul className="space-y-4">
              {analysis.experience.map((exp, i) => (
                <li key={i} className="border-l-2 border-primary/40 pl-4">
                  <p className="text-sm font-semibold">
                    {exp.role}
                    {exp.company ? (
                      <span className="text-muted-foreground"> · {exp.company}</span>
                    ) : null}
                  </p>
                  {exp.duration && (
                    <p className="text-xs text-muted-foreground">{exp.duration}</p>
                  )}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.highlights.map((h, j) => (
                        <li
                          key={j}
                          className="flex gap-2 text-sm text-foreground/90"
                        >
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Education" icon={<GraduationCap className="h-4 w-4" />}>
          <p className="text-base font-semibold text-primary">
            {analysis.educationLevel}
          </p>
          {analysis.education.length > 0 && (
            <ul className="mt-3 space-y-2">
              {analysis.education.map((e, i) => (
                <li key={i} className="text-sm text-foreground/90">
                  {e}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Feedback */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Strengths" icon={<CheckCircle2 className="h-4 w-4" />}>
          <TagList items={analysis.strengths} variant="success" />
        </SectionCard>
        <SectionCard title="Weak areas" icon={<AlertTriangle className="h-4 w-4" />}>
          <TagList items={analysis.weaknesses} variant="warning" />
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Missing skills" icon={<Target className="h-4 w-4" />}>
          <TagList items={analysis.missingSkills} variant="muted" />
        </SectionCard>
        <SectionCard title="ATS keywords to add" icon={<KeyRound className="h-4 w-4" />}>
          <TagList items={analysis.atsKeywords} variant="primary" />
        </SectionCard>
      </div>

      <SectionCard
        title="AI recommendations"
        icon={<Lightbulb className="h-4 w-4" />}
        className="mt-5"
      >
        {analysis.recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations.</p>
        ) : (
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-muted/40 p-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground/95">{rec}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
