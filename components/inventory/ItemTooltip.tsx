"use client";

import { canEquip } from "@/lib/inventoryLogic";
import { useInventoryStore } from "@/store/inventoryStore";
import type { InventoryItem, ItemStats } from "@/types/inventory";

const statLabels: Record<keyof ItemStats, string> = {
  armor: "Armor",
  criticalChance: "Critical chance",
  criticalDamage: "Critical damage",
  damageMax: "Max damage",
  damageMin: "Min damage",
  dexterity: "Dexterity",
  healthRestore: "Health restore",
  intelligence: "Intelligence",
  manaRestore: "Mana restore",
  strength: "Strength",
  vitality: "Vitality",
};

const percentageStats = new Set<keyof ItemStats>([
  "criticalChance",
  "criticalDamage",
]);

const rarityTextClasses: Record<InventoryItem["rarity"], string> = {
  common: "text-slate-300",
  uncommon: "text-emerald-300",
  rare: "text-sky-300",
  epic: "text-violet-300",
  legendary: "text-amber-300",
  mythic: "text-rose-300",
};

const rarityBorderClasses: Record<InventoryItem["rarity"], string> = {
  common: "border-slate-500",
  uncommon: "border-emerald-500",
  rare: "border-sky-500",
  epic: "border-violet-500",
  legendary: "border-amber-500",
  mythic: "border-rose-500",
};

export function ItemTooltip() {
  const equipment = useInventoryStore((state) => state.equipment);
  const tooltip = useInventoryStore((state) => state.tooltip);

  if (!tooltip) {
    return null;
  }

  const comparedItem =
    equipment.find((slot) => canEquip(tooltip.item, slot) && slot.item)?.item ??
    null;
  const statRows = getStatRows(tooltip.item, comparedItem);

  return (
    <div
      className={`pointer-events-none fixed z-50 w-72 rounded-md border bg-slate-950/95 p-4 text-sm shadow-2xl shadow-black/50 ${rarityBorderClasses[tooltip.item.rarity]}`}
      style={{
        left: tooltip.x + 16,
        top: tooltip.y + 16,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-white">
            {tooltip.item.name}
          </div>
          <div
            className={`mt-1 text-xs font-semibold capitalize ${rarityTextClasses[tooltip.item.rarity]}`}
          >
            {tooltip.item.rarity}
          </div>
        </div>
        {tooltip.item.quantity > 1 ? (
          <div className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
            x{tooltip.item.quantity}
          </div>
        ) : null}
      </div>

      {statRows.length > 0 ? (
        <div className="mt-4 space-y-1.5">
          {statRows.map((row) => (
            <div className="flex justify-between gap-3" key={row.key}>
              <span className="text-slate-400">{row.label}</span>
              <span className={row.className}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex justify-between gap-3 border-t border-slate-800 pt-3">
        <span className="text-slate-400">Weight</span>
        <span className="text-slate-200">{tooltip.item.weight.toFixed(2)}</span>
      </div>
      <div className="mt-1.5 flex justify-between gap-3">
        <span className="text-slate-400">Quantity</span>
        <span className="text-slate-200">{tooltip.item.quantity}</span>
      </div>
    </div>
  );
}

interface StatRow {
  className: string;
  key: keyof ItemStats;
  label: string;
  value: string;
}

function getStatRows(
  item: InventoryItem,
  comparedItem: InventoryItem | null,
): StatRow[] {
  const keys = Object.keys(statLabels) as (keyof ItemStats)[];

  return keys.flatMap((key) => {
    const value = item.stats?.[key];
    const comparedValue = comparedItem?.stats?.[key];

    if (value === undefined && comparedValue === undefined) {
      return [];
    }

    return [
      {
        className: getComparisonClass(value, comparedValue),
        key,
        label: statLabels[key],
        value: formatStatValue(key, value),
      },
    ];
  });
}

function getComparisonClass(
  value: number | undefined,
  comparedValue: number | undefined,
): string {
  if (value === undefined || comparedValue === undefined || value === comparedValue) {
    return "text-slate-200";
  }

  return value > comparedValue ? "text-emerald-300" : "text-red-300";
}

function formatStatValue(key: keyof ItemStats, value: number | undefined): string {
  if (value === undefined) {
    return "-";
  }

  if (percentageStats.has(key)) {
    return `${formatSignedNumber(value * 100)}%`;
  }

  return formatSignedNumber(value);
}

function formatSignedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
