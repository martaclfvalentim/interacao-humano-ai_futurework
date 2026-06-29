import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, Bookmark, BookmarkCheck, ThumbsDown, ArrowRight, CheckCircle, AlertCircle, Lightbulb, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND = "http://localhost:3001";

export default function ResultsScreen({ profile, skills, preferences, chatMessages, onComplete, onBack }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [saved, setSaved] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [dismissReason, setDismissReason] = useState(null);

  useEffect(() => { generateJobs(); }, []);

  const generateJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, preferences, chatMessages: chatMessages || [] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setJobs((data.jobs || []).map((j, i) => ({ ...j, id: j.id ?? i + 1 })));
    } catch (err) {
      setError(err.message || "Failed to fetch job matches.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (id) => setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const confirmDismiss = (id) => { setDismissed(prev => [...prev, id]); setDismissReason(null); };

  const matchColor = (pct) => {
    if (pct >= 85) return "text-green-700 bg-green-100";
    if (pct >= 70) return "text-amber-700 bg-amber-100";
    return "text-red-700 bg-red-100";
  };
  const matchBarColor = (pct) => {
    if (pct >= 85) return "bg-green-500";
    if (pct >= 70) return "bg-amber-500";
    return "bg-red-400";
  };

  const visibleJobs = jobs.filter(j => !dismissed.includes(j.id));
  const savedJobObjects = jobs.filter(j => saved.includes(j.id));

  return (
    <div className="max-w-2xl mx-auto">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-foreground mb-1">Your Job Matches</h2>
        <p className="text-muted-foreground text-sm">
          {preferences?.work_mode === "remote" ? "Showing remote jobs worldwide" :
           preferences?.work_mode === "on-site" ? `Showing on-site jobs near ${profile?.location || "your location"} (${preferences?.radius_km ?? 30}km)` :
           profile?.location ? `Showing jobs near ${profile.location} + remote` :
           "Showing jobs based on your profile"}
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Finding the best matches for your profile…</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
          <button onClick={generateJobs} className="ml-2 underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {visibleJobs.map((job) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          {job.tag && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${job.tag === "Recommended" ? "bg-green-100 text-green-700" : ""}
                              ${job.tag === "Stretch" ? "bg-amber-100 text-amber-700" : ""}
                              ${job.tag === "High Potential" ? "bg-blue-100 text-blue-700" : ""}
                            `}>{job.tag}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                        <p className="text-sm text-foreground/80 mt-2">{job.summary}</p>
                      </div>
                      <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-center ${matchColor(job.match)}`}>
                        <div className="font-bold text-xl leading-none">{job.match}%</div>
                        <div className="text-xs font-medium mt-0.5">match</div>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${job.match}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full ${matchBarColor(job.match)}`} />
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"
                        onClick={() => setExpanded(expanded === job.id ? null : job.id)}>
                        {expanded === job.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {expanded === job.id ? "Hide details" : "Why this match?"}
                      </Button>
                      <div className="flex-1" />
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                            <ExternalLink className="w-4 h-4" /> View listing
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => setDismissReason(job.id)}>
                        <ThumbsDown className="w-4 h-4" /> Not for me
                      </Button>
                      <Button variant={saved.includes(job.id) ? "default" : "outline"} size="sm" className="gap-1.5"
                        onClick={() => toggleSave(job.id)}>
                        {saved.includes(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        {saved.includes(job.id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded === job.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden">
                        <div className="p-5 space-y-4 bg-secondary/30">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-foreground">Skills you have</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(job.matched || []).map(s => (
                                <span key={s} className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-semibold text-foreground">To develop</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(job.missing || []).map(s => (
                                <span key={s} className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                          {job.reason && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                              <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-blue-700">{job.reason}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {dismissReason === job.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden">
                        <div className="p-4 bg-secondary/30">
                          <p className="text-sm font-medium text-foreground mb-3">Why isn't this for you?</p>
                          <div className="flex flex-wrap gap-2">
                            {["Too junior", "Wrong industry", "Bad location", "Other"].map(r => (
                              <button key={r} onClick={() => confirmDismiss(job.id)}
                                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-destructive hover:text-destructive transition-all">
                                {r}
                              </button>
                            ))}
                            <button onClick={() => setDismissReason(null)} className="text-xs px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleJobs.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                You dismissed all matches. <button onClick={generateJobs} className="underline text-primary">Generate new ones</button>
              </div>
            )}
          </div>

          <Button onClick={() => onComplete(savedJobObjects)} className="w-full h-12 text-base font-semibold gap-2">
            Continue to Summary
            <ArrowRight className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
