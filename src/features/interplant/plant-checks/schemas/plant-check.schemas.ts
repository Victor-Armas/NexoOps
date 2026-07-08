import { z } from "zod";

export const plantRiskLevelSchema = z.enum(["low", "medium", "high"]);

export const plantOperationalConditionSchema = z.enum([
  "normal",
  "no_unload_space",
  "no_dock_available",
  "material_priority",
  "other",
]);

const plantCheckValueSchema = z.coerce
  .number()
  .int("Debe ser un número entero")
  .min(0, "No puede ser negativo");

export const plantCheckSchema = z.object({
  checkValues: z.record(z.string(), plantCheckValueSchema),
  operationalCondition: plantOperationalConditionSchema,
  riskLevel: plantRiskLevelSchema,
  notes: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type PlantCheckFormInput = z.input<typeof plantCheckSchema>;
export type PlantCheckFormValues = z.output<typeof plantCheckSchema>;
