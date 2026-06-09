import type { InventoryItem } from "@/types/inventory";
import type { InventoryCollections } from "@/lib/inventoryLogic";
import { getTemplateId } from "@/lib/itemIdentity";
import type { TradeOffer } from "@/types/trade";

export type { TradeOffer, TradeStatus } from "@/types/trade";

export type TradeValidationFailureReason =
  | "missing-item"
  | "insufficient-quantity";

export interface TradeValidationResult {
  valid: boolean;
  reason?: TradeValidationFailureReason;
}

export interface TradeCompletionResult {
  initiatorInventory: InventoryCollections;
  recipientInventory: InventoryCollections;
}

/**
 * Checks whether an inventory holds sufficient quantities of all offered items.
 * Scans backpack, equipment, and hotbar. Never mutates inventory.
 * Uses template identity so split stacks of the same item count together.
 */
export function validateTradeOffer(
  inventory: InventoryCollections,
  offeredItems: readonly InventoryItem[],
): TradeValidationResult {
  const allSlots = [
    ...inventory.backpack,
    ...inventory.equipment,
    ...inventory.hotbar,
  ];

  for (const offered of offeredItems) {
    const offeredTemplateId = getTemplateId(offered);

    const heldQuantity = allSlots.reduce((total, slot) => {
      if (!slot.item) return total;
      return getTemplateId(slot.item) === offeredTemplateId
        ? total + slot.item.quantity
        : total;
    }, 0);

    if (heldQuantity === 0) {
      return { valid: false, reason: "missing-item" };
    }

    if (heldQuantity < offered.quantity) {
      return { valid: false, reason: "insufficient-quantity" };
    }
  }

  return { valid: true };
}

/** Placeholder — implemented in Step 5. */
export function completeTrade(
  _offer: TradeOffer,
  _initiatorInventory: InventoryCollections,
  _recipientInventory: InventoryCollections,
): TradeCompletionResult | null {
  return null;
}
