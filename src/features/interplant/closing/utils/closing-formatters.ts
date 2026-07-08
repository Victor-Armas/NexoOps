export function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function findNameById<T extends { id: string; name: string }>(
  items: T[],
  id: string | null,
  fallback: string,
) {
  if (!id) {
    return fallback;
  }

  return items.find((item) => item.id === id)?.name ?? fallback;
}
