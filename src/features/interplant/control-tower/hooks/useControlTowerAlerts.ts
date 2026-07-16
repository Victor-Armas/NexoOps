import { useCallback, useEffect, useRef, useState } from "react";
import type { UnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";

const SOUND_STORAGE_KEY = "nexoops:control-tower:sound";
const NOTIFICATION_DURATION_MS = 4_500;

export type ControlTowerNotificationTone =
  | "info"
  | "warning"
  | "danger"
  | "success";

export type ControlTowerNotification = {
  id: string;
  unitId: string;
  unitLabel: string;
  title: string;
  previousTitle: string;
  phaseLabel: string;
  currentPlantCode: string | null;
  routeLabel: string;
  movementTypeLabel: string | null;
  quantity: number | null;
  tone: ControlTowerNotificationTone;
  createdAt: string;
};

type UseControlTowerAlertsOptions = {
  enabled?: boolean;
  scopeKey?: string | null;
};

function getInitialSoundPreference() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
}

function getStatusSignature(snapshot: UnitOperationalSnapshot) {
  return [
    snapshot.movementId ?? "none",
    snapshot.eventType ?? "available",
    snapshot.phase ?? "none",
    snapshot.currentPlantId ?? "none",
    snapshot.headline,
  ].join(":");
}

function getNotificationTone(
  snapshot: UnitOperationalSnapshot,
): ControlTowerNotificationTone {
  if (snapshot.isAvailable) return "success";
  if (snapshot.colorKey === "danger") return "danger";
  if (snapshot.isWaiting || snapshot.colorKey === "amber") return "warning";
  return "info";
}

function getTonePriority(tone: ControlTowerNotificationTone) {
  if (tone === "danger") return 4;
  if (tone === "warning") return 3;
  if (tone === "success") return 2;
  return 1;
}

function createNotification(
  snapshot: UnitOperationalSnapshot,
  previousSnapshot: UnitOperationalSnapshot,
): ControlTowerNotification {
  return {
    id: `${snapshot.unitId}:${Date.now()}:${snapshot.eventType ?? "available"}`,
    unitId: snapshot.unitId,
    unitLabel: snapshot.unitLabel,
    title: snapshot.headline,
    previousTitle: previousSnapshot.headline,
    phaseLabel: snapshot.phaseLabel,
    currentPlantCode: snapshot.currentPlantCode,
    routeLabel: snapshot.routeLabel,
    movementTypeLabel: snapshot.movementTypeLabel,
    quantity: snapshot.quantity,
    tone: getNotificationTone(snapshot),
    createdAt: new Date().toISOString(),
  };
}

export function useControlTowerAlerts(
  snapshots: UnitOperationalSnapshot[],
  options: UseControlTowerAlertsOptions = {},
) {
  const { enabled = true, scopeKey = "default" } = options;
  const [soundEnabled, setSoundEnabled] = useState(getInitialSoundPreference);
  const [notifications, setNotifications] = useState<ControlTowerNotification[]>(
    [],
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousSnapshotsRef = useRef<Map<string, UnitOperationalSnapshot>>(
    new Map(),
  );
  const hasHydratedRef = useRef(false);
  const scopeKeyRef = useRef(scopeKey);
  const notificationTimerRef = useRef<number | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const unlockSound = useCallback(async () => {
    if (!soundEnabled) return;

    const context = getAudioContext();
    if (context.state === "suspended") {
      await context.resume();
    }
  }, [getAudioContext, soundEnabled]);

  const playStatusTone = useCallback(
    async (tone: ControlTowerNotificationTone) => {
      if (!soundEnabled) return;

      try {
        const context = getAudioContext();
        if (context.state === "suspended") {
          await context.resume();
        }

        const now = context.currentTime;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(
          tone === "danger" ? 0.18 : 0.12,
          now + 0.02,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
        gain.connect(context.destination);

        const frequencies =
          tone === "danger"
            ? [420, 340]
            : tone === "warning"
              ? [540, 720]
              : tone === "success"
                ? [640, 880]
                : [720, 940];

        frequencies.forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const startAt = now + index * 0.14;
          oscillator.type = tone === "danger" ? "triangle" : "sine";
          oscillator.frequency.setValueAtTime(frequency, startAt);
          oscillator.connect(gain);
          oscillator.start(startAt);
          oscillator.stop(startAt + 0.12);
        });
      } catch {
        // Browsers can block audio until the first user gesture.
      }
    },
    [getAudioContext, soundEnabled],
  );

  const clearNotificationTimer = useCallback(() => {
    if (notificationTimerRef.current !== null) {
      window.clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
  }, []);

  const dismissNotification = useCallback(
    (notificationId: string) => {
      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId),
      );
      clearNotificationTimer();
    },
    [clearNotificationTimer],
  );

  const clearNotifications = useCallback(() => {
    clearNotificationTimer();
    setNotifications([]);
  }, [clearNotificationTimer]);

  const showNotification = useCallback(
    (notification: ControlTowerNotification) => {
      clearNotificationTimer();
      setNotifications([notification]);

      notificationTimerRef.current = window.setTimeout(() => {
        setNotifications([]);
        notificationTimerRef.current = null;
      }, NOTIFICATION_DURATION_MS);
    },
    [clearNotificationTimer],
  );

  useEffect(() => {
    if (!soundEnabled) return;

    const handleFirstInteraction = () => {
      void unlockSound();
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      once: true,
    });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [soundEnabled, unlockSound]);

  useEffect(() => {
    if (scopeKeyRef.current === scopeKey) return;

    scopeKeyRef.current = scopeKey;
    hasHydratedRef.current = false;
    previousSnapshotsRef.current = new Map();
    clearNotifications();
  }, [clearNotifications, scopeKey]);

  useEffect(() => {
    if (!enabled) return;

    const nextSnapshots = new Map(
      snapshots.map((snapshot) => [snapshot.unitId, snapshot]),
    );

    if (!hasHydratedRef.current) {
      previousSnapshotsRef.current = nextSnapshots;
      hasHydratedRef.current = true;
      return;
    }

    const changedSnapshots = snapshots.flatMap((snapshot) => {
      const previousSnapshot = previousSnapshotsRef.current.get(snapshot.unitId);
      if (!previousSnapshot) return [];

      if (
        getStatusSignature(previousSnapshot) === getStatusSignature(snapshot)
      ) {
        return [];
      }

      return [{ snapshot, previousSnapshot }];
    });

    previousSnapshotsRef.current = nextSnapshots;

    if (changedSnapshots.length === 0) return;

    const nextNotifications = changedSnapshots.map(
      ({ snapshot, previousSnapshot }) =>
        createNotification(snapshot, previousSnapshot),
    );

    const highestPriorityNotification = [...nextNotifications].sort(
      (first, second) =>
        getTonePriority(second.tone) - getTonePriority(first.tone),
    )[0];

    if (!highestPriorityNotification) return;

    showNotification(highestPriorityNotification);
    void playStatusTone(highestPriorityNotification.tone);
  }, [enabled, playStatusTone, showNotification, snapshots]);

  useEffect(
    () => () => {
      clearNotificationTimer();
      void audioContextRef.current?.close();
    },
    [clearNotificationTimer],
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  return {
    soundEnabled,
    notifications,
    dismissNotification,
    toggleSound,
    unlockSound,
  };
}
