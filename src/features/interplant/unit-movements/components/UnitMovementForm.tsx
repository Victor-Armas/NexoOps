import { zodResolver } from "@hookform/resolvers/zod";
import { Route } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../../../components/ui/Button";
import type { Plant } from "../../plants/types/plant.types";
import {
  unitMovementSchema,
  type UnitMovementFormInput,
  type UnitMovementFormValues,
} from "../schemas/unit-movement.schemas";
import type { MovementType } from "../types/unit-movement.types";

type UnitMovementFormProps = {
  plants: Plant[];
  movementTypes: MovementType[];
  isSubmitting: boolean;
  onSubmit: (values: UnitMovementFormValues) => Promise<void>;
};

export function UnitMovementForm({
  plants,
  movementTypes,
  isSubmitting,
  onSubmit,
}: UnitMovementFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitMovementFormInput, unknown, UnitMovementFormValues>({
    resolver: zodResolver(unitMovementSchema),
    defaultValues: {
      originPlantId: "",
      destinationPlantId: "",
      movementTypeId: "",
      quantity: 0,
      notes: "",
    },
  });

  const selectedOriginPlantId = useWatch({
    control,
    name: "originPlantId",
  });

  const destinationPlants = plants.filter(
    (plant) => plant.id !== selectedOriginPlantId,
  );

  const handleValidSubmit = async (values: UnitMovementFormValues) => {
    await onSubmit(values);

    reset({
      originPlantId: "",
      destinationPlantId: "",
      movementTypeId: "",
      quantity: 0,
      notes: "",
    });
  };

  return (
    <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
          <Route size={22} />
        </div>

        <div>
          <h2 className="font-bold">Registrar movimiento</h2>
          <p className="text-sm text-slate-400 light:text-slate-500">
            Captura origen, destino y cantidad movida.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300 light:text-slate-700">
              Origen
            </span>

            <select
              className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
              {...register("originPlantId")}
            >
              <option value="" className="text-slate-900">
                Sin origen
              </option>

              {plants.map((plant) => (
                <option
                  key={plant.id}
                  value={plant.id}
                  className="text-slate-900"
                >
                  {plant.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300 light:text-slate-700">
              Destino
            </span>

            <select
              className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
              {...register("destinationPlantId")}
            >
              <option value="" className="text-slate-900">
                Sin destino
              </option>

              {destinationPlants.map((plant) => (
                <option
                  key={plant.id}
                  value={plant.id}
                  className="text-slate-900"
                >
                  {plant.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errors.destinationPlantId && (
          <p className="text-sm text-red-400 light:text-red-600">
            {errors.destinationPlantId.message}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300 light:text-slate-700">
              Tipo
            </span>

            <select
              className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
              {...register("movementTypeId")}
            >
              <option value="" className="text-slate-900">
                Sin tipo
              </option>

              {movementTypes.map((movementType) => (
                <option
                  key={movementType.id}
                  value={movementType.id}
                  className="text-slate-900"
                >
                  {movementType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300 light:text-slate-700">
              Cantidad
            </span>

            <input
              type="number"
              min={0}
              className="h-12 w-full rounded-sm bg-white/10 px-4 text-sm text-white outline-none light:border light:border-slate-200 light:bg-white light:text-slate-900"
              {...register("quantity")}
            />

            {errors.quantity && (
              <p className="text-sm text-red-400 light:text-red-600">
                {errors.quantity.message}
              </p>
            )}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300 light:text-slate-700">
            Notas
          </span>

          <textarea
            rows={3}
            placeholder="Ej. Sin rampa disponible, esperando descarga, prioridad operativa..."
            className="w-full rounded-sm bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 light:border light:border-slate-200 light:bg-white light:text-slate-900"
            {...register("notes")}
          />

          {errors.notes && (
            <p className="text-sm text-red-400 light:text-red-600">
              {errors.notes.message}
            </p>
          )}
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar movimiento"}
        </Button>
      </form>
    </section>
  );
}
