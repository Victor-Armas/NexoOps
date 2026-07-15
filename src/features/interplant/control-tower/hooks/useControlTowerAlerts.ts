import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UnitOperationalSnapshot } from "../../unit-movements/utils/unit-operational-snapshot";

const SOUND_STORAGE_KEY = "nexoops:control-tower:sound";

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
  ].join(":");
}

export function useControlTowerAlerts(snapshots: UnitOperationalSnapshot[]) {
  const [soundEnabled, setSoundEnabled] = useState(getInitialSoundPreference);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousStatusesRef = useRef<Map<string, string>>(new Map());
  const hasHydratedRef = useRef(false);

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

  const playStatusTone = useCallback(async () => {
    if (!soundEnabled) return;

    try {
      const context = getAudioContext();
      if (context.state === "suspended") {
        await context.resume();
      }

      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      gain.connect(context.destination);

      const firstTone = context.createOscillator();
      firstTone.type = "sine";
      firstTone.frequency.setValueAtTime(720, now);
      firstTone.connect(gain);
      firstTone.start(now);
      firstTone.stop(now + 0.16);

      const secondTone = context.createOscillator();
      secondTone.type = "sine";
      secondTone.frequency.setValueAtTime(940, now + 0.15);
      secondTone.connect(gain);
      secondTone.start(now + 0.15);
      secondTone.stop(now + 0.34);
    } catch {
      // Browsers can block audio until the first user gesture. The visual alert remains active.
    }
  }, [getAudioContext, soundEnabled]);

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
    const nextStatuses = new Map(
      snapshots.map((snapshot) => [
        snapshot.unitId,
        getStatusSignature(snapshot),
      ]),
    );

    if (!hasHydratedRef.current) {
      previousStatusesRef.current = nextStatuses;
      hasHydratedRef.current = true;
      return;
    }

    const changedSnapshots = snapshots.filter((snapshot) => {
      const previousSignature = previousStatusesRef.current.get(snapshot.unitId);
      return (
        previousSignature !== undefined &&
        previousSignature !== getStatusSignature(snapshot)
      );
    });

    previousStatusesRef.current = nextStatuses;

    if (changedSnapshots.length === 0) return;

    changedSnapshots.forEach((snapshot) => {
      toast(`${snapshot.unitLabel} · ${snapshot.headline}`, {
        description: snapshot.isAvailable
          ? "La unidad quedó disponible."
          : `${snapshot.routeLabel}${
              snapshot.movementTypeLabel
                ? ` · ${snapshot.movementTypeLabel}`
                : ""
            }`,
        duration: 7000,
      });
    });

    void playStatusTone();
  }, [playStatusTone, snapshots]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  return {
    soundEnabled,
    toggleSound,
    unlockSound,
  };
}
