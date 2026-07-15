import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, FileText, Package, Route } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
  onSubmit: (values: UnitMovementFormValues) => Promise<boolean>;
};

const fieldClassName =
  "h-12 w-full min-w-0 rounded-sm border border-line-strong bg-surface-dark px-3 text-sm text-foreground-dark outline-none transition focus:border-principal focus:ring-2 focus:ring-principal/15 light:bg-white light:text-slate-900";

const labelClassName =
  "font-barlow-condensed text-xs font-semibold uppercase tracking-[0.1em] text-faint";

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
    const wasCreated = await onSubmit(values);

    if (wasCreated) {
      reset({
        originPlantId: "",
        destinationPlantId: "",
        movementTypeId: "",
        quantity: 0,
        notes: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5">
      <section className="rounded-sm border border-line bg-panel/60 p-4 light:bg-slate-50">
        <div className="mb-4 flex items-center gap-2 text-principal">
          <Route size={17} />
          <p className="section-label text-principal">Ruta del movimiento</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
          <label className="min-w-0 space-y-2">
            <span className={labelClassName}>Origen</span>
            <select className={fieldClassName} {...register("originPlantId")}>
              <option value="" className="text-slate-900">
                Sin origen
              </option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id} className="text-slate-900">
                  {plant.name}
                </option>
              ))}
            </select>
          </label>

          <span className="mb-3 flex h-6 w-6 items-center justify-center text-faint">
            <ArrowRight size={17} />
          </span>

          <label className="min-w-0 space-y-2">
            <span className={labelClassName}>Destino</span>
            <select className={fieldClassName} {...register("destinationPlantId")}>
              <option value="" className="text-slate-900">
                Sin destino
              </option>
              {destinationPlants.map((plant) => (
                <option key={plant.id} value={plant.id} className="text-slate-900">
                  {plant.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errors.destinationPlantId && (
          <p className="mt-2 text-sm text-danger">
            {errors.destinationPlantId.message}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <label className="min-w-0 space-y-2">
          <span className={`${labelClassName} inline-flex items-center gap-1.5`}>
            <Route size={13} />
            Tipo
          </span>
          <select className={fieldClassName} {...register("movementTypeId")}>
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

        <label className="min-w-0 space-y-2">
          <span className={`${labelClassName} inline-flex items-center gap-1.5`}>
            <Package size={13} />
            Cantidad
          </span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={fieldClassName}
            {...register("quantity")}
          />
          {errors.quantity && (
            <p className="text-sm text-danger">{errors.quantity.message}</p>
          )}
        </label>
      </div>

      <label className="block space-y-2">
        <span className={`${labelClassName} inline-flex items-center gap-1.5`}>
          <FileText size={13} />
          Notas
        </span>
        <textarea
          rows={3}
          placeholder="Agrega una observación solo si es necesaria..."
          className="w-full resize-none rounded-sm border border-line-strong bg-surface-dark px-3 py-3 text-sm text-foreground-dark outline-none transition placeholder:text-faint focus:border-principal focus:ring-2 focus:ring-principal/15 light:bg-white light:text-slate-900"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-danger">{errors.notes.message}</p>
        )}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-principal px-5 font-barlow-condensed text-base font-semibold uppercase tracking-[0.08em] text-slate-950 shadow-lg shadow-black/10 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Route size={18} />
        {isSubmitting ? "Registrando..." : "Registrar movimiento"}
      </button>
    </form>
  );
}
