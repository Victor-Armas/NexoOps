import { LockKeyhole } from "lucide-react";
import { Button } from "../../../../components/ui/Button";

type CloseShiftPanelProps = {
    canCloseShift: boolean;
    hasOpenMovements: boolean;
    canSubmitClose: boolean;
    isClosing: boolean;
    closingNotes: string;
    onClosingNotesChange: (notes: string) => void;
    onCloseShift: () => void;
};

export function CloseShiftPanel({
    canCloseShift,
    hasOpenMovements,
    canSubmitClose,
    isClosing,
    closingNotes,
    onClosingNotesChange,
    onCloseShift,
}: CloseShiftPanelProps) {
    return (
        <section className="mt-5 rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="mb-4 flex items-center gap-3">
                <LockKeyhole size={22} className="text-cyan-300" />

                <div>
                    <h3 className="font-bold">Cerrar turno</h3>
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        El cierre requiere confirmación y guardará la evidencia del turno.
                    </p>
                </div>
            </div>

            {!canCloseShift && (
                <p className="mb-4 rounded-3xl bg-red-500/10 px-4 py-3 text-sm text-red-300 light:text-red-600">
                    Tu rol no tiene permiso para cerrar turno.
                </p>
            )}

            {hasOpenMovements && (
                <p className="mb-4 rounded-3xl bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200 light:bg-yellow-50 light:text-yellow-700">
                    Hay movimientos abiertos. Podrás cerrar, pero quedarán registrados como pendientes en la evidencia.
                </p>
            )}

            <label className="mb-4 block space-y-2">
                <span className="text-sm font-medium text-slate-300 light:text-slate-700">
                    Observaciones del cierre
                </span>

                <textarea
                    rows={4}
                    value={closingNotes}
                    onChange={(event) => onClosingNotesChange(event.target.value)}
                    placeholder="Ej. Unidades pendientes, incidencias, observaciones de patio..."
                    className="w-full rounded-3xl bg-slate-950/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 light:border light:border-slate-200 light:bg-white light:text-slate-900"
                />
            </label>

            <Button
                type="button"
                className="w-full"
                disabled={!canSubmitClose || isClosing}
                onClick={onCloseShift}
            >
                {isClosing ? "Cerrando..." : "Cerrar turno"}
            </Button>
        </section>
    );
}
