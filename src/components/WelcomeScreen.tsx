import React from "react";

export default function WelcomeScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <h2 className="text-xl font-semibold mb-1">Welcome to Mahoday (Test)</h2>
      <p className="text-sm text-slate-400 max-w-xs">
        Local test build - no login, no backend. Chat history stays only on this device.
      </p>
    </div>
  );
}
