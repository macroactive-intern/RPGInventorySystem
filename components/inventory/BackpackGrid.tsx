"use client";

import type { InventoryItem } from "@/types/inventory";
import {
  getIconPlaceholder,
  itemMatchesSearch,
  rarityBorderClasses,
  rarityGlowClasses,
} from "@/lib/inventoryDisplay";
import { useInventoryStore } from "@/store/inventoryStore";
import {
  DraggableInventoryItem,
  InventoryDroppableSlot,
} from "@/components/inventory/InventoryDnd";

export function BackpackGrid() {
  const backpack = useInventoryStore((state) => state.backpack);
  const slotCount = backpack.length;
  const slots = Array.from({ length: slotCount }, (_, index) => {
    return backpack.find((slot) => slot.index === index) ?? null;
  });

  return (
    <section aria-labelledby="backpack-heading" className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            className="text-xl font-semibold text-white"
            id="backpack-heading"
          >
            Backpack
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {backpack.filter((slot) => slot.item).length} / {slotCount} slots
            filled
          </p>
        </div>
        <div className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300">
          {slotCount} slots
        </div>
      </div>

      <div
        className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10"
        role="list"
      >
        {slots.map((slot, index) => (
          <InventorySlotCell
            index={index}
            item={slot?.item ?? null}
            key={slot?.id ?? `empty-backpack-slot-${index}`}
            slotId={slot?.id}
          />
        ))}
      </div>
    </section>
  );
}

interface InventorySlotCellProps {
  index: number;
  item: InventoryItem | null;
  slotId?: string;
}

function InventorySlotCell({ index, item, slotId }: InventorySlotCellProps) {
  const inventorySearchQuery = useInventoryStore(
    (state) => state.inventorySearchQuery,
  );
  const rarityBorder = item
    ? rarityBorderClasses[item.rarity]
    : "border-slate-700";
  const rarityGlow = item ? rarityGlowClasses[item.rarity] : "shadow-black/20";
  const isSearchMatch = itemMatchesSearch(item, inventorySearchQuery);
  const slot = {
    container: "backpack" as const,
    slotId: slotId ?? `missing-backpack-slot-${index}`,
  };

  return (
    <InventoryDroppableSlot
      className={`relative aspect-square rounded-md border bg-slate-900/90 p-1.5 shadow-md transition-shadow ${rarityBorder} ${rarityGlow} ${
        isSearchMatch
          ? "ring-2 ring-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.45)]"
          : ""
      }`}
      label={
        item
          ? `Backpack slot ${index + 1}: ${item.name}, quantity ${item.quantity}`
          : `Backpack slot ${index + 1}: empty`
      }
      role="listitem"
      slot={slot}
    >
      {item ? (
        <DraggableInventoryItem
          className={`flex h-full cursor-grab touch-none flex-col justify-between rounded p-1.5 active:cursor-grabbing ${
            isSearchMatch ? "bg-amber-950/50" : "bg-slate-800"
          }`}
          item={item}
          source={slot}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center rounded bg-slate-950 text-base font-bold text-slate-200 sm:text-lg">
            {getIconPlaceholder(item)}
          </div>
          <div className="mt-1 flex items-center justify-between gap-1 text-[0.65rem] text-slate-300">
            <span className="truncate">{item.name}</span>
            {item.quantity > 1 ? (
              <span className="shrink-0 rounded bg-slate-950 px-1.5 py-0.5 font-semibold text-white">
                {item.quantity}
              </span>
            ) : null}
          </div>
        </DraggableInventoryItem>
      ) : (
        <div className="flex h-full items-center justify-center rounded bg-slate-950/60 text-xs text-slate-700">
          {index + 1}
        </div>
      )}
    </InventoryDroppableSlot>
  );
}

