import { ArrowRight, CheckCircle, BarChart2, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const FEATURES = [
  { icon: ShieldCheck, title: "Transparent matching", desc: "Every recommendation comes with a detailed breakdown, no black boxes, no guesswork." },
  { icon: BarChart2, title: "Skill gap analysis", desc: "Know exactly what you're missing and the fastest way to bridge the gap." },
  { icon: Zap, title: "Adaptive questioning", desc: "Our system only asks what it doesn't already know from your CV, saving you time." },
  { icon: Users, title: "Built for transitions", desc: "Whether you're a fresh graduate or a seasoned professional we meet you where you are." }
];

const STATS = [
  { value: "00%", label: "of users find a relevant match\nin under 5 minutes" },
  { value: "0.0x", label: "more interview callbacks vs\ngeneric job boards" },
  { value: "00%", label: "report feeling more confident\nafter 1 session" },
];

const STEPS = [
  { n: "01", title: "Upload your CV", desc: "We extract your skills, experience and education automatically." },
  { n: "02", title: "Review & refine", desc: "Confirm what we found, add anything we missed, remove what doesn't fit." },
  { n: "03", title: "Quick conversation", desc: "We ask a few contextual questions to understand your goals and preferences." },
  { n: "04", title: "Get matched & explained", desc: "See roles ranked by fit with a full breakdown of matches and skill gaps." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } })
};

export default function LandingScreen({ onStart }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="font-dm">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {firstName && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="text-lg text-primary font-semibold mb-3">
            Hello, {firstName}
          </motion.p>
        )}
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6 max-w-2xl">
          Find the right role.<br />Know exactly why.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base text-muted-foreground max-w-md mb-10 leading-relaxed">
          FutureWork analyses your CV, understands your goals, and matches you to jobs with transparent, step-by-step reasoning — not just a score.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-10">
          <Button size="lg" onClick={onStart} className="gap-2 h-11 px-7 text-base font-semibold">
            {user ? "Start analysis" : "Start for free"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          {["No credit card required", "Results in under 5 minutes", "Full explanation included"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />{t}
            </span>
          ))}
        </motion.div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border text-center">
          {STATS.map((s, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="py-6 sm:py-0 px-6">
              <div className="text-4xl font-bold text-primary mb-2">{s.value}</div>
              <div className="text-sm text-muted-foreground leading-snug whitespace-pre-line">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-3">Designed for real decisions</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Not another job board. A career intelligence platform built around understanding yours.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="border border-border rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">How it works</h2>
          <p className="text-muted-foreground mb-12">Four steps from CV to confident career decision</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={step.n} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="text-5xl font-bold text-border mb-4">{step.n}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to find your next role?</h2>
          <p className="text-muted-foreground mb-8">Start with your CV. Get clarity in minutes. No commitment required.</p>
          <Button size="lg" onClick={onStart} className="h-12 px-8 font-semibold gap-2">
            Get started — it's free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">© 2026 FutureWork, project Human-AI Interaction</p>
        </div>
      </footer>
    </div>
  );
}
