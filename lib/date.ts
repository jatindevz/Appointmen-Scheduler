export function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function getWeekday(dateIso: string): number {
  const date = new Date(`${dateIso}T00:00:00`);
  return date.getDay();
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad2(hours)}:${pad2(minutes)}:00`;
}

export function formatTimeLabel(time: string): string {
  return time.slice(0, 5);
}

export function getTodayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function isPastDateTime(dateIso: string, time: string): boolean {
  const dateTime = new Date(`${dateIso}T${time}`);
  return dateTime.getTime() < Date.now();
}
