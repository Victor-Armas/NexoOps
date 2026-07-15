export function toHistoryNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

export function formatHistoryMinutes(value: number | null | undefined) {
  if (value === null || value === undefined) return "Sin datos";

  const minutes = Number(value);

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours} h ${remainingMinutes} min`;
  }

  return `${Math.round(minutes)} min`;
}
