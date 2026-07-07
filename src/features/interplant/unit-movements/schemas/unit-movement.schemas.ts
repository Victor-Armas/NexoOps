import { z } from "zod";

const nullableSelectUuidSchema = z
  .union([z.uuid(), z.literal("")])
  .transform((value) => value || null);

export const unitMovementSchema = z
  .object({
    originPlantId: nullableSelectUuidSchema,
    destinationPlantId: nullableSelectUuidSchema,
    movementTypeId: nullableSelectUuidSchema,

    quantity: z.coerce
      .number()
      .int("Debe ser un número entero")
      .min(0, "No puede ser negativo"),

    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  .refine((values) => values.originPlantId || values.destinationPlantId, {
    message: "Selecciona origen o destino.",
    path: ["destinationPlantId"],
  });

export type UnitMovementFormInput = z.input<typeof unitMovementSchema>;
export type UnitMovementFormValues = z.output<typeof unitMovementSchema>;
