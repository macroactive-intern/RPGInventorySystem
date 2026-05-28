"use client";

import { calculateWeight } from "@/lib/inventoryLogic";
import { useInventoryStore } from "@/store/inventoryStore";

const MAX_WEIGHT_KG = 20;
const WARNING_WEIGHT_KG = 15;

export function WeightPanel() {
  const backpack = useInventoryStore((state) => state.backpack);
  const equipment = useInventoryStore((state) => state.equipment);
  const currentWeight = calculateWeight(backpack, equipment);
  const percentage = Math.min((currentWeight / MAX_WEIGHT_KG) * 100, 100);
  const isEncumbered = currentWeight > MAX_WEIGHT_KG;
  const isWarned = currentWeight > WARNING_WEIGHT_KG && !isEncumbered;
  const speedPercent = getSpeedPercent(currentWeight);
  const status = isEncumbered
    ? "Encumbered"
    : isWarned
      ? "Heavy load"
      : "Mobile";
  const statusClass = isEncumbered
    ? "text-red-300"
    : isWarned
      ? "text-orange-300"
      : "text-emerald-300";
  const progressClass = isEncumbered
    ? "bg-red-500"
    : isWarned
      ? "bg-orange-400"
      : "bg-emerald-400";

  return (
    <section
      aria-labelledby="weight-heading"
      className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white" id="weight-heading">
            Carry Weight
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Current load and movement impact
          </p>
        </div>
        <div className={`text-right text-sm font-semibold ${statusClass}`}>
          {status}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Load</span>
          <span className="font-semibold text-white">
            {formatWeight(currentWeight)} / {MAX_WEIGHT_KG}kg
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-950">
          <div
            aria-hidden="true"
            className={`h-full rounded-full transition-all ${progressClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {(isWarned || isEncumbered) && (
        <div
          className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            isEncumbered
              ? "border-red-500/60 bg-red-950/40 text-red-100"
              : "border-orange-400/60 bg-orange-950/40 text-orange-100"
          }`}
        >
          {isEncumbered
            ? "Encumbered: speed is reduced to 0."
            : `Heavy load: speed penalty ${100 - speedPercent}%.`}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <DerivedStat label="Speed" value={`${speedPercent}%`} tone={statusClass} />
        <DerivedStat
          label="Penalty"
          value={`${100 - speedPercent}%`}
          tone={isWarned || isEncumbered ? statusClass : "text-slate-200"}
        />
        <DerivedStat label="Capacity" value={`${MAX_WEIGHT_KG}kg`} />
      </div>
    </section>
  );
}

interface DerivedStatProps {
  label: string;
  tone?: string;
  value: string;
}

function DerivedStat({
  label,
  tone = "text-slate-200",
  value,
}: DerivedStatProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-base font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function getSpeedPercent(weight: number): number {
  if (weight > MAX_WEIGHT_KG) {
    return 0;
  }

  if (weight > WARNING_WEIGHT_KG) {
    return Math.max(25, Math.round(100 - (weight - WARNING_WEIGHT_KG) * 10));
  }

  return 100;
}

function formatWeight(weight: number): string {
  return `${weight.toFixed(1)}kg`;
}
