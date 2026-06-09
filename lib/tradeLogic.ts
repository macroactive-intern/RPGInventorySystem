import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
  UUID,
} from "@/types/inventory";
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
  initiator: InventoryCollections;
  recipient: InventoryCollections;
  offer: TradeOffer;
}

type AnySlot = BackpackSlot | EquipmentSlot | HotbarSlot;

interface SlotDeduction {
  slotId: UUID;
  quantity: number;
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

/**
 * Atomically completes an accepted trade between two players.
 * Validates both sides, computes the full result, then applies both
 * inventory changes together. Returns null without touching either
 * inventory if any condition is not met.
 */
export function completeTrade(
  offer: TradeOffer,
  initiatorInventory: InventoryCollections,
  recipientInventory: InventoryCollections,
): TradeCompletionResult | null {
  if (offer.status !== "accepted") {
    return null;
  }

  if (!validateTradeOffer(initiatorInventory, offer.initiatorItems).valid) {
    return null;
  }

  if (!validateTradeOffer(recipientInventory, offer.recipientItems).valid) {
    return null;
  }

  const initiatorAfterRemoval = removeOfferedItems(
    initiatorInventory,
    offer.initiatorItems,
  );
  const updatedInitiator = addItemsToBackpack(
    initiatorAfterRemoval,
    offer.recipientItems,
  );

  const recipientAfterRemoval = removeOfferedItems(
    recipientInventory,
    offer.recipientItems,
  );
  const updatedRecipient = addItemsToBackpack(
    recipientAfterRemoval,
    offer.initiatorItems,
  );

  if (!updatedInitiator || !updatedRecipient) {
    return null;
  }

  return {
    initiator: updatedInitiator,
    recipient: updatedRecipient,
    offer: { ...offer, status: "completed", completedAt: Date.now() },
  };
}

function removeOfferedItems(
  inventory: InventoryCollections,
  offeredItems: readonly InventoryItem[],
): InventoryCollections {
  let current = inventory;

  for (const item of offeredItems) {
    const deductions = buildDeductions(current, getTemplateId(item), item.quantity);
    current = applyDeductions(current, deductions);
  }

  return current;
}

function buildDeductions(
  inventory: InventoryCollections,
  templateId: UUID,
  totalToDeduct: number,
): SlotDeduction[] {
  const deductions: SlotDeduction[] = [];
  let remaining = totalToDeduct;

  for (const slot of [
    ...inventory.backpack,
    ...inventory.equipment,
    ...inventory.hotbar,
  ]) {
    if (remaining <= 0) break;
    if (!slot.item) continue;
    if (getTemplateId(slot.item) !== templateId) continue;

    const quantity = Math.min(slot.item.quantity, remaining);
    deductions.push({ slotId: slot.id, quantity });
    remaining -= quantity;
  }

  return deductions;
}

function applyDeductions(
  inventory: InventoryCollections,
  deductions: readonly SlotDeduction[],
): InventoryCollections {
  if (deductions.length === 0) return inventory;

  const applyToSlots = <T extends AnySlot>(slots: readonly T[]): readonly T[] =>
    slots.map((slot) => {
      const deduction = deductions.find((d) => d.slotId === slot.id);
      if (!deduction || !slot.item) return slot;

      const newQuantity = slot.item.quantity - deduction.quantity;
      return {
        ...slot,
        item: newQuantity > 0 ? { ...slot.item, quantity: newQuantity } : null,
      } as T;
    });

  return {
    backpack: applyToSlots(inventory.backpack),
    equipment: applyToSlots(inventory.equipment),
    hotbar: applyToSlots(inventory.hotbar),
  };
}

function addItemsToBackpack(
  inventory: InventoryCollections,
  items: readonly InventoryItem[],
): InventoryCollections | null {
  let current = inventory;

  for (const item of items) {
    const result = addSingleItemToBackpack(current, item);
    if (!result) return null;
    current = result;
  }

  return current;
}

function addSingleItemToBackpack(
  inventory: InventoryCollections,
  item: InventoryItem,
): InventoryCollections | null {
  const templateId = getTemplateId(item);
  let backpack = mergeIntoExistingBackpackStacks(inventory.backpack, item);

  const quantityBefore = countMatchingTemplateQuantity(inventory.backpack, templateId);
  const quantityAfterMerge = countMatchingTemplateQuantity(backpack, templateId);
  let remainingQuantity = item.quantity - (quantityAfterMerge - quantityBefore);

  while (remainingQuantity > 0) {
    const emptySlot = backpack.find((slot) => slot.item === null);
    if (!emptySlot) return null;

    const quantityInSlot = Math.min(remainingQuantity, item.maxStack);
    backpack = backpack.map((slot) =>
      slot.id === emptySlot.id
        ? { ...slot, item: { ...item, quantity: quantityInSlot } }
        : slot,
    );
    remainingQuantity -= quantityInSlot;
  }

  return { ...inventory, backpack };
}

function mergeIntoExistingBackpackStacks(
  backpack: readonly BackpackSlot[],
  item: InventoryItem,
): readonly BackpackSlot[] {
  if (item.maxStack <= 1) return backpack;

  const templateId = getTemplateId(item);
  let remaining = item.quantity;

  return backpack.map((slot) => {
    if (remaining <= 0 || !slot.item) return slot;
    if (getTemplateId(slot.item) !== templateId) return slot;

    const space = slot.item.maxStack - slot.item.quantity;
    if (space <= 0) return slot;

    const toAdd = Math.min(space, remaining);
    remaining -= toAdd;

    return { ...slot, item: { ...slot.item, quantity: slot.item.quantity + toAdd } };
  });
}

function countMatchingTemplateQuantity(
  backpack: readonly BackpackSlot[],
  templateId: UUID,
): number {
  return backpack.reduce((total, slot) => {
    if (!slot.item) return total;
    return getTemplateId(slot.item) === templateId
      ? total + slot.item.quantity
      : total;
  }, 0);
}
