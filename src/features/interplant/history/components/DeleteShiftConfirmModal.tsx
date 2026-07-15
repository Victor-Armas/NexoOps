import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { formatMonterreyDateTime } from "../../../../lib/date-time/monterrey-time";
import { SHIFT_TYPE_LABELS } from "../../shifts/types/shift.types";
import type { ShiftClosingHistoryItem } from "../types/shift-closing-history.types";

type DeleteShiftConfirmModalProps = {
  item: ShiftClosingHistoryItem | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteShiftConfirmModal({
  item,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteShiftConfirmModalProps) {
  useEffect(() => {
    if (!item) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, isDeleting, onCancel]);

  if (!item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-shift-title"
    >
      <button
        type="button"
        aria-label="Cerrar confirmación"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        disabled={isDeleting}
        onClick={onCancel}
      />

      <section className="relative z-10 w-full max-w-md rounded-sm border border-danger/40 bg-panel-strong p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-danger/40 bg-danger/10 text-danger">
              <AlertTriangle size={21} />
            </span>
            <div>
              <p className="font-ibm-plex-mono text-[9px] uppercase tracking-[0.12em] text-danger">
                Acción irreversible
              </p>
              <h3 id="delete-shift-title" className="mt-1 text-xl font-bold">
                Eliminar turno permanentemente
              </h3>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line text-muted transition hover:border-principal/50 hover:text-principal disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-sm border border-line bg-surface-dark p-3 text-sm">
          <p className="font-semibold">{SHIFT_TYPE_LABELS[item.shiftType]}</p>
          <p className="mt-1 text-xs text-muted">
            Cerrado el {formatMonterreyDateTime(item.closedAt)}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">
          Se eliminarán definitivamente el turno, sus recorridos de planta,
          movimientos, eventos, incidencias y evidencia de cierre. Las estadísticas
          se recalcularán sin este turno.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="h-11 rounded-sm border border-line-strong text-sm font-semibold text-muted transition hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-danger/50 bg-danger/15 text-sm font-semibold text-danger transition hover:bg-danger/25 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
