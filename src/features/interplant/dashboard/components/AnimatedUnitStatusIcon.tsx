import {
  Check,
  CircleCheckBig,
  CircleDot,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Truck,
  Utensils,
  X,
} from "lucide-react";
import type { UnitMovementEventType } from "../../unit-movement-events/types/unit-movement-event.types";

type AnimatedUnitStatusIconProps = {
  eventType?: UnitMovementEventType | null;
  iconKey?: string | null;
  colorKey?: string | null;
  isAvailable?: boolean;
};

function ForkliftGlyph({ direction }: { direction: "loading" | "unloading" }) {
  const palletAnimation =
    direction === "loading"
      ? "animate-dashboard-load-in"
      : "animate-dashboard-load-out";

  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8 overflow-visible"
      aria-hidden="true"
    >
      <g
        className="animate-dashboard-forklift"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 30h22v6H7z" />
        <path d="M11 30V18h10l5 12" />
        <path d="M16 18v-5h8l4 7" />
        <path d="M31 12v24" />
        <path d="M31 30h8" />
        <circle cx="13" cy="38" r="3" />
        <circle cx="27" cy="38" r="3" />
      </g>

      <g
        className={palletAnimation}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="36" y="21" width="9" height="8" rx="1" />
        <path d="M35 31h11M38 31v3M43 31v3" />
      </g>
    </svg>
  );
}

function getColorClasses(colorKey?: string | null) {
  if (colorKey === "amber") {
    return "border-principal/60 bg-principal/10 text-principal";
  }
  if (colorKey === "blue") {
    return "border-blue-400/40 bg-blue-400/10 text-blue-300";
  }
  if (colorKey === "success") {
    return "border-success/50 bg-success/10 text-success";
  }
  if (colorKey === "danger") {
    return "border-danger/50 bg-danger/10 text-danger";
  }
  return "border-line-strong bg-surface-dark text-muted";
}

export function AnimatedUnitStatusIcon({
  eventType,
  iconKey,
  colorKey,
  isAvailable = false,
}: AnimatedUnitStatusIconProps) {
  if (isAvailable) {
    return (
      <span className="dashboard-status-icon border-success/50 bg-success/10 text-success">
        <span className="absolute inset-1 animate-dashboard-ring rounded-sm border border-current/30" />
        <CircleCheckBig size={25} className="relative animate-pulse" />
      </span>
    );
  }

  const classes = getColorClasses(colorKey);

  if (
    iconKey === "forklift" ||
    eventType === "loading" ||
    eventType === "unloading"
  ) {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <ForkliftGlyph
          direction={eventType === "unloading" ? "unloading" : "loading"}
        />
      </span>
    );
  }

  if (
    iconKey === "truck" ||
    eventType === "departure_requested" ||
    eventType === "in_transit" ||
    eventType === "released"
  ) {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <Truck size={24} className="animate-dashboard-drive" />
        <span className="absolute bottom-1.5 left-2 right-2 h-px overflow-hidden bg-current/25">
          <span className="block h-full w-1/2 animate-dashboard-road bg-current" />
        </span>
      </span>
    );
  }

  if (iconKey === "clock" || eventType === "waiting_dock") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <span className="absolute inset-1 animate-dashboard-ring rounded-sm border border-current/30" />
        <Clock3 size={24} className="relative animate-pulse" />
      </span>
    );
  }

  if (iconKey === "map_pin" || eventType === "positioned") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <MapPin size={24} className="animate-dashboard-pin" />
      </span>
    );
  }

  if (iconKey === "utensils" || eventType === "meal") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <Utensils size={24} className="animate-dashboard-utensils" />
        <span className="absolute right-2 top-1.5 h-2 w-px animate-dashboard-steam bg-current/70" />
      </span>
    );
  }

  if (iconKey === "refresh" || eventType === "driver_change") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <RefreshCw size={23} className="animate-dashboard-rotate" />
      </span>
    );
  }

  if (iconKey === "shield") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <span className="absolute inset-1 animate-dashboard-ring rounded-sm border border-current/25" />
        <ShieldCheck size={24} className="relative animate-pulse" />
      </span>
    );
  }

  if (iconKey === "x" || eventType === "cancelled") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <X size={24} className="animate-pulse" />
      </span>
    );
  }

  if (iconKey === "check" || eventType === "completed") {
    return (
      <span className={`dashboard-status-icon ${classes}`}>
        <span className="absolute inset-1 animate-dashboard-ring rounded-sm border border-current/25" />
        <Check size={24} className="relative animate-pulse" />
      </span>
    );
  }

  return (
    <span className={`dashboard-status-icon ${classes}`}>
      <span className="absolute inset-1 animate-dashboard-ring rounded-sm border border-current/20" />
      <CircleDot size={24} className="relative animate-pulse" />
    </span>
  );
}
