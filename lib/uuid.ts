import type { UUID } from "@/types/inventory";

export function createUUID(): UUID {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomTail = Math.floor(Math.random() * 0xffffffffffff)
    .toString(16)
    .padStart(12, "0")
    .slice(0, 12);

  return `10000000-0000-4000-8000-${randomTail}`;
}
