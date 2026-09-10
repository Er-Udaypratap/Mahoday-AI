import React, { useRef } from "react";

interface Star {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

function makeStars(count: number, sizeMin: number, sizeMax: number): Star[] {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * (sizeMax - sizeMin) + sizeMin,
    delay: Math.random() * 4,
    duration: Math.random() * 2 + 2,
  }));
}

export default function SpaceBackground() {
  const farStars = useRef(makeStars(110, 0.5, 2)).current;
  const nearStars = useRef(makeStars(35, 1.5, 3.5)).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#05061a]">
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-indigo-700/25 blur-[100px] animate-drift" />
      <div
        className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-blue-500/15 blur-[100px] animate-drift"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-purple-700/20 blur-[100px] animate-drift"
        style={{ animationDelay: "3s" }}
      />

      {farStars.map((s, i) => (
        <div
          key={`f-${i}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      {nearStars.map((s, i) => (
        <div
          key={`n-${i}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            boxShadow: "0 0 4px 1px rgba(255,255,255,0.6)",
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
