import { useState } from "react";
import { Bookmark, RotateCcw, MessageSquare, Star, ExternalLink, TrendingUp, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const skillGaps = {
  sara: [
    { skill: "Video Editing", reason: "Required in 60% of content roles", resource: "YouTube Free Course", url: "https://www.youtube.com/results?search_query=video+editing+tutorial" },
    { skill: "Paid Advertising (Meta)", reason: "Boosts your match to 90%+ on 5 more roles", resource: "Meta Blueprint (Free)", url: "https://www.facebook.com/business/learn" },
    { skill: "A/B Testing", reason: "Key for analytical marketing roles", resource: "Coursera — 4h", url: "https://www.coursera.org/search?query=ab+testing" },
  ],
  marco: [
    { skill: "Product Roadmapping", reason: "Core PM skill — unlocks 8 more roles", resource: "Reforge Fundamentals", url: "https://www.reforge.com" },
    { skill: "Python (basics)", reason: "Moves you from analyst to senior analyst", resource: "Codecademy — Free", url: "https://www.codecademy.com/learn/learn-python-3" },
    { skill: "Agile / Scrum", reason: "Required in 75% of tech roles", resource: "Scrum.org — Free cert", url: "https://www.scrum.org/open-assessments/scrum-open" },
  ]
};

export default function SummaryScreen({ savedJobs, skills, preferences, confidenceRating, setConfidenceRating, onRestart, onRefine, onBack }) {
  const [showConfidenceFeedback, setShowConfidenceFeedback] = useState(false);
  const profileId = savedJobs?.[0] ? (savedJobs[0].id <= 3 && skills.some(s => s.name === "Social Media Management") ? "sara" : "marco") : "sara";
  const gaps = skillGaps[profileId] || skillGaps.sara;

  const handleConfidence = (rating) => {
    setConfidenceRating(rating);
    setShowConfidenceFeedback(true);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      <div className="mb-8 text-center">
        <h2 className="font-sora font-bold text-2xl text-foreground mb-2">Your Career Snapshot</h2>
        <p className="text-muted-foreground text-sm">Here's a summary of your session and your next steps.</p>
      </div>

      {/* Saved Jobs */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Saved Roles ({savedJobs.length})</h3>
        </div>
        {savedJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">You didn't save any roles — go back to explore your matches.</p>
        ) : (
          <div className="space-y-3">
            {savedJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between gap-3 p-3 bg-secondary/40 rounded-xl">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company} · {job.location}</p>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg flex-shrink-0">{job.match}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Gap Plan */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Skill Gap Action Plan</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Learning these 3 skills would unlock significantly more opportunities:</p>
        <div className="space-y-3">
          {gaps.map((gap, i) => (
            <motion.div key={gap.skill} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-start justify-between gap-3 p-3 bg-secondary/40 rounded-xl">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">{gap.skill}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{gap.reason}</p>
              </div>
              <a href={gap.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 flex-shrink-0 text-xs text-primary font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full transition-colors">
                <BookOpen className="w-3 h-3" />
                {gap.resource}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confidence Rating */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-1">How do you feel about these results?</h3>
        <p className="text-sm text-muted-foreground mb-4">Your rating helps us improve future recommendations.</p>
        {!confidenceRating ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(r => (
              <button key={r} onClick={() => handleConfidence(r)}
                className="flex-1 py-2.5 rounded-xl border border-border hover:border-primary hover:bg-blue-50 transition-all text-sm font-medium flex flex-col items-center gap-1 group">
                <Star className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                <span className="text-muted-foreground group-hover:text-primary">{r}</span>
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(r => (
                <Star key={r} className={`w-5 h-5 ${r <= confidenceRating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {confidenceRating >= 4 ? "Great! Your feedback helps us refine future sessions." : "Thanks for the feedback — would you like to refine your preferences?"}
            </p>
          </motion.div>
        )}
        {showConfidenceFeedback && confidenceRating < 4 && (
          <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={onRefine}>
            <MessageSquare className="w-4 h-4" /> Re-do the chat with new preferences
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2" onClick={onRestart}>
          <RotateCcw className="w-4 h-4" /> Start over
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={onRefine}>
          <MessageSquare className="w-4 h-4" /> Refine preferences
        </Button>
      </div>

      <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-dashed border-border">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <span className="font-semibold text-foreground">Demo note:</span> This is a prototype for the Human-AI Interaction course.
        </p>
      </div>
    </div>
  );
}
