"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVaultSchema, type CreateVaultInput } from "@/lib/validation/vault";
import { DurationSlider } from "./DurationSlider";
import { YieldToggle } from "./YieldToggle";

export function CreateVaultForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateVaultInput>({
    resolver: zodResolver(createVaultSchema),
    defaultValues: {
      name: "",
      durationDays: 30,
      yieldEnabled: false,
    },
  });

  const onSubmit = (data: CreateVaultInput) => {
    console.log("Form submitted:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-lg mx-auto p-6 bg-card border border-border rounded-2xl shadow-lg"
      noValidate
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Create Savings Vault
        </h2>
        <p className="text-sm text-muted-foreground">
          Initialize a new time-locked savings vault with customized yield rules.
        </p>
      </div>

      {/* Accessible error summary */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {Object.keys(errors).length > 0 && (
          <span>
            Form has {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""}.
            {errors.name && ` Vault name: ${errors.name.message}.`}
            {errors.durationDays && ` Duration: ${errors.durationDays.message}.`}
          </span>
        )}
      </div>

      {/* Vault Name Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="vault-name" className="text-sm font-semibold text-foreground">
          Vault Name
        </label>
        <input
          type="text"
          id="vault-name"
          maxLength={64}
          placeholder="e.g. My BTC Nest Egg"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "vault-name-error" : undefined}
          {...register("name")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"
        />
        {errors.name && (
          <p id="vault-name-error" role="alert" aria-live="assertive" className="text-xs text-destructive font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Duration Slider */}
      <div className="flex flex-col gap-2">
        <Controller
          name="durationDays"
          control={control}
          render={({ field }) => (
            <DurationSlider
              value={field.value}
              onChange={field.onChange}
              id="vault-duration"
            />
          )}
        />
        {errors.durationDays && (
          <p id="vault-duration-error" role="alert" aria-live="assertive" className="text-xs text-destructive font-medium">
            {errors.durationDays.message}
          </p>
        )}
      </div>

      {/* Yield Toggle */}
      <Controller
        name="yieldEnabled"
        control={control}
        render={({ field }) => (
          <YieldToggle
            checked={field.value}
            onChange={field.onChange}
            id="vault-yield"
          />
        )}
      />

      <button
        type="submit"
        className="w-full flex items-center justify-center h-10 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Create Vault
      </button>
    </form>
  );
}
