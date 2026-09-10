import React from "react";
import { Zap } from "lucide-react";

export default function ElectricThinking() {
  return (
    <div className="flex items-center gap-2 pl-1">
      <div className="relative flex items-center justify-center w-7 h-7">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400/30 animate-ping" />
        <Zap className="relative w-4 h-4 text-blue-400 animate-blink" fill="currentColor" />
      </div>
      <span className="text-xs text-slate-400 tracking-wide">Mahoday is thinking...</span>
    </div>
  );
}
