"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface LinkRotatorButtonProps {
  buttonText?: string;
  className?: string;
}

export default function LinkRotatorButton({
  buttonText = "Verify & Claim Reward",
  className = "",
}: LinkRotatorButtonProps) {
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic rotator links from API route on mount
  useEffect(() => {
    async function loadLinks() {
      try {
        setLoading(true);
        const res = await fetch("/api/affiliate-links");
        if (!res.ok) throw new Error("API returned non-200 status");
        
        const data = await res.json();
        if (data.links && Array.isArray(data.links) && data.links.length > 0) {
          setLinks(data.links);
        }
      } catch (err) {
        console.error("[ROTATOR] Failed to load dynamic links.", err);
      } finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);
  
  // 2. EVENT HANDLER FOR RANDOM REDIRECT
  const handleRedirect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (typeof window === "undefined" || links.length === 0) return;

    // Pick a random URL from the current active array (dynamic or fallback)
    const randomIndex = Math.floor(Math.random() * links.length);
    const randomLink = links[randomIndex];

    // Open the random URL safely in a new tab if defined
    if (randomLink) {
      window.open(randomLink, "_blank");
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <button
        onClick={handleRedirect}
        disabled={loading || links.length === 0}
        className={`
          relative inline-flex items-center justify-center gap-2.5 px-8 py-4 
          font-bold text-white text-base tracking-wide uppercase rounded-xl
          bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
          disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed
          shadow-lg shadow-blue-500/25 disabled:shadow-none hover:shadow-blue-500/35 active:scale-[0.98]
          border border-blue-700/20 disabled:border-zinc-800 hover:border-blue-600/30
          transition-all duration-200 cursor-pointer select-none font-sans
          ${loading ? "" : "animate-pulse-subtle"} ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin text-zinc-500 w-4 h-4" />
            <span>Securing gateway...</span>
          </>
        ) : links.length === 0 ? (
          <span>Gateway Offline</span>
        ) : (
          <>
            <span>{buttonText}</span>
            <ExternalLink size={18} className="shrink-0" />
          </>
        )}
      </button>

      {/* Subtle pulsing animation style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); box-shadow: 0 0 20px rgba(59, 130, 246, 0.25); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2.5s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
