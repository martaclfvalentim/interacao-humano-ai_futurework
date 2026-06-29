import { useState } from "react";
import Navbar from "@/components/futurework/Navbar";
import LandingScreen from "@/components/futurework/LandingScreen";
import UploadScreen from "@/components/futurework/UploadScreen";
import SkillReviewScreen from "@/components/futurework/SkillReviewScreen";
import ChatScreen from "@/components/futurework/ChatScreen";
import ResultsScreen from "@/components/futurework/ResultsScreen";
import SummaryScreen from "@/components/futurework/SummaryScreen";
import ProgressStepper from "@/components/futurework/ProgressStepper";

const STEPS = ["Upload CV", "Review Skills", "Conversation", "Job Matches", "Your Plan"];

export default function FutureWork() {
  const [step, setStep] = useState(-1);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [confidenceRating, setConfidenceRating] = useState(null);

  const handleStart = () => setStep(0);

  const handleUploadComplete = (profileData) => {
    setProfile(profileData);
    setSkills(profileData.skills);
    setStep(1);
  };

  const handleSkillsConfirmed = (confirmedSkills, updatedProfile) => {
    setSkills(confirmedSkills);
    if (updatedProfile) setProfile(updatedProfile);
    setStep(2);
  };

  const handleChatComplete = ({ preferences: prefs, chatMessages: msgs }) => {
    setPreferences(prefs);
    setChatMessages(msgs || []);
    setStep(3);
  };

  const handleJobsReviewed = (saved) => {
    setSavedJobs(saved);
    setStep(4);
  };

  const handleBack = () => setStep(prev => Math.max(0, prev - 1));

  const handleRestart = () => {
    setStep(-1);
    setProfile(null);
    setSkills([]);
    setPreferences({});
    setChatMessages([]);
    setSavedJobs([]);
    setConfidenceRating(null);
  };

  return (
    <div className="min-h-screen bg-background font-dm">
      <Navbar onStartDemo={handleStart} onGoHome={() => setStep(-1)} />

      {step >= 0 && step < 5 && (
        <div className="border-b border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <ProgressStepper steps={STEPS} currentStep={step} />
          </div>
        </div>
      )}

      {step === -1 && <LandingScreen onStart={handleStart} />}

      {step >= 0 && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {step === 0 && <UploadScreen onComplete={handleUploadComplete} onBack={() => setStep(-1)} />}
          {step === 1 && <SkillReviewScreen skills={skills} profile={profile} onConfirm={handleSkillsConfirmed} onBack={handleBack} />}
          {step === 2 && <ChatScreen profile={profile} skills={skills} onComplete={handleChatComplete} onBack={handleBack} />}
          {step === 3 && (
            <ResultsScreen
              profile={profile}
              skills={skills}
              preferences={preferences}
              chatMessages={chatMessages}
              onComplete={handleJobsReviewed}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <SummaryScreen
              savedJobs={savedJobs}
              skills={skills}
              preferences={preferences}
              confidenceRating={confidenceRating}
              setConfidenceRating={setConfidenceRating}
              onRestart={handleRestart}
              onRefine={() => setStep(2)}
              onBack={handleBack}
            />
          )}
        </main>
      )}
    </div>
  );
}
