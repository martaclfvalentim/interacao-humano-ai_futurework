import { useState } from "react";
import { X, Plus, ChevronLeft, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function SkillReviewScreen({ skills: initialSkills, profile, onConfirm, onBack }) {
  const [skills, setSkills] = useState(initialSkills || []);
  const [newSkill, setNewSkill] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);

  // Summary editing
  const [summary, setSummary] = useState(profile?.summary || "");
  const [editingSummary, setEditingSummary] = useState(false);

  // Education editing
  const [education, setEducation] = useState(profile?.education || []);
  const [editingEduIdx, setEditingEduIdx] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", year: "" });

  // Experience editing
  const [experience, setExperience] = useState(Array.isArray(profile?.experience) ? profile.experience : []);
  const [editingExpIdx, setEditingExpIdx] = useState(null);
  const [editingExp, setEditingExp] = useState(null);
  const [addingExp, setAddingExp] = useState(false);
  const [newExp, setNewExp] = useState({ title: "", company: "", start: "", end: "", type: "full-time", description: "" });

  // Years experience editing
  const [yearsExp, setYearsExp] = useState(profile?.years_experience ?? "");
  const [editingYears, setEditingYears] = useState(false);

  // Career paths editing
  const [careers, setCareers] = useState(profile?.suggested_careers || []);
  const [newCareer, setNewCareer] = useState("");
  const [showCareerInput, setShowCareerInput] = useState(false);

  const sourceStyle = {
    extracted: "bg-green-100 text-green-700 border-green-200",
    inferred: "bg-amber-100 text-amber-700 border-amber-200",
    user_added: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const sourceLegend = [
    { key: "extracted", label: "From CV" },
    { key: "inferred", label: "Inferred" },
    { key: "user_added", label: "Added by you" },
  ];

  // Skills
  const removeSkill = (name) => setSkills(skills.filter(s => s.name !== name));
  const addSkill = () => {
    const t = newSkill.trim();
    if (t && !skills.find(s => s.name.toLowerCase() === t.toLowerCase())) {
      setSkills([...skills, { name: t, source: "user_added" }]);
      setNewSkill("");
      setShowSkillInput(false);
    }
  };

  // Education
  const startEditEdu = (idx) => {
    setEditingEduIdx(idx);
    setEditingEdu({ ...education[idx] });
  };
  const saveEditEdu = () => {
    const updated = education.map((e, i) => i === editingEduIdx ? editingEdu : e);
    setEducation(updated);
    setEditingEduIdx(null);
    setEditingEdu(null);
  };
  const removeEdu = (idx) => setEducation(education.filter((_, i) => i !== idx));
  const addEdu = () => {
    if (newEdu.degree.trim()) {
      setEducation([...education, { ...newEdu }]);
      setNewEdu({ degree: "", institution: "", year: "" });
      setAddingEdu(false);
    }
  };

  // Career paths
  const removeCareer = (c) => setCareers(careers.filter(x => x !== c));
  const addCareer = () => {
    const t = newCareer.trim();
    if (t && !careers.includes(t)) {
      setCareers([...careers, t]);
      setNewCareer("");
      setShowCareerInput(false);
    }
  };

  // Experience
  const startEditExp = (idx) => {
    setEditingExpIdx(idx);
    setEditingExp({ ...experience[idx] });
  };
  const saveEditExp = () => {
    const updated = experience.map((e, i) => i === editingExpIdx ? editingExp : e);
    setExperience(updated);
    setEditingExpIdx(null);
    setEditingExp(null);
  };
  const removeExp = (idx) => setExperience(experience.filter((_, i) => i !== idx));
  const addExp = () => {
    if (newExp.title.trim()) {
      setExperience([...experience, { ...newExp }]);
      setNewExp({ title: "", company: "", start: "", end: "", type: "full-time", description: "" });
      setAddingExp(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(skills, { ...profile, summary, education, experience, suggested_careers: careers, years_experience: yearsExp === "" ? null : Number(yearsExp) });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">CV Analysis</h2>
        <p className="text-muted-foreground text-sm">Review and edit the extracted information before continuing.</p>
      </div>

      {/* File badge */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700 text-xs font-bold">PDF</div>
        <div>
          <p className="text-sm font-medium text-green-800">{profile?.name ? `${profile.name}'s CV` : "Uploaded CV"}</p>
          <p className="text-xs text-green-600">Click or drag to replace</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Professional Summary</h3>
          {!editingSummary && (
            <button onClick={() => setEditingSummary(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        {editingSummary ? (
          <div className="space-y-2">
            <textarea
              className="w-full text-sm text-muted-foreground leading-relaxed border border-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setEditingSummary(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setEditingSummary(false)}>
                <Check className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{summary || "No summary available."}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5 text-center relative group">
          {editingYears ? (
            <input
              type="number" min="0" max="60" value={yearsExp}
              onChange={e => setYearsExp(e.target.value)}
              onBlur={() => setEditingYears(false)}
              onKeyDown={e => e.key === "Enter" && setEditingYears(false)}
              autoFocus
              className="w-20 text-3xl font-bold text-foreground text-center border-b-2 border-primary focus:outline-none bg-transparent"
            />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">{yearsExp !== "" ? yearsExp : "—"}</p>
              <button onClick={() => setEditingYears(true)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-1">Years exp.</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-foreground">{skills.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Skills</p>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Your Skills</h3>
          <span className="text-xs text-muted-foreground">{skills.length} skills detected</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sourceLegend.map(({ key, label }) => (
            <span key={key} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sourceStyle[key]}`}>{label}</span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {skills.map((skill) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${sourceStyle[skill.source] || sourceStyle.extracted}`}
              >
                <span>{skill.name}</span>
                <button onClick={() => removeSkill(skill.name)} className="opacity-60 hover:opacity-100 transition-opacity ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showSkillInput ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Input
                  autoFocus value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addSkill()}
                  placeholder="Skill name…"
                  className="h-8 text-sm w-36"
                />
                <Button size="sm" onClick={addSkill} className="h-8 px-3">Add</Button>
                <button onClick={() => setShowSkillInput(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setShowSkillInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-dashed border-border text-muted-foreground text-sm hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add skill
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Education</h3>
          <button onClick={() => setAddingEdu(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {education.map((edu, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3">
              {editingEduIdx === idx ? (
                <div className="flex-1 space-y-2">
                  <Input value={editingEdu.degree} onChange={e => setEditingEdu({ ...editingEdu, degree: e.target.value })} placeholder="Degree" className="h-8 text-sm" />
                  <Input value={editingEdu.institution} onChange={e => setEditingEdu({ ...editingEdu, institution: e.target.value })} placeholder="Institution" className="h-8 text-sm" />
                  <Input value={editingEdu.year || ""} onChange={e => setEditingEdu({ ...editingEdu, year: e.target.value })} placeholder="Year (e.g. 2023)" className="h-8 text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditEdu}><Check className="w-3 h-3 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingEduIdx(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                      <p className="text-xs text-muted-foreground">{edu.institution}{edu.year ? ` · ${edu.year}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEditEdu(idx)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeEdu(idx)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {addingEdu && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Input value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} placeholder="Degree" className="h-8 text-sm" autoFocus />
              <Input value={newEdu.institution} onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })} placeholder="Institution" className="h-8 text-sm" />
              <Input value={newEdu.year} onChange={e => setNewEdu({ ...newEdu, year: e.target.value })} placeholder="Year (e.g. 2025)" className="h-8 text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={addEdu}><Plus className="w-3 h-3 mr-1" />Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingEdu(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {education.length === 0 && !addingEdu && (
            <p className="text-sm text-muted-foreground">No education entries found.</p>
          )}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Professional Experience</h3>
          <button onClick={() => setAddingExp(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative space-y-0">
          {/* Vertical timeline line */}
          {(experience.length > 0 || addingExp) && (
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
          )}

          {experience.map((exp, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0">
              {editingExpIdx === idx ? (
                <div className="flex-1 space-y-2 ml-6">
                  <Input value={editingExp.title} onChange={e => setEditingExp({ ...editingExp, title: e.target.value })} placeholder="Job title" className="h-8 text-sm" autoFocus />
                  <Input value={editingExp.company} onChange={e => setEditingExp({ ...editingExp, company: e.target.value })} placeholder="Company" className="h-8 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={editingExp.start || ""} onChange={e => setEditingExp({ ...editingExp, start: e.target.value })} placeholder="Start (e.g. Jan 2022)" className="h-8 text-sm" />
                    <Input value={editingExp.end || ""} onChange={e => setEditingExp({ ...editingExp, end: e.target.value })} placeholder="End (or leave blank)" className="h-8 text-sm" />
                  </div>
                  <select
                    value={editingExp.type || "full-time"}
                    onChange={e => setEditingExp({ ...editingExp, type: e.target.value })}
                    className="w-full h-8 text-sm border border-border rounded-md px-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {["full-time", "part-time", "internship", "freelance", "volunteer", "erasmus-work"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <textarea
                    value={editingExp.description || ""}
                    onChange={e => setEditingExp({ ...editingExp, description: e.target.value })}
                    placeholder="Key responsibilities and achievements"
                    rows={2}
                    className="w-full text-sm border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditExp}><Check className="w-3 h-3 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingExpIdx(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 rounded-full bg-primary mt-1 flex-shrink-0 z-10 ring-2 ring-white" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">{exp.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.company}
                          {(exp.start || exp.end) && (
                            <> · {exp.start}{exp.end ? ` – ${exp.end}` : " – Present"}</>
                          )}
                          {exp.type && <> · <span className="capitalize">{exp.type}</span></>}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => startEditExp(idx)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeExp(idx)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {addingExp && (
            <div className="space-y-2 pt-2 border-t border-border ml-6">
              <Input value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} placeholder="Job title" className="h-8 text-sm" autoFocus />
              <Input value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} placeholder="Company" className="h-8 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={newExp.start} onChange={e => setNewExp({ ...newExp, start: e.target.value })} placeholder="Start (e.g. Jan 2022)" className="h-8 text-sm" />
                <Input value={newExp.end} onChange={e => setNewExp({ ...newExp, end: e.target.value })} placeholder="End (or leave blank)" className="h-8 text-sm" />
              </div>
              <select
                value={newExp.type}
                onChange={e => setNewExp({ ...newExp, type: e.target.value })}
                className="w-full h-8 text-sm border border-border rounded-md px-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {["full-time", "part-time", "internship", "freelance", "volunteer", "erasmus-work"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea
                value={newExp.description}
                onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                placeholder="Key responsibilities and achievements (optional)"
                rows={2}
                className="w-full text-sm border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addExp}><Plus className="w-3 h-3 mr-1" />Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingExp(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {experience.length === 0 && !addingExp && (
            <p className="text-sm text-muted-foreground">No experience entries found.</p>
          )}
        </div>
      </div>

      {/* Suggested Career Paths */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-3">Suggested Career Paths</h3>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {careers.map((c) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary text-sm text-foreground font-medium"
              >
                <span>{c}</span>
                <button onClick={() => removeCareer(c)} className="opacity-60 hover:opacity-100 transition-opacity ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showCareerInput ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Input
                  autoFocus value={newCareer}
                  onChange={e => setNewCareer(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCareer()}
                  placeholder="Career title…"
                  className="h-8 text-sm w-40"
                />
                <Button size="sm" onClick={addCareer} className="h-8 px-3">Add</Button>
                <button onClick={() => setShowCareerInput(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setShowCareerInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-dashed border-border text-muted-foreground text-sm hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add career
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Button onClick={handleConfirm} className="w-full h-12 text-base font-semibold">
        Continue to Chatbot
      </Button>
    </div>
  );
}