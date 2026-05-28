"use client";

import type { InventoryItem } from "@/types/inventory";

const rarityBorderClasses: Record<InventoryItem["rarity"], string> = {
  common: "border-slate-500",
  uncommon: "border-emerald-500",
  rare: "border-sky-500",
  epic: "border-violet-500",
  legendary: "border-amber-500",
  mythic: "border-rose-500",
};

const rarityTextClasses: Record<InventoryItem["rarity"], string> = {
  common: "text-slate-300",
  uncommon: "text-emerald-300",
  rare: "text-sky-300",
  epic: "text-violet-300",
  legendary: "text-amber-300",
  mythic: "text-rose-300",
};

interface DragOverlayItemProps {
  item: InventoryItem;
}

export function DragOverlayItem({ item }: DragOverlayItemProps) {
  return (
    <div
      className={`w-36 rounded-md border bg-slate-950 p-2 shadow-2xl shadow-black/50 ${rarityBorderClasses[item.rarity]}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-slate-900 text-sm font-bold text-slate-100">
          {getIconPlaceholder(item)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {item.name}
          </div>
          <div className={`text-xs capitalize ${rarityTextClasses[item.rarity]}`}>
            {item.rarity}
          </div>
        </div>
      </div>
      {item.quantity > 1 ? (
        <div className="mt-2 inline-flex rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
          x{item.quantity}
        </div>
      ) : null}
    </div>
  );
}

function getIconPlaceholder(item: InventoryItem): string {
  return item.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
