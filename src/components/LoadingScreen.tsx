import React from "react";
import { Train } from "lucide-react";
import { motion } from "motion/react";

export default function LoadingScreen({ message = "Loading IntelliAlert..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="relative flex flex-col items-center">
        {/* Animated outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 rounded-full border-t-4 border-b-4 border-[#003399] border-r-transparent border-l-transparent"
        />
        
        {/* Centered blinking train icon */}
        <div className="absolute top-3 left-3 bg-white p-2.5 rounded-full shadow-sm border border-slate-100">
          <Train className="h-6 w-6 text-[#003399] animate-pulse" />
        </div>

        {/* Loading text */}
        <p className="mt-8 text-slate-700 font-sans font-bold uppercase tracking-wide animate-pulse">
          {message}
        </p>
        <span className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Indian Railways Accessibility
        </span>
      </div>
    </div>
  );
}
