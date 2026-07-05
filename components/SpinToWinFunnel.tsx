"use client";

import React, { useState, useEffect } from "react";
import { Lock, Sparkles, ShieldCheck, ArrowRight, RotateCcw, Loader2, AlertTriangle, Gift, Trophy, AlertCircle, Check } from "lucide-react";

export default function SpinToWinFunnel() {
  // Game states: 'loading' | 'idle' | 'spinning' | 'won' | 'funnel'
  const [gameState, setGameState] = useState<"loading" | "idle" | "spinning" | "won" | "funnel">("loading");
  const [rotation, setRotation] = useState(0);
  
  // Funnel links states
  const [urls, setUrls] = useState<{ step1: string; step2: string }>({ step1: "", step2: "" });
  const [apiError, setApiError] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);

  // User checklist states (persisted in localStorage)
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [step1Simulating, setStep1Simulating] = useState(false);

  // Calculate current completion percentage (0%, 50%, 100%)
  const completedCount = (step1Completed ? 1 : 0) + (step2Completed ? 1 : 0);
  const progressPercent = (completedCount / 2) * 100;

  // 1. Fetch dynamic links on mount & restore state from localStorage
  useEffect(() => {
    // A. Fetch CPA campaigns
    async function loadDynamicLinks() {
      try {
        setApiLoading(true);
        setApiError(false);
        const res = await fetch("/api/affiliate-links");
        if (!res.ok) throw new Error("API returned non-200 status");
        
        const data = await res.json();
        const s1 = data.step1Links || [];
        const s2 = data.step2Links || [];
        
        if (s1.length > 0 && s2.length > 0) {
          // Pre-select 1 random link for each step to lock the target href
          const randomStep1 = s1[Math.floor(Math.random() * s1.length)];
          const randomStep2 = s2[Math.floor(Math.random() * s2.length)];
          
          setUrls({
            step1: randomStep1,
            step2: randomStep2
          });
        } else {
          throw new Error("Missing links for Step 1 or Step 2");
        }
      } catch (err) {
        console.error("[SPIN_FUNNEL] Failed to load dynamic links:", err);
        setApiError(true);
      } finally {
        setApiLoading(false);
      }
    }
    loadDynamicLinks();

    // B. Read from localStorage
    const savedHasWon = localStorage.getItem("giveaway_has_won") === "true";
    const savedStep1 = localStorage.getItem("giveaway_step1_completed") === "true";
    const savedStep2 = localStorage.getItem("giveaway_step2_completed") === "true";

    if (savedStep1) setStep1Completed(true);
    if (savedStep2) setStep2Completed(true);

    if (savedHasWon) {
      setGameState("funnel");
    } else {
      setGameState("idle");
    }
  }, []);

  // 2. Handle Spin button click
  const handleSpin = () => {
    if (gameState !== "idle") return;

    setGameState("spinning");
    
    // Spin the wheel: 5 full rotations (1800 deg) + land on segment 3 (iPhone 17 Pro Max)
    // iPhone 17 Pro Max is at segment index 2 (between 120 and 180 degrees)
    // Adding 145 degrees ensures a centered land on the iPhone segment
    const targetRotation = 360 * 5 + 150; 
    setRotation(targetRotation);

    // Wait 4 seconds for the animation to end, then show success modal
    setTimeout(() => {
      setGameState("won");
      localStorage.setItem("giveaway_has_won", "true");
    }, 4200);
  };

  // 3. Move from "Won" modal to the 2-step funnel screen
  const proceedToFunnel = () => {
    setGameState("funnel");
  };

  // 4. Triggered when user clicks Step 1 (CPA Verification)
  const handleStep1Click = () => {
    if (step1Completed || step1Simulating) return;

    setStep1Simulating(true);

    // Simulate link open check (stores completion state after 2 seconds)
    setTimeout(() => {
      setStep1Completed(true);
      setStep1Simulating(false);
      localStorage.setItem("giveaway_step1_completed", "true");
    }, 2000);
  };

  // 5. Triggered when user clicks Step 2 (CC Shipping Payment)
  const handleStep2Click = () => {
    if (!step1Completed || step2Completed) return;

    // Simulate completion
    setStep2Completed(true);
    localStorage.setItem("giveaway_step2_completed", "true");
  };

  // 6. Reset all states (Trophy restart)
  const handleReset = () => {
    localStorage.removeItem("giveaway_has_won");
    localStorage.removeItem("giveaway_step1_completed");
    localStorage.removeItem("giveaway_step2_completed");
    setStep1Completed(false);
    setStep2Completed(false);
    setRotation(0);
    setGameState("idle");
  };

  // Global loading
  if (gameState === "loading" || apiLoading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-2xl overflow-hidden p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
        <p className="text-sm text-zinc-500 font-semibold font-sans">Connecting Secure Clearance Nodes...</p>
      </div>
    );
  }

  // API Failures
  if (apiError || !urls.step1 || !urls.step2) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-2xl overflow-hidden p-8 flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="text-amber-500 w-10 h-10 mb-4 animate-bounce" />
        <p className="text-sm font-bold text-zinc-800 font-sans">Gateway Node Error</p>
        <p className="text-xs text-zinc-400 mt-2 font-sans text-center">Could not build secure giveaway clearance pathways. Please reload or check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 relative min-h-[500px]">
      
      {/* HEADER SECTION */}
      <div className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-full px-3 py-1 mb-2">
          <Trophy size={12} className="fill-amber-100" />
          <span className="text-[9px] font-mono uppercase font-black tracking-wider">Official US Promo Giveaway</span>
        </div>
        <h1 className="text-xl font-black text-zinc-900 tracking-tight font-sans">
          iPhone 17 Pro Max Portal
        </h1>
        <p className="text-xs text-zinc-400 font-sans mt-0.5">
          Verify device routing nodes & pay $1 shipping fee
        </p>
      </div>

      {/* GAME STATE: IDLE OR SPINNING (LUCKY WHEEL) */}
      {(gameState === "idle" || gameState === "spinning") && (
        <div className="p-6 flex flex-col items-center justify-center flex-1 space-y-6">
          <p className="text-xs text-zinc-500 font-semibold text-center leading-relaxed">
            You have received 1 FREE promotional entry. Spin the wheel below to authenticate your device and claim your reward coordinates!
          </p>

          {/* SPIN WHEEL CONTAINER */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Pointer Pin Indicator */}
            <div className="absolute top-[-10px] z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600 drop-shadow-md"></div>
            
            {/* Outer Wheel Circle */}
            <div 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: gameState === "spinning" ? "transform 4000ms cubic-bezier(0.25, 0.1, 0.25, 1.0)" : "none" 
              }}
              className="w-full h-full rounded-full border-4 border-zinc-950 shadow-xl overflow-hidden bg-zinc-100 relative"
            >
              {/* SVG containing the colored wheel segments */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Segment 1: Red - TRY AGAIN */}
                <path d="M 50,50 L 50,0 A 50,50 0 0,1 93.3,25 Z" fill="#EF4444" />
                <text x="70" y="22" transform="rotate(30, 70, 22)" fill="white" className="text-[4px] font-black uppercase tracking-wider">Try Again</text>

                {/* Segment 2: Blue - $100 CARD */}
                <path d="M 50,50 L 93.3,25 A 50,50 0 0,1 93.3,75 Z" fill="#3B82F6" />
                <text x="75" y="52" transform="rotate(90, 75, 52)" fill="white" className="text-[4px] font-black uppercase tracking-wider">$100 Card</text>

                {/* Segment 3: Gold - iPhone 17 Pro Max (WINNER) */}
                <path d="M 50,50 L 93.3,75 A 50,50 0 0,1 50,100 Z" fill="#F59E0B" />
                <text x="65" y="78" transform="rotate(150, 65, 78)" fill="white" className="text-[3.5px] font-black uppercase tracking-wider">iPhone 17</text>

                {/* Segment 4: Purple - THANK YOU */}
                <path d="M 50,50 L 50,100 A 50,50 0 0,1 6.7,75 Z" fill="#8B5CF6" />
                <text x="25" y="78" transform="rotate(210, 25, 78)" fill="white" className="text-[4px] font-black uppercase tracking-wider">Thank You</text>

                {/* Segment 5: Green - 50% OFF */}
                <path d="M 50,50 L 6.7,75 A 50,50 0 0,1 6.7,25 Z" fill="#10B981" />
                <text x="15" y="52" transform="rotate(270, 15, 52)" fill="white" className="text-[4px] font-black uppercase tracking-wider">50% Off</text>

                {/* Segment 6: Dark Grey - AIRPODS */}
                <path d="M 50,50 L 6.7,25 A 50,50 0 0,1 50,0 Z" fill="#3F3F46" />
                <text x="25" y="22" transform="rotate(330, 25, 22)" fill="white" className="text-[4px] font-black uppercase tracking-wider">Airpods</text>
              </svg>
            </div>

            {/* Inner Center Spin Button */}
            <button
              onClick={handleSpin}
              disabled={gameState === "spinning"}
              className="absolute w-16 h-16 rounded-full bg-zinc-950 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center shadow-lg border-2 border-white hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:bg-zinc-800 disabled:cursor-not-allowed z-30 cursor-pointer"
            >
              {gameState === "spinning" ? "Spinning" : "SPIN"}
            </button>
          </div>
        </div>
      )}

      {/* GAME STATE: WON MODAL / OVERLAY */}
      {gameState === "won" && (
        <div className="p-6 flex flex-col items-center justify-center flex-1 space-y-6 animate-fade-in text-center">
          <div className="w-20 h-20 bg-amber-100 border border-amber-200 text-amber-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
            <Sparkles size={40} className="fill-amber-100" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 rounded px-2.5 py-1 uppercase tracking-wider">
              Verification Match Found!
            </span>
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight leading-tight uppercase font-sans">
              Congratulations!
            </h2>
            <p className="text-sm font-semibold text-emerald-600 font-sans">
              You Won The iPhone 17 Pro Max Package!
            </p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed mt-2 font-sans">
              To verify shipment delivery coordinate records, please complete 2 simple tasks. Shipping fees are discounted to just **$1.00**.
            </p>
          </div>

          <button
            onClick={proceedToFunnel}
            className="w-full py-4 rounded-xl text-white bg-zinc-950 hover:bg-zinc-800 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
          >
            <span>Proceed to claim reward</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* GAME STATE: FUNNEL (2-STEP TASK PROCESS) */}
      {gameState === "funnel" && (
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-5">
            {/* PROGRESS TRACKER */}
            <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-black tracking-widest text-zinc-500">
                  {step2Completed ? "Claim Finished" : "Pending Actions"}
                </span>
                <span className={`text-xs font-mono font-bold ${step2Completed ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {progressPercent}% Complete
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200/70 rounded-full overflow-hidden p-0.5 border border-zinc-300/30">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                />
              </div>
            </div>

            {step2Completed ? (
              // ALL STEPS DONE: CONGRATS SCREEN
              <div className="text-center py-6 flex flex-col items-center justify-center space-y-6 animate-fade-in font-sans">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  <Check size={32} className="stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                    Order Submitted!
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Verification completed & dispatch fee authorized. Your iPhone 17 Pro Max has been securely registered for shipment coordinates courier.
                  </p>
                </div>
                <div className="w-full border-t border-zinc-100 pt-6">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors uppercase cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    Restart Wheel Promo
                  </button>
                </div>
              </div>
            ) : (
              // STEPS TASKS PORTAL LIST
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-blue-600 w-5 h-5 shrink-0" />
                  <span className="text-sm font-bold text-zinc-900 font-sans">System Gateway Security Verification</span>
                </div>

                {/* STEP 1: SURVEY VERIFICATION */}
                {step1Completed ? (
                  // Step 1 - Completed
                  <div className="w-full px-5 py-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-sm font-semibold tracking-wide flex items-center justify-between transition-all duration-300 opacity-90 select-none font-sans">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs text-emerald-700 font-extrabold uppercase font-mono tracking-wider">
                        Step 1: Verify Details
                      </span>
                      <span className="text-[10px] text-emerald-600/80 font-medium font-mono mt-0.5">
                        ✅ Completed & Authenticated
                      </span>
                    </div>
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                ) : (
                  // Step 1 - Active
                  <a
                    href={urls.step1}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleStep1Click}
                    className="w-full px-5 py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md hover:shadow-blue-500/25 active:scale-[0.98] active:shadow-sm font-semibold tracking-wide text-sm flex items-center justify-between cursor-pointer border border-blue-700/30 transition-all duration-200 decoration-none animate-pulse-subtle font-sans"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-black uppercase font-mono tracking-widest text-blue-100">
                        Step 1: Verify Details
                      </span>
                      <span className="text-[10px] text-blue-200 mt-0.5 font-sans leading-none font-medium">
                        {step1Simulating ? "Awaiting redirect handshake..." : "Complete email/zip submit details authentication"}
                      </span>
                    </div>
                    {step1Simulating ? (
                      <Loader2 className="animate-spin text-white w-5 h-5 shrink-0" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-white animate-bounce-horizontal shrink-0" />
                    )}
                  </a>
                )}

                {/* STEP 2: CC $1 SHIPPING PAYMENT */}
                {step2Completed ? (
                  // Step 2 - Completed
                  <div className="w-full px-5 py-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-sm font-semibold tracking-wide flex items-center justify-between transition-all duration-300 opacity-90 select-none font-sans">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs text-emerald-700 font-extrabold uppercase font-mono tracking-wider">
                        Step 2: Pay $1 Shipping
                      </span>
                      <span className="text-[10px] text-emerald-600/80 font-medium font-mono mt-0.5">
                        ✅ Completed & Authenticated
                      </span>
                    </div>
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                ) : step1Completed ? (
                  // Step 2 - Active (Unlocked after step 1 complete)
                  <a
                    href={urls.step2}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleStep2Click}
                    className="w-full px-5 py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md hover:shadow-blue-500/25 active:scale-[0.98] active:shadow-sm font-semibold tracking-wide text-sm flex items-center justify-between cursor-pointer border border-blue-700/30 transition-all duration-200 decoration-none animate-pulse-subtle font-sans"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-black uppercase font-mono tracking-widest text-blue-100">
                        Step 2: Pay $1 Shipping
                      </span>
                      <span className="text-[10px] text-blue-200 mt-0.5 font-sans leading-none font-medium">
                        Authorize virtual escrow delivery coordinates dispatch fee
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white animate-bounce-horizontal shrink-0" />
                  </a>
                ) : (
                  // Step 2 - Locked
                  <button
                    disabled
                    className="w-full px-5 py-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-400 text-sm font-medium flex items-center justify-between opacity-50 cursor-not-allowed select-none font-sans"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-400">
                        Step 2: Pay $1 Shipping
                      </span>
                      <span className="text-[10px] text-zinc-400/70 mt-0.5 font-sans leading-none">
                        Locked until details verified
                      </span>
                    </div>
                    <Lock className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded CSS animations */}
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
