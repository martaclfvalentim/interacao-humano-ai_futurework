import { Check } from "lucide-react";

export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={step} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold transition-all flex-shrink-0
                ${isCompleted ? 'bg-primary text-white' : ''}
                ${isActive ? 'bg-primary text-white ring-4 ring-primary/15' : ''}
                ${!isCompleted && !isActive ? 'bg-border text-muted-foreground' : ''}
              `}>
                {isCompleted ? <Check className="w-3 h-3" /> : <span>{idx + 1}</span>}
              </div>
              <span className={`text-xs font-medium hidden sm:block whitespace-nowrap
                ${isActive ? 'text-foreground' : ''}
                ${isCompleted ? 'text-muted-foreground' : ''}
                ${!isCompleted && !isActive ? 'text-muted-foreground/60' : ''}
              `}>
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 sm:w-12 h-px mx-1 transition-all flex-shrink-0 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}