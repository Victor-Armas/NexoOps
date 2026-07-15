import { z } from "zod";

const requiredSelectUuidSchema = z
  .string()
  .min(1, "Selecciona una planta")
  .pipe(z.uuid());

const nullableSelectUuidSchema = z
  .union([z.uuid(), z.literal("")])
  .transform((value) => value || null);

export const unitMovementSchema = z
  .object({
    originPlantId: requiredSelectUuidSchema,
    destinationPlantId: requiredSelectUuidSchema,
    movementTypeId: nullableSelectUuidSchema,

    quantity: z.coerce
      .number()
      .int("Debe ser un número entero")
      .min(0, "Cantidad inválida"),

    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  .refine((values) => values.originPlantId !== values.destinationPlantId, {
    message: "El destino debe ser diferente al origen.",
    path: ["destinationPlantId"],
  });

export type UnitMovementFormInput = z.input<typeof unitMovementSchema>;
export type UnitMovementFormValues = z.output<typeof unitMovementSchema>;
