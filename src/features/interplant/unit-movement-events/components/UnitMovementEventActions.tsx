import type { UnitMovementEventType } from "../types/unit-movement-event.types";

type UnitMovementEventAction = {
    eventType: UnitMovementEventType;
    label: string;
};

const UNIT_MOVEMENT_EVENT_ACTIONS: UnitMovementEventAction[] = [
    {
        eventType: "departure_requested",
        label: "Salida indicada",
    },
    {
        eventType: "in_transit",
        label: "En camino",
    },
    {
        eventType: "waiting_dock",
        label: "Esperando rampa",
    },
    {
        eventType: "positioned",
        label: "Posicionado",
    },
    {
        eventType: "loading",
        label: "Cargando",
    },
    {
        eventType: "unloading",
        label: "Descargando",
    },
    {
        eventType: "released",
        label: "Retirado",
    },
    {
        eventType: "meal",
        label: "Comida",
    },
    {
        eventType: "driver_change",
        label: "Cambio operador",
    },
];

type UnitMovementEventActionsProps = {
    disabled: boolean;
    isSubmitting: boolean;
    onCreateEvent: (eventType: UnitMovementEventType) => Promise<void>;
};

export function UnitMovementEventActions({
    disabled,
    isSubmitting,
    onCreateEvent,
}: UnitMovementEventActionsProps) {
    return (
        <section className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4 light:border-slate-200 light:bg-slate-50">
            <h4 className="text-sm font-bold">Actualizar estado</h4>

            <div className="mt-3 grid grid-cols-2 gap-2">
                {UNIT_MOVEMENT_EVENT_ACTIONS.map((action) => (
                    <button
                        key={action.eventType}
                        type="button"
                        disabled={disabled || isSubmitting}
                        onClick={() => void onCreateEvent(action.eventType)}
                        className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 light:border-slate-200 light:bg-white light:text-slate-700"
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </section>
    );
}