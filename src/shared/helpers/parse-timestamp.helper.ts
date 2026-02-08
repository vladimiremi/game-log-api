interface ParseTimestampParams {
  day: string;
  month: string;
  year: string;
  hour: string;
  min: string;
  sec: string;
}

export function parseTimestamp({
  day,
  month,
  year,
  hour,
  min,
  sec,
}: ParseTimestampParams): Date {
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(min, 10),
    parseInt(sec, 10),
  );
}
