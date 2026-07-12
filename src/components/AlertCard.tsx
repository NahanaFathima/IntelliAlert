import React from "react";
import { AlertCircle, ArrowRight, Clock, Map, Navigation, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface AlertCardProps {
  key?: string | number;
  alert: {
    title: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    message: string;
    timestamp: string;
    recommendedAction?: string;
    timeRemaining?: string;
    routeRequired?: boolean;
  };
  compact?: boolean;
}

export default function AlertCard({ alert, compact = false }: AlertCardProps) {
  const { title, priority, message, timestamp, recommendedAction, timeRemaining, routeRequired } = alert;

  // Visual classes based on priority matching the Bento Grid theme
  let cardClass = "";
  let badgeColor = "";
  let titleColor = "";
  let messageColor = "";
  let actionBoxClass = "";
  let actionTitleColor = "";
  let actionTextColor = "";
  let icon = <AlertCircle className="h-5 w-5" />;
  let badgeLabel = "";

  if (priority === "HIGH") {
    cardClass = "bg-[#FFEFEF] border-2 border-[#FF4D4D] text-[#850000] rounded-[32px] p-8 shadow-sm relative overflow-hidden";
    badgeColor = "bg-[#FF4D4D] text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider";
    titleColor = "text-2xl font-black text-[#850000] leading-tight";
    messageColor = "text-[#A53E3E] font-medium mt-1 text-base leading-relaxed";
    actionBoxClass = "bg-white/75 rounded-2xl p-5 border border-[#FF4D4D]/25 shadow-sm space-y-3";
    actionTitleColor = "text-[#FF4D4D] text-xs font-bold uppercase tracking-widest";
    actionTextColor = "text-xl font-black text-[#850000] leading-snug";
    icon = <ShieldAlert className="h-6 w-6 text-[#FF4D4D] animate-bounce" />;
    badgeLabel = "HIGH PRIORITY";
  } else if (priority === "MEDIUM") {
    cardClass = "bg-[#FFF9E6] border-2 border-[#FFC107] text-[#855B00] rounded-[32px] p-8 shadow-sm relative overflow-hidden";
    badgeColor = "bg-[#FFC107] text-[#855B00] px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider";
    titleColor = "text-2xl font-black text-[#855B00] leading-tight";
    messageColor = "text-[#82692F] font-medium mt-1 text-base leading-relaxed";
    actionBoxClass = "bg-white/75 rounded-2xl p-5 border border-[#FFC107]/25 shadow-sm space-y-3";
    actionTitleColor = "text-[#855B00] text-xs font-bold uppercase tracking-widest";
    actionTextColor = "text-xl font-black text-[#855B00] leading-snug";
    icon = <AlertCircle className="h-6 w-6 text-[#FFC107]" />;
    badgeLabel = "MEDIUM PRIORITY";
  } else {
    cardClass = "bg-[#F0F8FF] border-2 border-[#003399]/35 text-[#002266] rounded-[32px] p-8 shadow-sm relative overflow-hidden";
    badgeColor = "bg-[#003399]/15 text-[#003399] px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider";
    titleColor = "text-2xl font-black text-[#002266] leading-tight";
    messageColor = "text-[#3B5480] font-medium mt-1 text-base leading-relaxed";
    actionBoxClass = "bg-white/75 rounded-2xl p-5 border border-[#003399]/15 shadow-sm space-y-3";
    actionTitleColor = "text-[#003399] text-xs font-bold uppercase tracking-widest";
    actionTextColor = "text-xl font-black text-[#002266] leading-snug";
    icon = <CheckCircle2 className="h-6 w-6 text-[#003399]" />;
    badgeLabel = "LOW PRIORITY";
  }

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${cardClass} flex flex-col space-y-4`}
      id={`alert-card-${priority.toLowerCase()}`}
    >
      {/* Priority Badge */}
      <div className="absolute top-6 right-6">
        <span className={badgeColor}>
          {badgeLabel}
        </span>
      </div>

      {/* Card Header */}
      <div className="flex justify-between items-start pt-2">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className={titleColor}>
              {title}
            </h3>
            <span className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Detected {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main Alert Message */}
      <div className="bg-white/55 rounded-2xl p-5 border border-slate-100">
        <p className={messageColor} id="alert-message">
          {message}
        </p>
      </div>

      {/* Key Info / Action Box */}
      {recommendedAction && (
        <div className={actionBoxClass}>
          <div>
            <span className={actionTitleColor}>
              Recommended Action
            </span>
            <p className={actionTextColor} id="alert-action">
              {recommendedAction}
            </p>
          </div>

          {/* Time remaining indicator */}
          {timeRemaining && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-semibold flex items-center gap-1">
                {timeRemaining} remaining
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action / Map Route indicator */}
      {routeRequired && !compact && (
        <div className="pt-2 flex justify-end">
          <div className="inline-flex items-center gap-1.5 bg-[#003399] text-white hover:bg-blue-700 text-xs font-bold py-2.5 px-4 rounded-full shadow-md transition-all select-none cursor-pointer">
            <Navigation className="h-4 w-4 animate-pulse" />
            Platform Access Route Available
          </div>
        </div>
      )}
    </motion.div>
  );
}
