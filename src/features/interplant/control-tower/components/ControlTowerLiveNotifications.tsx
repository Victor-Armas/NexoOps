import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Radio,
  Route,
  Truck,
  X,
} from "lucide-react";
import type { ControlTowerNotification } from "../hooks/useControlTowerAlerts";

type ControlTowerLiveNotificationsProps = {
  notifications: ControlTowerNotification[];
  onDismiss: (notificationId: string) => void;
};

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function getNotificationAppearance(tone: ControlTowerNotification["tone"]) {
  if (tone === "danger") {
    return {
      border: "border-danger/60",
      background: "bg-[#241512]/95",
      accent: "bg-danger",
      icon: "border-danger/50 bg-danger/10 text-danger",
      title: "text-red-100",
      label: "text-danger",
      Icon: AlertTriangle,
    };
  }

  if (tone === "warning") {
    return {
      border: "border-principal/60",
      background: "bg-[#211a0f]/95",
      accent: "bg-principal",
      icon: "border-principal/50 bg-principal/10 text-principal",
      title: "text-amber-50",
      label: "text-principal",
      Icon: AlertTriangle,
    };
  }

  if (tone === "success") {
    return {
      border: "border-success/50",
      background: "bg-[#141c12]/95",
      accent: "bg-success",
      icon: "border-success/50 bg-success/10 text-success",
      title: "text-green-50",
      label: "text-success",
      Icon: CheckCircle2,
    };
  }

  return {
    border: "border-blue-400/50",
    background: "bg-[#111b22]/95",
    accent: "bg-blue-400",
    icon: "border-blue-400/50 bg-blue-400/10 text-blue-300",
    title: "text-blue-50",
    label: "text-blue-300",
    Icon: Truck,
  };
}

export function ControlTowerLiveNotifications({
  notifications,
  onDismiss,
}: ControlTowerLiveNotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <aside
      className="pointer-events-none fixed right-3 top-[4.75rem] z-[70] flex w-[calc(100vw-1.5rem)] max-w-md flex-col gap-2 sm:right-5 sm:top-[5.25rem] sm:w-[430px]"
      aria-live="polite"
      aria-label="Actualizaciones operativas en vivo"
    >
      {notifications.slice(0, 3).map((notification, index) => {
        const appearance = getNotificationAppearance(notification.tone);
        const Icon = appearance.Icon;

        return (
          <article
            key={notification.id}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border ${appearance.border} ${appearance.background} shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-all duration-300`}
            style={{
              transform: `translateY(${index * 2}px) scale(${1 - index * 0.015})`,
              opacity: 1 - index * 0.12,
            }}
          >
            <span
              className={`absolute inset-y-0 left-0 w-1 ${appearance.accent}`}
              aria-hidden="true"
            />

            <div className="p-4 pl-5">
              <div className="flex items-start gap-3">
                <span
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${appearance.icon}`}
                >
                  <Icon size={20} />
                  <span
                    className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ${appearance.accent} motion-safe:animate-pulse`}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`font-barlow-condensed text-[10px] font-semibold uppercase tracking-[0.13em] ${appearance.label}`}
                    >
                      Actualización en vivo
                    </span>
                    <span className="font-ibm-plex-mono text-[9px] text-faint">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md border border-white/15 bg-black/20 px-2 py-1 font-ibm-plex-mono text-xs font-semibold text-white">
                      {notification.unitLabel}
                    </span>
                    <h3 className={`min-w-0 truncate text-base font-semibold ${appearance.title}`}>
                      {notification.title}
                    </h3>
                  </div>

                  {notification.previousTitle !== notification.title && (
                    <p className="mt-2 truncate text-xs text-muted">
                      <span className="text-faint">Antes:</span>{" "}
                      {notification.previousTitle}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 font-ibm-plex-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/15 px-2 py-1.5">
                      <Radio size={11} className={appearance.label} />
                      {notification.phaseLabel}
                    </span>

                    {notification.routeLabel !== "Sin movimiento activo" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/15 px-2 py-1.5">
                        <Route size={11} />
                        {notification.routeLabel}
                      </span>
                    )}

                    {notification.currentPlantCode && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/15 px-2 py-1.5">
                        <MapPin size={11} />
                        {notification.currentPlantCode}
                      </span>
                    )}
                  </div>

                  {(notification.movementTypeLabel || notification.quantity !== null) && (
                    <p className="mt-2 truncate text-xs text-faint">
                      {[notification.movementTypeLabel, notification.quantity !== null ? `${notification.quantity} unidades` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(notification.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 text-faint transition hover:border-white/25 hover:text-white"
                  aria-label="Cerrar notificación"
                  title="Cerrar notificación"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2 font-ibm-plex-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                <Clock3 size={11} />
                Esta notificación se cerrará automáticamente
              </div>
            </div>
          </article>
        );
      })}
    </aside>
  );
}
