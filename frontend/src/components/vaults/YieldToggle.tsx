"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface YieldToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function YieldToggle({ checked, onChange, id = "yield-toggle" }: YieldToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-emerald-500/30 transition-all duration-200 shadow-sm">
        <div className="flex items-center gap-2">
          <label
            htmlFor={id}
            className="text-sm font-semibold tracking-tight text-foreground cursor-pointer select-none"
          >
            Earn BTC Yield
          </label>
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground focus:outline-none rounded-full p-0.5"
              aria-label="Yield explanation tooltip"
              aria-describedby="yield-tooltip"
            >
              <HelpCircle className="size-4" />
            </button>
            {showTooltip && (
              <div
                id="yield-tooltip"
                role="tooltip"
                className="absolute z-50 w-64 p-3 text-xs text-popover-foreground bg-popover border border-border rounded-lg shadow-xl bottom-full mb-2 left-0 transition-all duration-150 animate-in fade-in slide-in-from-bottom-1"
              >
                <div className="font-semibold text-emerald-500 mb-1">Yield Routing Mechanism</div>
                Yield-bearing vaults route deposited principal to the Yield Router, which aggregates capital to earn Bitcoin-backed yield. Upon maturity, principal plus yield is returned to your account.
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
            checked ? "bg-emerald-500" : "bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
