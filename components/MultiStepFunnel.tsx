"use client";

import React, { useState, useEffect } from "react";
import { Lock, Check, Sparkles, ShieldCheck, ArrowRight, RotateCcw, Loader2, AlertTriangle } from "lucide-react";

interface MultiStepFunnelProps {
  configuredSteps?: number; // Prop override (2, 3, or 4)
}

export default function MultiStepFunnel({ configuredSteps }: MultiStepFunnelProps) {
  // Read step count from prop -> then env variable -> default to 4 steps
  const envSteps = process.env.NEXT_PUBLIC_FUNNEL_STEPS 
    ? parseInt(process.env.NEXT_PUBLIC_FUNNEL_STEPS, 10) 
    : 4;
  const maxSteps = configuredSteps || envSteps || 4;

  const [currentStep, setCurrentStep] = useState(1);
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [simulatingStep, setSimulatingStep] = useState<number | null>(null);

  // Fetch dynamic classified CPA links on mount
  useEffect(() => {
    async function loadDynamicLinks() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch("/api/affiliate-links");
        if (!res.ok) throw new Error("API returned non-200 status");
        
        const data = await res.json();
        
        const s1 = data.step1Links || [];
        const s2 = data.step2Links || [];
        const s3 = data.step3Links || [];
        const s4 = data.step4Links || [];
        
        // Pick one random URL for each step to lock the target href
        const randomStep1 = s1[Math.floor(Math.random() * s1.length)] || "https://example.com/step1";
        const randomStep2 = s2[Math.floor(Math.random() * s2.length)] || "https://example.com/step2";
        const randomStep3 = s3[Math.floor(Math.random() * s3.length)] || "https://example.com/step3";
        const randomStep4 = s4[Math.floor(Math.random() * s4.length)] || "https://example.com/step4";
        
        // Collect URLs list matching active step configuration
        const loadedUrls = [randomStep1, randomStep2, randomStep3, randomStep4];
        setUrls(loadedUrls);
      } catch (err) {
        console.error("[DYNAMIC_FUNNEL] Failed to load dynamic links:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadDynamicLinks();

    // Recover step position from localStorage
    const savedStep = localStorage.getItem("giveaway_current_step");
    if (savedStep) {
      const parsed = parseInt(savedStep, 10);
      if (parsed > 0 && parsed <= maxSteps + 1) {
        setCurrentStep(parsed);
      }
    }
  }, [maxSteps]);

  // Master definitions of all potential 4 steps
  const allSteps = [
    { number: 1, label: "Step 1: Verify Human Status", desc: "Validate browser parameters via basic anti-bot security" },
    { number: 2, label: "Step 2: Submit Details", desc: "Verify email and zipcode coordinates registration" },
    { number: 3, label: "Step 3: Sponsor Task Completion", desc: "Download sponsor application tools or fill questionnaire survey" },
    { number: 4, label: "Step 4: Pay $1 Shipping Fee", desc: "Authorize final courier routing escrow dispatch fee" }
  ];

  // Slice steps matching active configurations (e.g. 2, 3, or 4 steps)
  const steps = allSteps.slice(0, maxSteps);

  // Calculate current completion percentage
  const completedCount = currentStep - 1;
  const progressPercent = Math.min((completedCount / maxSteps) * 100, 100);

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex + 1 !== currentStep) return;
    if (simulatingStep !== null) return;

    setSimulatingStep(stepIndex + 1);

    // Simulate link verification process (stores progress state in localStorage after 2 seconds)
    setTimeout(() => {
      const next = currentStep + 1;
      setCurrentStep(next);
      localStorage.setItem("giveaway_current_step", String(next));
      setSimulatingStep(null);
    }, 2000);
  };

  const handleReset = () => {
    localStorage.removeItem("giveaway_current_step");
    setCurrentStep(1);
  };

  // Render Loading skeleton during initial verification handshake
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden p-8 flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-4" />
        <p className="text-sm text-zinc-500 font-medium font-sans">Connecting security gateway...</p>
      </div>
    );
  }

  // Render Offline gateway status on failures
  if (error || urls.length < maxSteps) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden p-8 flex flex-col items-center justify-center min-h-[350px]">
        <AlertTriangle className="text-amber-500 w-8 h-8 mb-4 animate-bounce" />
        <p className="text-sm font-bold text-zinc-800 font-sans">Gateway Initialization Failed</p>
        <p className="text-xs text-zinc-400 mt-1.5 font-sans text-center">Could not establish secure verification channels. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden flex flex-col transition-all duration-300">
      
      {/* PROGRESS BAR & HEADER CONTAINER */}
      <div className="relative p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStep > maxSteps ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStep > maxSteps ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            </span>
            <span className="text-[10px] font-mono uppercase font-black tracking-widest text-zinc-500">
              {currentStep > maxSteps ? "Clearance Complete" : "Secure Verification"}
            </span>
          </div>
          <span className={`text-xs font-mono font-bold ${currentStep > maxSteps ? 'text-emerald-600' : 'text-blue-600'}`}>
            {progressPercent}% Complete
          </span>
        </div>

        {/* Outer Progress Track */}
        <div className="w-full h-2.5 bg-zinc-200/70 rounded-full overflow-hidden p-0.5 border border-zinc-300/30">
          {/* Filled Progress Segment */}
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* MULTI-STEP BODY */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        {currentStep <= maxSteps ? (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-1.5 font-sans">
                <ShieldCheck className="text-blue-600 w-5 h-5 shrink-0" />
                Security Verification Portal
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                Click each active step below, browse the verification window, and advance automatically to unlock your claim rewards.
              </p>
            </div>

            {/* Render configured vertical buttons */}
            <div className="flex flex-col gap-3">
              {steps.map((step, idx) => {
                const stepNum = step.number;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                const isLocked = stepNum > currentStep;
                const targetUrl = urls[idx] || "https://example.com";

                if (isCompleted) {
                  return (
                    <button
                      key={idx}
                      disabled
                      className="w-full px-5 py-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-sm font-semibold tracking-wide flex items-center justify-between transition-all duration-300 opacity-90 cursor-not-allowed select-none font-sans"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs text-emerald-700 font-extrabold uppercase font-mono tracking-wider">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-emerald-600/80 font-medium font-mono mt-0.5">
                          Completed ✔️
                        </span>
                      </div>
                      <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    </button>
                  );
                }

                if (isActive) {
                  return (
                    <a
                      key={idx}
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleStepClick(idx)}
                      className="w-full px-5 py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md hover:shadow-blue-500/25 active:scale-[0.98] active:shadow-sm font-semibold tracking-wide text-sm flex items-center justify-between cursor-pointer border border-blue-700/30 transition-all duration-200 decoration-none animate-pulse-subtle font-sans"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-black uppercase font-mono tracking-widest text-blue-100">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-blue-200 mt-0.5 font-sans leading-none font-medium">
                          {simulatingStep === stepNum ? "Verifying target coordinates..." : step.desc}
                        </span>
                      </div>
                      {simulatingStep === stepNum ? (
                        <Loader2 className="animate-spin text-white w-5 h-5 shrink-0" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-white animate-bounce-horizontal shrink-0" />
                      )}
                    </a>
                  );
                }

                // Locked state
                return (
                  <button
                    key={idx}
                    disabled
                    className="w-full px-5 py-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-400 text-sm font-medium flex items-center justify-between opacity-50 cursor-not-allowed select-none font-sans"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-400">
                        {step.label}
                      </span>
                      <span className="text-[10px] text-zinc-400/70 mt-0.5 font-sans leading-none">
                        Locked Verification Step
                      </span>
                    </div>
                    <Lock className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // SUCCESS STATE
          <div className="text-center py-6 flex flex-col items-center justify-center space-y-6 animate-fade-in font-sans">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-md">
              <Sparkles size={32} className="fill-emerald-50" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                Access Authorized!
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                All {maxSteps} verification gateways were resolved successfully. Your device routing is fully authenticated.
              </p>
            </div>

            <div className="w-full border-t border-zinc-100 pt-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors uppercase cursor-pointer"
              >
                <RotateCcw size={14} />
                Reset Portal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Embedded animation styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.008); box-shadow: 0 0 15px rgba(59, 130, 246, 0.18); }
        }
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
