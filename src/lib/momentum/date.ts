// Local-time date helpers. All dates are stored as YYYY-MM-DD strings.

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return isoDate(new Date());
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function dayOfWeek(s: string): number {
  return parseISO(s).getDay(); // 0 = Sunday
}

export function dayOfMonth(s: string): number {
  return parseISO(s).getDate();
}

export function lastNDays(n: number, end = todayISO()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseISO(a).getTime() - parseISO(b).getTime()) / 86400000);
}

export function monthLabel(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { month: "short" });
}

export function weekdayShort(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { weekday: "short" });
}

export function prettyDate(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
