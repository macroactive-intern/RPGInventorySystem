import { create } from "zustand";
import type { InventoryItem, UUID } from "@/types/inventory";
import type { InventoryCollections } from "@/lib/inventoryLogic";
import type { TradeOffer } from "@/types/trade";
import { completeTrade } from "@/lib/tradeLogic";
import { createUUID } from "@/lib/uuid";

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
  completeAcceptedTrade: (currentInventory: InventoryCollections) => InventoryCollections | null;
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
        id: createUUID(),
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
    if (offer[key].some((i) => i.id === item.id)) return;
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
    if (!offer || (offer.status !== "pending" && offer.status !== "offered")) return;
    set({ offer: { ...offer, status: "cancelled" } });
  },

  completeAcceptedTrade: (currentInventory) => {
    const { offer, recipientInventory } = get();
    if (!offer || !recipientInventory) return null;
    if (offer.status !== "accepted") return null;

    const result = completeTrade(offer, currentInventory, recipientInventory);
    if (!result) return null;

    set({
      initiatorInventory: result.initiator,
      recipientInventory: result.recipient,
      offer: result.offer,
    });

    return result.initiator;
  },

  resetTrade: () =>
    set({
      offer: null,
      initiatorInventory: null,
      recipientInventory: null,
    }),
}));

