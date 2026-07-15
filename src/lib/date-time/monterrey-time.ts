export const MONTERREY_TIME_ZONE = "America/Monterrey";

const DATE_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: MONTERREY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function parseInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Fecha inválida: ${value}`);
  }

  return { year, month, day };
}

function getZonedDateParts(date: Date): DateParts {
  const parts = DATE_PARTS_FORMATTER.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function getTimeZoneOffsetMilliseconds(date: Date) {
  const parts = getZonedDateParts(date);
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const dateWithoutMilliseconds = Math.floor(date.getTime() / 1000) * 1000;

  return zonedAsUtc - dateWithoutMilliseconds;
}

function localDateTimeToUtcIso(params: DateParts) {
  const localAsUtc = Date.UTC(
    params.year,
    params.month - 1,
    params.day,
    params.hour,
    params.minute,
    params.second,
  );

  let offset = getTimeZoneOffsetMilliseconds(new Date(localAsUtc));
  let resolvedDate = new Date(localAsUtc - offset);
  const resolvedOffset = getTimeZoneOffsetMilliseconds(resolvedDate);

  if (resolvedOffset !== offset) {
    offset = resolvedOffset;
    resolvedDate = new Date(localAsUtc - offset);
  }

  return resolvedDate.toISOString();
}

export function getMonterreyInputDate(date = new Date()) {
  const parts = getZonedDateParts(date);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");

  return `${parts.year}-${month}-${day}`;
}

export function addDaysToInputDate(value: string, days: number) {
  const { year, month, day } = parseInputDate(value);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

export function getMonterreyUtcDateRange(startDate: string, endDate: string) {
  const start = parseInputDate(startDate);
  const exclusiveEnd = parseInputDate(addDaysToInputDate(endDate, 1));

  return {
    rangeStart: localDateTimeToUtcIso({
      ...start,
      hour: 0,
      minute: 0,
      second: 0,
    }),
    rangeEnd: localDateTimeToUtcIso({
      ...exclusiveEnd,
      hour: 0,
      minute: 0,
      second: 0,
    }),
  };
}

export function formatMonterreyDateTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
) {
  return new Intl.DateTimeFormat("es-MX", {
    ...options,
    timeZone: MONTERREY_TIME_ZONE,
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatMonterreyTime(value: string | Date) {
  return formatMonterreyDateTime(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
