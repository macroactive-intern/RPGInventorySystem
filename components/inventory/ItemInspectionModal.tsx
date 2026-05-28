"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import {
  useInventoryStore,
  type ItemInspectionModalState,
} from "@/store/inventoryStore";
import { formatStatValue, statLabels } from "@/lib/inventoryDisplay";
import type { ItemStats } from "@/types/inventory";

const rarityClasses = {
  common: "border-slate-500 text-slate-200",
  uncommon: "border-emerald-400 text-emerald-200",
  rare: "border-sky-400 text-sky-200",
  epic: "border-violet-400 text-violet-200",
  legendary: "border-amber-400 text-amber-200",
  mythic: "border-rose-400 text-rose-200",
};

export function ItemInspectionModal() {
  const closeItemInspectionModal = useInventoryStore(
    (state) => state.closeItemInspectionModal,
  );
  const itemInspectionModal = useInventoryStore(
    (state) => state.itemInspectionModal,
  );

  if (!itemInspectionModal) {
    return null;
  }

  return (
    <ItemInspectionDialog
      closeItemInspectionModal={closeItemInspectionModal}
      itemInspectionModal={itemInspectionModal}
    />
  );
}

interface ItemInspectionDialogProps {
  closeItemInspectionModal: () => void;
  itemInspectionModal: ItemInspectionModalState;
}

function ItemInspectionDialog({
  closeItemInspectionModal,
  itemInspectionModal,
}: ItemInspectionDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const item = itemInspectionModal.item;
  const statEntries = useMemo(() => getStatEntries(item.stats), [item.stats]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeItemInspectionModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    closeButtonRef.current?.focus();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <section
        aria-labelledby="item-inspection-heading"
        aria-modal="true"
        className={`w-full max-w-lg rounded-lg border bg-slate-950 p-5 shadow-2xl shadow-black/60 ${
          rarityClasses[item.rarity]
        }`}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="min-w-0">
            <h2
              className="truncate text-xl font-semibold text-white"
              id="item-inspection-heading"
            >
              {item.name}
            </h2>
            <div className="mt-1 text-sm capitalize">{item.rarity}</div>
          </div>
          <button
            aria-label="Close item inspection"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            onClick={closeItemInspectionModal}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="rounded-md bg-slate-900 px-3 py-2 text-sm leading-6 text-slate-300">
            {item.description ?? "Description coming soon."}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoBlock label="Type" value={item.type} />
            <InfoBlock label="Quantity" value={item.quantity.toString()} />
            <InfoBlock label="Weight" value={`${item.weight.toFixed(2)} kg`} />
            <InfoBlock label="Max Stack" value={item.maxStack.toString()} />
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Stats
            </h3>
            {statEntries.length > 0 ? (
              <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {statEntries.map(([key, value]) => (
                  <div
                    className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                    key={key}
                  >
                    <dt className="text-slate-400">{statLabels[key]}</dt>
                    <dd className="font-semibold text-white">
                      {formatStatValue(key, value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-500">
                No stat modifiers.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

interface InfoBlockProps {
  label: string;
  value: string;
}

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm capitalize text-slate-100">{value}</div>
    </div>
  );
}

function getStatEntries(
  stats: ItemStats | undefined,
): [keyof ItemStats, number][] {
  if (!stats) {
    return [];
  }

  return (Object.entries(stats) as [keyof ItemStats, number | undefined][])
    .filter((entry): entry is [keyof ItemStats, number] => entry[1] !== undefined);
}
