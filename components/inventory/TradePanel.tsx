"use client";

import { memo, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getIconPlaceholder } from "@/lib/inventoryDisplay";
import { validateTradeOffer } from "@/lib/tradeLogic";
import type { TradeValidationFailureReason } from "@/lib/tradeLogic";
import { useInventoryStore } from "@/store/inventoryStore";
import { useTradeStore } from "@/store/tradeStore";
import type { InventoryItem } from "@/types/inventory";
import type { TradeOffer, TradeStatus } from "@/types/trade";

function TradePanel() {
  const { backpack, equipment, hotbar } = useInventoryStore(
    useShallow((state) => ({
      backpack: state.backpack,
      equipment: state.equipment,
      hotbar: state.hotbar,
    })),
  );

  const {
    offer,
    startTrade,
    addItemToOffer,
    submitOffer,
    acceptOffer,
    rejectOffer,
    cancelOffer,
    completeAcceptedTrade,
    resetTrade,
  } = useTradeStore(
    useShallow((state) => ({
      offer: state.offer,
      startTrade: state.startTrade,
      addItemToOffer: state.addItemToOffer,
      submitOffer: state.submitOffer,
      acceptOffer: state.acceptOffer,
      rejectOffer: state.rejectOffer,
      cancelOffer: state.cancelOffer,
      completeAcceptedTrade: state.completeAcceptedTrade,
      resetTrade: state.resetTrade,
    })),
  );

  const validation = useMemo(
    () => validateTradeOffer({ backpack, equipment, hotbar }, offer?.initiatorItems ?? []),
    [backpack, equipment, hotbar, offer?.initiatorItems],
  );

  const canComplete = offer?.status === "accepted" && validation.valid;
  const disabledReason =
    offer?.status === "accepted" && !validation.valid
      ? describeInvalidReason(validation.reason)
      : null;

  function handleComplete() {
    if (!canComplete) return;
    const currentInventory = { backpack, equipment, hotbar };
    const initiatorResult = completeAcceptedTrade(currentInventory);
    if (initiatorResult) {
      useInventoryStore.setState({
        backpack: initiatorResult.backpack,
        equipment: initiatorResult.equipment,
        hotbar: initiatorResult.hotbar,
      });
    }
  }

  function handleStartDemo() {
    const inventory = { backpack, equipment, hotbar };
    const npcInventory = {
      backpack: backpack.map((slot) => ({ ...slot, item: null })),
      equipment: equipment.map((slot) => ({ ...slot, item: null })),
      hotbar: hotbar.map((slot) => ({ ...slot, item: null })),
    };
    startTrade(inventory, npcInventory);
    const firstItem = backpack.find((slot) => slot.item !== null)?.item;
    if (firstItem) {
      addItemToOffer("initiator", { ...firstItem, quantity: 1 });
    }
  }

  const hasItems = backpack.some((slot) => slot.item !== null);

  return (
    <section
      aria-labelledby="trade-heading"
      className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white" id="trade-heading">
          Trade
        </h2>
        <p className="mt-1 text-sm text-slate-400">Exchange items between players</p>
      </div>

      {!offer ? (
        <button
          className="w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          disabled={!hasItems}
          onClick={handleStartDemo}
          type="button"
        >
          Start Demo Trade
        </button>
      ) : (
        <TradeOfferView
          canComplete={canComplete}
          disabledReason={disabledReason}
          offer={offer}
          onAccept={acceptOffer}
          onCancel={cancelOffer}
          onComplete={handleComplete}
          onReject={rejectOffer}
          onReset={resetTrade}
          onSubmit={submitOffer}
        />
      )}
    </section>
  );
}

interface TradeOfferViewProps {
  canComplete: boolean;
  disabledReason: string | null;
  offer: TradeOffer;
  onAccept: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onReject: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

function TradeOfferView({
  canComplete,
  disabledReason,
  offer,
  onAccept,
  onCancel,
  onComplete,
  onReject,
  onReset,
  onSubmit,
}: TradeOfferViewProps) {
  const isTerminal = ["completed", "rejected", "cancelled"].includes(offer.status);

  return (
    <div>
      <StatusBadge status={offer.status} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <OfferItemList items={offer.initiatorItems} label="Your offer" />
        <OfferItemList items={offer.recipientItems} label="Their offer" />
      </div>

      {disabledReason ? (
        <div
          className="mt-3 rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {disabledReason}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2">
        {offer.status === "pending" && (
          <>
            <button
              className="w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              onClick={onSubmit}
              type="button"
            >
              Submit Offer
            </button>
            <button
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          </>
        )}

        {offer.status === "offered" && (
          <>
            <button
              className="w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              onClick={onAccept}
              type="button"
            >
              Accept Offer
            </button>
            <button
              className="w-full rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/70"
              onClick={onReject}
              type="button"
            >
              Reject Offer
            </button>
            <button
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          </>
        )}

        {offer.status === "accepted" && (
          <>
            <button
              className="w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              disabled={!canComplete}
              onClick={onComplete}
              type="button"
            >
              Complete Trade
            </button>
            <button
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          </>
        )}

        {isTerminal && (
          <button
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            onClick={onReset}
            type="button"
          >
            Start New Trade
          </button>
        )}
      </div>
    </div>
  );
}

interface OfferItemListProps {
  items: readonly InventoryItem[];
  label: string;
}

function OfferItemList({ items, label }: OfferItemListProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 p-2.5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      {items.length === 0 ? (
        <div className="flex min-h-12 items-center justify-center text-xs text-slate-600">
          Nothing offered
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              className="flex items-center gap-2 rounded bg-slate-900 px-2 py-1.5 text-xs"
              key={item.id}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {getIconPlaceholder(item)}
              </span>
              <span className="flex-1 truncate text-slate-200">{item.name}</span>
              <span className="text-slate-500">×{item.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: TradeStatus }) {
  const colors: Record<TradeStatus, string> = {
    pending: "text-amber-300 bg-amber-950/40",
    offered: "text-blue-300 bg-blue-950/40",
    accepted: "text-emerald-300 bg-emerald-950/40",
    completed: "text-emerald-300 bg-emerald-950/40",
    rejected: "text-red-300 bg-red-950/40",
    cancelled: "text-slate-400 bg-slate-800",
  };

  const labels: Record<TradeStatus, string> = {
    pending: "Building offer…",
    offered: "Offer sent — awaiting response",
    accepted: "Accepted — ready to complete",
    completed: "Trade completed",
    rejected: "Offer rejected",
    cancelled: "Trade cancelled",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}
      role="status"
    >
      {labels[status]}
    </div>
  );
}

function describeInvalidReason(
  reason: TradeValidationFailureReason | undefined,
): string {
  if (reason === "missing-item") {
    return "You no longer have one of the offered items.";
  }
  if (reason === "insufficient-quantity") {
    return "You no longer have enough of one of the offered items.";
  }
  return "Trade cannot be completed.";
}

const _TradePanel = memo(TradePanel);
export { _TradePanel as TradePanel };
