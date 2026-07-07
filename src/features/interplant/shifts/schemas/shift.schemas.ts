import { z } from "zod";

export const shiftTypeSchema = z.enum(["morning", "afternoon", "night"]);

export const openShiftSchema = z.object({
  shiftType: shiftTypeSchema,
  notes: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type OpenShiftFormValues = z.infer<typeof openShiftSchema>;
