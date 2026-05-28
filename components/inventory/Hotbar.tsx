"use client";

import { useInventoryStore } from "@/store/inventoryStore";
import type { InventoryItem } from "@/types/inventory";
import {
  DraggableInventoryItem,
  InventoryDroppableSlot,
} from "@/components/inventory/InventoryDnd";

const HOTBAR_SLOT_COUNT = 5;

const rarityBorderClasses: Record<InventoryItem["rarity"], string> = {
  common: "border-slate-500",
  uncommon: "border-emerald-500",
  rare: "border-sky-500",
  epic: "border-violet-500",
  legendary: "border-amber-500",
  mythic: "border-rose-500",
};

export function Hotbar() {
  const hotbar = useInventoryStore((state) => state.hotbar);
  const slots = Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => {
    return hotbar.find((slot) => slot.index === index) ?? null;
  });

  return (
    <section
      aria-labelledby="hotbar-heading"
      className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white" id="hotbar-heading">
            Hotbar
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {hotbar.filter((slot) => slot.item).length} / {HOTBAR_SLOT_COUNT}{" "}
            ready
          </p>
        </div>
        <div className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300">
          1-5
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2" role="list">
        {slots.map((slot, index) => (
          <HotbarSlotCell
            index={index}
            item={slot?.item ?? null}
            key={slot?.id ?? `empty-hotbar-slot-${index}`}
            slotId={slot?.id}
          />
        ))}
      </div>
    </section>
  );
}

interface HotbarSlotCellProps {
  index: number;
  item: InventoryItem | null;
  slotId?: string;
}

function HotbarSlotCell({ index, item, slotId }: HotbarSlotCellProps) {
  const inventorySearchQuery = useInventoryStore(
    (state) => state.inventorySearchQuery,
  );
  const slotNumber = index + 1;
  const isSearchMatch = itemMatchesSearch(item, inventorySearchQuery);
  const borderClass = item
    ? rarityBorderClasses[item.rarity]
    : "border-dashed border-slate-700";
  const slot = {
    container: "hotbar" as const,
    slotId: slotId ?? `missing-hotbar-slot-${index}`,
  };

  return (
    <InventoryDroppableSlot
      className={`relative aspect-square min-h-20 rounded-md border bg-slate-950 p-2 shadow-md shadow-black/20 transition-shadow ${borderClass} ${
        isSearchMatch
          ? "ring-2 ring-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.45)]"
          : ""
      }`}
      label={
        item
          ? `Hotbar slot ${slotNumber}: ${item.name}, quantity ${item.quantity}`
          : `Hotbar slot ${slotNumber}: empty consumable slot`
      }
      role="listitem"
      slot={slot}
    >
      <div className="absolute left-2 top-1.5 flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-300">
        {slotNumber}
      </div>

      {item ? (
        <DraggableInventoryItem
          className={`flex h-full cursor-grab touch-none flex-col justify-between rounded pt-5 active:cursor-grabbing ${
            isSearchMatch ? "bg-amber-950/40 px-1 pb-1" : ""
          }`}
          item={item}
          source={slot}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center rounded bg-slate-900 text-base font-bold text-slate-100 sm:text-lg">
            {getIconPlaceholder(item)}
          </div>
          <div className="mt-1 flex items-center justify-between gap-1 text-[0.65rem] text-slate-300">
            <span className="truncate">{item.name}</span>
            {item.quantity > 1 ? (
              <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-semibold text-white">
                {item.quantity}
              </span>
            ) : null}
          </div>
        </DraggableInventoryItem>
      ) : (
        <div className="flex h-full items-end justify-center rounded bg-slate-900/60 pb-2 text-xs text-slate-600">
          Consumable
        </div>
      )}
    </InventoryDroppableSlot>
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

function itemMatchesSearch(
  item: InventoryItem | null,
  searchQuery: string,
): boolean {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return Boolean(
    normalizedQuery && item?.name.toLowerCase().includes(normalizedQuery),
  );
}
