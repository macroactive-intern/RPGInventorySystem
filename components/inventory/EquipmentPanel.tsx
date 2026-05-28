"use client";

import type { EquipmentSlot, SlotType } from "@/types/inventory";
import {
  getIconPlaceholder,
  itemMatchesSearch,
  rarityBorderClasses,
} from "@/lib/inventoryDisplay";
import { isSameSlot } from "@/lib/inventoryLogic";
import { useInventoryStore } from "@/store/inventoryStore";
import {
  DraggableInventoryItem,
  InventoryDroppableSlot,
} from "@/components/inventory/InventoryDnd";

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
  const inventorySearchQuery = useInventoryStore(
    (state) => state.inventorySearchQuery,
  );
  const rejectedSlot = useInventoryStore((state) => state.rejectedSlot);
  const item = slot?.item ?? null;
  const isSearchMatch = itemMatchesSearch(item, inventorySearchQuery);
  const borderClass = item
    ? rarityBorderClasses[item.rarity]
    : "border-dashed border-slate-700";
  const slotPointer = {
    container: "equipment" as const,
    slotId: slot?.id ?? `missing-equipment-slot-${definition.label}`,
  };
  const isRejected = isSameSlot(rejectedSlot?.slot ?? null, slotPointer);

  return (
    <InventoryDroppableSlot
      className={`relative z-10 min-h-28 rounded-md border bg-slate-950/90 p-3 transition-shadow ${borderClass} ${
        isRejected ? "bg-red-950/20" : ""
      } ${
        isSearchMatch
          ? "ring-2 ring-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.45)]"
          : ""
      } ${definition.className}`}
      label={
        item
          ? `${definition.label}: ${item.name}`
          : `${definition.label}: empty ${definition.accepted} slot`
      }
      slot={slotPointer}
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
          <DraggableInventoryItem
            className={`cursor-grab touch-none rounded active:cursor-grabbing ${
              isSearchMatch ? "bg-amber-950/40 p-2" : ""
            }`}
            item={item}
            source={slotPointer}
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-slate-800 text-sm font-bold text-slate-100">
              {getIconPlaceholder(item)}
            </div>
            <div className="truncate text-sm font-medium text-white">
              {item.name}
            </div>
            <div className="mt-1 text-xs capitalize text-slate-400">
              {item.rarity}
            </div>
          </DraggableInventoryItem>
        ) : (
          <div className="rounded bg-slate-900/80 px-3 py-2 text-sm text-slate-500">
            Empty
          </div>
        )}

        {isRejected ? (
          <div
            className="rounded bg-red-950/80 px-2 py-1 text-xs font-semibold text-red-100"
            role="status"
          >
            {rejectedSlot?.reason ?? "Invalid drop"}
          </div>
        ) : null}
      </div>
    </InventoryDroppableSlot>
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

