import { useState, useRef, useEffect } from "react";
import { Upload, ChevronLeft, Trash2, FileText, GraduationCap, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const DEMO_PROFILES = [
  {
    id: "sara",
    name: "Sara Mendes",
    title: "Marketing Graduate",
    degree: "BSc Marketing, 2025",
    experience: "1 year (internship)",
    icon: GraduationCap,
    tag: "Recent graduate",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    language: "en",
    location: "Lisbon, Portugal",
    summary: "Sara Mendes is a marketing graduate with a strong foundation in digital content, social media strategy, and data-driven marketing. She completed a one-year internship where she managed brand accounts and produced analytics reports. She is now looking for her first full-time marketing role.",
    years_experience: 1,
    education: [
      { degree: "BSc Marketing", institution: "ISCTE – University Institute of Lisbon", year: "2022–2025", status: "completed", notes: null },
    ],
    suggested_careers: ["Social Media Manager", "Content Marketing Specialist", "Digital Marketing Executive", "Brand Assistant", "Marketing Coordinator"],
    skills: [
      { name: "Social Media Management", source: "extracted" },
      { name: "Content Writing", source: "extracted" },
      { name: "Google Analytics", source: "extracted" },
      { name: "Canva", source: "extracted" },
      { name: "Email Marketing", source: "extracted" },
      { name: "Microsoft Office", source: "extracted" },
      { name: "Brand Strategy", source: "inferred" },
      { name: "Campaign Planning", source: "inferred" },
    ],
  },
  {
    id: "marco",
    name: "Marco Silva",
    title: "Finance Professional",
    degree: "MSc Finance, 2019",
    experience: "6 years (finance sector)",
    icon: Briefcase,
    tag: "Career change",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
    language: "en",
    location: "Porto, Portugal",
    summary: "Marco Silva is a finance professional with six years of experience in financial modelling, risk analysis, and data-driven decision making. He holds an MSc in Finance and has worked across banking and corporate finance environments. He is now seeking a transition into data or business analytics roles.",
    years_experience: 6,
    education: [
      { degree: "MSc Finance", institution: "Católica Lisbon School of Business & Economics", year: "2017–2019", status: "completed", notes: null },
      { degree: "BSc Economics", institution: "University of Porto", year: "2014–2017", status: "completed", notes: null },
    ],
    suggested_careers: ["Business Analyst", "Data Analyst", "Financial Analyst", "BI Analyst", "Management Consultant"],
    skills: [
      { name: "Financial Modeling", source: "extracted" },
      { name: "Advanced Excel", source: "extracted" },
      { name: "SQL", source: "extracted" },
      { name: "Risk Analysis", source: "extracted" },
      { name: "Team Leadership", source: "extracted" },
      { name: "PowerPoint", source: "extracted" },
      { name: "Data Analysis", source: "inferred" },
      { name: "Stakeholder Management", source: "inferred" },
      { name: "Problem Solving", source: "inferred" },
    ],
  },
];

function cvKey(email) { return `futurework_cvs_${email}`; }

function getSavedCVs(email) {
  if (!email) return [];
  try { const raw = localStorage.getItem(cvKey(email)); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function addSavedCV(email, profile, fileName) {
  if (!email) return [];
  const existing = getSavedCVs(email);
  const id = Date.now();
  const filtered = existing.filter(c => c.fileName !== fileName);
  const updated = [{ id, profile, fileName, savedAt: id }, ...filtered];
  localStorage.setItem(cvKey(email), JSON.stringify(updated));
  return updated;
}

function deleteSavedCV(email, id) {
  if (!email) return [];
  const existing = getSavedCVs(email);
  const updated = existing.filter(c => c.id !== id && c.savedAt !== id);
  localStorage.setItem(cvKey(email), JSON.stringify(updated));
  return updated;
}

export default function UploadScreen({ onComplete, onBack }) {
  const { user } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [savedCVs, setSavedCVs] = useState(() => getSavedCVs(user?.email));
  const fileInputRef = useRef(null);

  useEffect(() => { setSavedCVs(getSavedCVs(user?.email)); }, [user?.email]);

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") { setUploadError("Please upload a PDF file."); return; }
    setUploadError(null);
    setLoading(true);
    setSelectedId("upload");
    try {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("http://localhost:3001/api/parse-cv", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse CV");
      const profile = {
        ...data,
        skills: [
          ...(data.skills_explicit || []).map(n => ({ name: n, source: "extracted" })),
          ...(data.skills_inferred || []).map(n => ({ name: n, source: "inferred" })),
        ],
      };
      if (user?.email) {
        const updated = addSavedCV(user.email, profile, file.name);
        setSavedCVs(updated);
      }
      onComplete(profile);
    } catch (err) {
      setUploadError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
      setSelectedId(null);
    }
  };

  const handleUseSaved = (entry) => {
    if (loading) return;
    const entryId = entry.id ?? entry.savedAt;
    setLoading(true);
    setSelectedId(entryId);
    setTimeout(() => { setLoading(false); onComplete(entry.profile); }, 600);
  };

  const handleDeleteSaved = (id) => {
    const updated = deleteSavedCV(user?.email, id);
    setSavedCVs(updated);
  };

  const handleSelectDemo = (profile) => {
    if (loading) return;
    setSelectedId(profile.id);
    setLoading(true);
    setTimeout(() => { setLoading(false); onComplete(profile); }, 1800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Start with your CV</h2>
        <p className="text-muted-foreground">
          {user ? "Upload a new CV or continue with a previous one." : "Upload your CV or select a demo profile to see how FutureWork works."}
        </p>
      </div>

      {/* Saved CVs — logged in only */}
      {user && savedCVs.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your saved CVs</p>
          <div className="space-y-3">
            <AnimatePresence>
              {savedCVs.map((entry) => {
                const entryId = entry.id ?? entry.savedAt;
                const isSelected = selectedId === entryId;
                return (
                  <motion.div key={entryId} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between gap-3 p-4 bg-white border border-border rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{entry.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.profile?.name || "CV"} · {new Date(entry.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant={isSelected ? "default" : "outline"}
                        onClick={() => handleUseSaved(entry)} disabled={loading}>
                        {isSelected && loading
                          ? <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Loading…</span>
                          : "Use this CV"}
                      </Button>
                      <button onClick={() => handleDeleteSaved(entryId)} disabled={loading}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or upload a new CV</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer mb-6
          ${dragging ? "border-primary bg-blue-50" : "border-border bg-white hover:border-primary/50 hover:bg-secondary/40"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Drag & drop your CV</p>
            <p className="text-sm text-muted-foreground mt-1">PDF · max 5MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse files</Button>
        </div>
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{uploadError}</p>
      )}

      {/* Demo profiles — only when NOT logged in */}
      {!user && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with a demo profile</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {DEMO_PROFILES.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedId === profile.id;
              return (
                <motion.button key={profile.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectDemo(profile)} disabled={loading}
                  className={`text-left p-5 rounded-xl border-2 bg-white transition-all
                    ${isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/40 hover:shadow-sm"}
                    disabled:opacity-60 disabled:cursor-wait`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary" : "bg-secondary"}`}>
                      {isSelected && loading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-primary"}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{profile.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${profile.tagColor}`}>{profile.tag}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{profile.degree}</p>
                      <p className="text-xs text-muted-foreground">{profile.experience}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.skills.slice(0, 3).map(s => (
                          <span key={s.name} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s.name}</span>
                        ))}
                        <span className="text-xs text-muted-foreground">+{profile.skills.length - 3}</span>
                      </div>
                    </div>
                    {isSelected && !loading && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {loading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-center gap-3 text-sm text-muted-foreground bg-white border border-border rounded-xl p-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span>{selectedId === "upload" ? "Analysing your CV…" : "Loading profile…"}</span>
        </motion.div>
      )}
    </div>
  );
}
