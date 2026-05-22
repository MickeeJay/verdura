import { z } from "zod";

export const createVaultSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Vault name is required" })
    .max(64, { message: "Vault name cannot exceed 64 characters" }),
  durationDays: z
    .number({ invalid_type_error: "Duration must be a number" })
    .int({ message: "Duration must be a whole number of days" })
    .min(1, { message: "Duration must be at least 1 day" })
    .max(365, { message: "Duration cannot exceed 365 days" }),
  yieldEnabled: z.boolean(),
});

export type CreateVaultInput = z.infer<typeof createVaultSchema>;
