import type { Shift } from "../../shifts/types/shift.types";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import { formatTime } from "../utils/closing-formatters";

type ClosingShiftSummaryProps = {
    shift: Shift;
};

export function ClosingShiftSummary({ shift }: ClosingShiftSummaryProps) {
    return (
        <section className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-400 light:text-slate-500">
                        Turno actual
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                        {SHIFT_TYPE_LABELS[shift.shiftType]}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
                        Apertura: {formatTime(shift.openedAt)}
                    </p>
                </div>

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                    Abierto
                </span>
            </div>
        </section>
    );
}