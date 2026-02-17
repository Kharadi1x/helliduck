export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
