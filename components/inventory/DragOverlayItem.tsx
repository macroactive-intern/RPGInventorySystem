"use client";

import {
  getIconPlaceholder,
  rarityBorderClasses,
  rarityTextClasses,
} from "@/lib/inventoryDisplay";
import type { InventoryItem } from "@/types/inventory";

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

