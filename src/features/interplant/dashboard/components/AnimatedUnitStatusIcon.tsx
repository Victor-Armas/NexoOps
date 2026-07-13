import {
  Check,
  Clock3,
  MapPin,
  RefreshCw,
  Truck,
  Utensils,
  X,
} from "lucide-react";
import type { UnitMovementEventType } from "../../unit-movement-events/types/unit-movement-event.types";

type AnimatedUnitStatusIconProps = {
  eventType?: UnitMovementEventType | null;
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
      <g className="animate-dashboard-forklift" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 30h22v6H7z" />
        <path d="M11 30V18h10l5 12" />
        <path d="M16 18v-5h8l4 7" />
        <path d="M31 12v24" />
        <path d="M31 30h8" />
        <circle cx="13" cy="38" r="3" />
        <circle cx="27" cy="38" r="3" />
      </g>

      <g className={palletAnimation} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="36" y="21" width="9" height="8" rx="1" />
        <path d="M35 31h11M38 31v3M43 31v3" />
      </g>
    </svg>
  );
}

export function AnimatedUnitStatusIcon({
  eventType,
  isAvailable = false,
}: AnimatedUnitStatusIconProps) {
  if (isAvailable) {
    return (
      <span className="dashboard-status-icon border-line-strong text-muted">
        <Check size={24} />
      </span>
    );
  }

  if (eventType === "loading" || eventType === "unloading") {
    return (
      <span className="dashboard-status-icon border-blue-400/40 bg-blue-400/10 text-blue-300">
        <ForkliftGlyph direction={eventType} />
      </span>
    );
  }

  if (
    eventType === "departure_requested" ||
    eventType === "in_transit" ||
    eventType === "released"
  ) {
    return (
      <span className="dashboard-status-icon border-blue-400/40 bg-blue-400/10 text-blue-300">
        <Truck size={24} className="animate-dashboard-drive" />
        <span className="absolute bottom-1.5 left-2 right-2 h-px overflow-hidden bg-current/25">
          <span className="block h-full w-1/2 animate-dashboard-road bg-current" />
        </span>
      </span>
    );
  }

  if (eventType === "waiting_dock") {
    return (
      <span className="dashboard-status-icon border-principal/60 bg-principal/10 text-principal">
        <span className="absolute inset-1 animate-dashboard-ring rounded-sm border border-current/30" />
        <Clock3 size={24} className="relative" />
      </span>
    );
  }

  if (eventType === "positioned") {
    return (
      <span className="dashboard-status-icon border-principal/50 bg-principal/10 text-principal">
        <MapPin size={24} className="animate-dashboard-pin" />
      </span>
    );
  }

  if (eventType === "meal") {
    return (
      <span className="dashboard-status-icon border-principal/60 bg-principal/10 text-principal">
        <Utensils size={24} className="animate-dashboard-utensils" />
        <span className="absolute right-2 top-1.5 h-2 w-px animate-dashboard-steam bg-current/70" />
      </span>
    );
  }

  if (eventType === "driver_change") {
    return (
      <span className="dashboard-status-icon border-principal/50 bg-principal/10 text-principal">
        <RefreshCw size={23} className="animate-dashboard-rotate" />
      </span>
    );
  }

  if (eventType === "cancelled") {
    return (
      <span className="dashboard-status-icon border-danger/50 bg-danger/10 text-danger">
        <X size={24} />
      </span>
    );
  }

  return (
    <span className="dashboard-status-icon border-success/50 bg-success/10 text-success">
      <Check size={24} />
    </span>
  );
}
