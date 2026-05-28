"use client";

import type { EquipmentSlot, InventoryItem, SlotType } from "@/types/inventory";
import { useInventoryStore } from "@/store/inventoryStore";

const rarityBorderClasses: Record<InventoryItem["rarity"], string> = {
  common: "border-slate-500",
  uncommon: "border-emerald-500",
  rare: "border-sky-500",
  epic: "border-violet-500",
  legendary: "border-amber-500",
  mythic: "border-rose-500",
};

interface EquipmentSlotDefinition {
  label: string;
  type: SlotType;
  accepted: string;
  occurrence?: number;
  className: string;
}

const equipmentSlots: readonly EquipmentSlotDefinition[] = [
  {
    label: "Head",
    type: "head",
    accepted: "Helmet",
    className: "col-start-2 row-start-1",
  },
  {
    label: "Weapon",
    type: "mainHand",
    accepted: "Weapon",
    className: "col-start-1 row-start-2",
  },
  {
    label: "Chest",
    type: "chest",
    accepted: "Chest armor",
    className: "col-start-2 row-start-2",
  },
  {
    label: "Off-hand",
    type: "offHand",
    accepted: "Weapon / shield",
    className: "col-start-3 row-start-2",
  },
  {
    label: "Ring L",
    type: "ring",
    accepted: "Ring",
    occurrence: 0,
    className: "col-start-1 row-start-3",
  },
  {
    label: "Legs",
    type: "legs",
    accepted: "Leg armor",
    className: "col-start-2 row-start-3",
  },
  {
    label: "Ring R",
    type: "ring",
    accepted: "Ring",
    occurrence: 1,
    className: "col-start-3 row-start-3",
  },
  {
    label: "Back",
    type: "back",
    accepted: "Cloak",
    className: "col-start-2 row-start-4",
  },
];

export function EquipmentPanel() {
  const equipment = useInventoryStore((state) => state.equipment);

  return (
    <section
      aria-labelledby="equipment-heading"
      className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white" id="equipment-heading">
          Equipment
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Equipped gear and available body slots
        </p>
      </div>

      <div className="relative">
        <BodySilhouette />
        <div className="grid grid-cols-3 grid-rows-4 gap-3">
          {equipmentSlots.map((definition) => (
            <EquipmentSlotCard
              definition={definition}
              key={`${definition.type}-${definition.label}`}
              slot={findEquipmentSlot(equipment, definition)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface EquipmentSlotCardProps {
  definition: EquipmentSlotDefinition;
  slot: EquipmentSlot | null;
}

function EquipmentSlotCard({ definition, slot }: EquipmentSlotCardProps) {
  const item = slot?.item ?? null;
  const borderClass = item
    ? rarityBorderClasses[item.rarity]
    : "border-dashed border-slate-700";

  return (
    <div
      aria-label={
        item
          ? `${definition.label}: ${item.name}`
          : `${definition.label}: empty ${definition.accepted} slot`
      }
      className={`relative z-10 min-h-28 rounded-md border bg-slate-950/90 p-3 ${borderClass} ${definition.className}`}
    >
      <div className="flex h-full flex-col justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">
            {definition.label}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Accepts {definition.accepted}
          </div>
        </div>

        {item ? (
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-slate-800 text-sm font-bold text-slate-100">
              {getIconPlaceholder(item)}
            </div>
            <div className="truncate text-sm font-medium text-white">
              {item.name}
            </div>
            <div className="mt-1 text-xs capitalize text-slate-400">
              {item.rarity}
            </div>
          </div>
        ) : (
          <div className="rounded bg-slate-900/80 px-3 py-2 text-sm text-slate-500">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

function BodySilhouette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-4 z-0 mx-auto hidden h-[calc(100%-2rem)] w-28 sm:block"
    >
      <div className="mx-auto h-12 w-12 rounded-full border border-slate-700 bg-slate-800/50" />
      <div className="mx-auto mt-3 h-32 w-20 rounded-t-full border border-slate-700 bg-slate-800/40" />
      <div className="mx-auto mt-2 flex w-20 gap-2">
        <div className="h-24 flex-1 rounded-b-full border border-slate-700 bg-slate-800/30" />
        <div className="h-24 flex-1 rounded-b-full border border-slate-700 bg-slate-800/30" />
      </div>
    </div>
  );
}

function findEquipmentSlot(
  equipment: readonly EquipmentSlot[],
  definition: EquipmentSlotDefinition,
): EquipmentSlot | null {
  const matchingSlots = equipment.filter((slot) => slot.type === definition.type);
  const occurrence = definition.occurrence ?? 0;

  return matchingSlots[occurrence] ?? null;
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
