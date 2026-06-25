export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

let counter = 0;

/** Unique-per-run identifier so reruns never collide on names/ids. */
export function unique(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
