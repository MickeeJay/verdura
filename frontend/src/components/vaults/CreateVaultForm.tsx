"use client";

import React, { useState } from "react";
import { DurationSlider } from "./DurationSlider";
import { YieldToggle } from "./YieldToggle";

export function CreateVaultForm() {
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [yieldEnabled, setYieldEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, durationDays, yieldEnabled });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-card border border-border rounded-2xl shadow-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Create Savings Vault
        </h2>
        <p className="text-sm text-muted-foreground">
          Initialize a new time-locked savings vault with customized yield rules.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="vault-name" className="text-sm font-semibold text-foreground">
          Vault Name
        </label>
        <input
          type="text"
          id="vault-name"
          placeholder="e.g. My BTC Nest Egg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <DurationSlider value={durationDays} onChange={setDurationDays} id="vault-duration" />

      <YieldToggle checked={yieldEnabled} onChange={setYieldEnabled} id="vault-yield" />

      <button
        type="submit"
        className="w-full flex items-center justify-center h-10 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Create Vault
      </button>
    </form>
  );
}
