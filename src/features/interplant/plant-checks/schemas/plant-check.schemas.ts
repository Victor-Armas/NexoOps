import { z } from "zod";

export const plantRiskLevelSchema = z.enum(["low", "medium", "high"]);

export const plantCheckSchema = z.object({
  fullCount: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),

  emptyCount: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),

  pendingCount: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),

  riskLevel: plantRiskLevelSchema,

  notes: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type PlantCheckFormInput = z.input<typeof plantCheckSchema>;
export type PlantCheckFormValues = z.output<typeof plantCheckSchema>;
