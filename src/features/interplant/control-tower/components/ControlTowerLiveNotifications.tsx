import { AlertTriangle, CheckCircle2, Truck, X } from "lucide-react";
import type { ControlTowerNotification } from "../hooks/useControlTowerAlerts";

type ControlTowerLiveNotificationsProps = {
  notifications: ControlTowerNotification[];
  onDismiss: (notificationId: string) => void;
};

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getNotificationAppearance(tone: ControlTowerNotification["tone"]) {
  if (tone === "danger") {
    return {
      border: "border-danger/45",
      background: "bg-[#211512]/96",
      accent: "text-danger",
      icon: "bg-danger/10 text-danger",
      Icon: AlertTriangle,
    };
  }

  if (tone === "warning") {
    return {
      border: "border-principal/45",
      background: "bg-[#211a0f]/96",
      accent: "text-principal",
      icon: "bg-principal/10 text-principal",
      Icon: AlertTriangle,
    };
  }

  if (tone === "success") {
    return {
      border: "border-success/40",
      background: "bg-[#141c12]/96",
      accent: "text-success",
      icon: "bg-success/10 text-success",
      Icon: CheckCircle2,
    };
  }

  return {
    border: "border-blue-400/35",
    background: "bg-[#111b22]/96",
    accent: "text-blue-300",
    icon: "bg-blue-400/10 text-blue-300",
    Icon: Truck,
  };
}

export function ControlTowerLiveNotifications({
  notifications,
  onDismiss,
}: ControlTowerLiveNotificationsProps) {
  const notification = notifications[0];
  if (!notification) return null;

  const appearance = getNotificationAppearance(notification.tone);
  const Icon = appearance.Icon;
  const context = [
    notification.routeLabel !== "Sin movimiento activo"
      ? notification.routeLabel
      : null,
    notification.currentPlantCode,
    formatNotificationTime(notification.createdAt),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <aside
      className="pointer-events-none fixed right-3 top-[4.75rem] z-[70] w-[calc(100vw-1.5rem)] max-w-sm sm:right-5 sm:top-[5.25rem]"
      aria-live="polite"
      aria-label="Actualización operativa en vivo"
    >
      <article
        className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-3 py-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.32)] backdrop-blur-lg ${appearance.border} ${appearance.background}`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${appearance.icon}`}
        >
          <Icon size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`shrink-0 font-ibm-plex-mono text-[10px] font-semibold ${appearance.accent}`}
            >
              {notification.unitLabel}
            </span>
            <p className="truncate text-sm font-semibold text-white">
              {notification.title}
            </p>
          </div>

          {context && (
            <p className="mt-0.5 truncate font-ibm-plex-mono text-[9px] text-muted">
              {context}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-faint transition hover:bg-white/5 hover:text-white"
          aria-label="Cerrar notificación"
          title="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </article>
    </aside>
  );
}
