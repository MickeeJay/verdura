"use client";

import React from "react";
import { durationDaysToBlocks } from "@/lib/utils/blocks";

interface DurationSliderProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}

export function DurationSlider({ value, onChange, id = "duration-slider" }: DurationSliderProps) {
  const blocks = durationDaysToBlocks(value);
  const formattedBlocks = blocks.toLocaleString();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-semibold text-foreground cursor-pointer">
          Duration
        </label>
        <span className="font-mono text-emerald-500 font-semibold" data-testid="duration-label">
          {value} {value === 1 ? "day" : "days"} ≈ {formattedBlocks} blocks
        </span>
      </div>
      
      <input
        type="range"
        id={id}
        min={1}
        max={365}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg bg-secondary appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-muted"
      />
      
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>1 day</span>
        <span>180 days ≈ 25.9k blocks</span>
        <span>365 days ≈ 52.5k blocks</span>
      </div>
    </div>
  );
}
