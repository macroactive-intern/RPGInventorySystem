import { create } from "zustand";
import type { InventoryItem, UUID } from "@/types/inventory";
import type { InventoryCollections } from "@/lib/inventoryLogic";
import type { TradeOffer } from "@/types/trade";
import { completeTrade } from "@/lib/tradeLogic";

export type TradeSide = "initiator" | "recipient";

export interface TradeStoreState {
  offer: TradeOffer | null;
  initiatorInventory: InventoryCollections | null;
  recipientInventory: InventoryCollections | null;
  startTrade: (
    initiatorInventory: InventoryCollections,
    recipientInventory: InventoryCollections,
  ) => void;
  addItemToOffer: (side: TradeSide, item: InventoryItem) => void;
  removeItemFromOffer: (side: TradeSide, item: InventoryItem) => void;
  submitOffer: () => void;
  acceptOffer: () => void;
  rejectOffer: () => void;
  cancelOffer: () => void;
  completeAcceptedTrade: () => void;
  resetTrade: () => void;
}

export const useTradeStore = create<TradeStoreState>((set, get) => ({
  offer: null,
  initiatorInventory: null,
  recipientInventory: null,

  startTrade: (initiatorInventory, recipientInventory) =>
    set({
      initiatorInventory,
      recipientInventory,
      offer: {
        id: createTradeId(),
        status: "pending",
        initiatorItems: [],
        recipientItems: [],
        createdAt: Date.now(),
      },
    }),

  addItemToOffer: (side, item) => {
    const { offer } = get();
    if (!offer || offer.status !== "pending") return;

    const key = side === "initiator" ? "initiatorItems" : "recipientItems";
    set({ offer: { ...offer, [key]: [...offer[key], item] } });
  },

  removeItemFromOffer: (side, item) => {
    const { offer } = get();
    if (!offer || offer.status !== "pending") return;

    const key = side === "initiator" ? "initiatorItems" : "recipientItems";
    set({
      offer: {
        ...offer,
        [key]: offer[key].filter((i) => i.id !== item.id),
      },
    });
  },

  submitOffer: () => {
    const { offer } = get();
    if (!offer || offer.status !== "pending") return;
    set({ offer: { ...offer, status: "offered" } });
  },

  acceptOffer: () => {
    const { offer } = get();
    if (!offer || offer.status !== "offered") return;
    set({ offer: { ...offer, status: "accepted" } });
  },

  rejectOffer: () => {
    const { offer } = get();
    if (!offer || offer.status !== "offered") return;
    set({ offer: { ...offer, status: "rejected" } });
  },

  cancelOffer: () => {
    const { offer } = get();
    if (
      !offer ||
      (offer.status !== "pending" && offer.status !== "offered")
    ) {
      return;
    }
    set({ offer: { ...offer, status: "cancelled" } });
  },

  completeAcceptedTrade: () => {
    const { offer, initiatorInventory, recipientInventory } = get();
    if (!offer || !initiatorInventory || !recipientInventory) return;

    // Status guard prevents double-completion: after the first successful
    // call, offer.status becomes "completed" and this check fails.
    if (offer.status !== "accepted") return;

    const result = completeTrade(offer, initiatorInventory, recipientInventory);
    if (!result) return;

    // Both inventory updates and the offer status change are applied in one
    // Zustand set() call — neither side is ever partially updated.
    set({
      initiatorInventory: result.initiator,
      recipientInventory: result.recipient,
      offer: result.offer,
    });
  },

  resetTrade: () =>
    set({
      offer: null,
      initiatorInventory: null,
      recipientInventory: null,
    }),
}));

function createTradeId(): UUID {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomTail = Math.floor(Math.random() * 0xffffffffffff)
    .toString(16)
    .padStart(12, "0")
    .slice(0, 12);

  return `10000000-0000-4000-8000-${randomTail}`;
}
