import type { InventoryItem } from "@/types/inventory";

export const rarityBorderClasses: Record<InventoryItem["rarity"], string> = {
  common: "border-slate-500",
  uncommon: "border-emerald-500",
  rare: "border-sky-500",
  epic: "border-violet-500",
  legendary: "border-amber-500",
  mythic: "border-rose-500",
};

export const rarityGlowClasses: Record<InventoryItem["rarity"], string> = {
  common: "shadow-slate-950/20",
  uncommon: "shadow-emerald-950/40",
  rare: "shadow-sky-950/40",
  epic: "shadow-violet-950/40",
  legendary: "shadow-amber-950/40",
  mythic: "shadow-rose-950/40",
};

export const rarityTextClasses: Record<InventoryItem["rarity"], string> = {
  common: "text-slate-300",
  uncommon: "text-emerald-300",
  rare: "text-sky-300",
  epic: "text-violet-300",
  legendary: "text-amber-300",
  mythic: "text-rose-300",
};

export function getIconPlaceholder(item: InventoryItem): string {
  return item.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function itemMatchesSearch(
  item: InventoryItem | null,
  searchQuery: string,
): boolean {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return Boolean(
    normalizedQuery && item?.name.toLowerCase().includes(normalizedQuery),
  );
}
