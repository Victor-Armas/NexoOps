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
    <section className="rounded-sm border border-line bg-panel p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-principal/40 bg-principal/10 text-principal">
          <LockKeyhole size={20} />
        </span>
        <div>
          <p className="font-barlow-condensed text-lg font-bold">
            Confirmar cierre de turno
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Se guardará la evidencia operativa y el turno dejará de aceptar nuevos registros.
          </p>
        </div>
      </div>

      {!canCloseShift && (
        <p className="mb-4 rounded-sm border border-danger/30 bg-danger/10 px-3 py-3 text-xs leading-5 text-danger">
          Tu rol no tiene permiso para cerrar turno.
        </p>
      )}

      {hasOpenMovements && (
        <p className="mb-4 rounded-sm border border-principal/30 bg-principal/10 px-3 py-3 text-xs leading-5 text-principal">
          Los movimientos abiertos quedarán registrados como pendientes y podrán continuar en el siguiente turno.
        </p>
      )}

      <label className="mb-4 block">
        <span className="mb-2 block font-ibm-plex-mono text-[9px] uppercase tracking-[0.12em] text-muted">
          Observaciones del cierre
        </span>
        <textarea
          rows={4}
          value={closingNotes}
          onChange={(event) => onClosingNotesChange(event.target.value)}
          placeholder="Registra pendientes, incidencias importantes o cualquier novedad del turno."
          className="min-h-28 w-full resize-y rounded-sm border border-line-strong bg-surface-dark px-3 py-3 text-sm text-foreground-dark outline-none placeholder:text-faint focus:border-principal light:bg-white light:text-slate-900"
        />
      </label>

      <Button
        type="button"
        className="h-12 w-full gap-2 rounded-sm bg-principal font-barlow-condensed text-sm font-semibold uppercase tracking-[0.08em] text-black hover:bg-principal/90"
        disabled={!canSubmitClose || isClosing}
        onClick={onCloseShift}
      >
        <LockKeyhole size={16} />
        {isClosing ? "Cerrando turno..." : "Cerrar turno"}
      </Button>
    </section>
  );
}
