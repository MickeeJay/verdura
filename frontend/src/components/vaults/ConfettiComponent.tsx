"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiComponentProps {
  particleCount?: number;
  spread?: number;
  origin?: { y: number };
  colors?: string[];
}

export function ConfettiComponent({
  particleCount = 150,
  spread = 80,
  origin = { y: 0.6 },
  colors = ["#10b981", "#3b82f6", "#f59e0b"],
}: ConfettiComponentProps) {
  useEffect(() => {
    confetti({
      particleCount,
      spread,
      origin,
      colors,
    });
  }, [particleCount, spread, origin, colors]);

  return null;
}

export default ConfettiComponent;
