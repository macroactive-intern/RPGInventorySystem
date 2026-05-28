import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
  SlotType,
  UUID,
} from "@/types/inventory";

export type InventoryContainer = "backpack" | "equipment" | "hotbar";

export interface InventoryCollections {
  backpack: readonly BackpackSlot[];
  equipment: readonly EquipmentSlot[];
  hotbar: readonly HotbarSlot[];
}

export interface SlotReference {
  container: InventoryContainer;
  slotId: UUID;
}

export interface StackMergeResult {
  source: InventoryItem | null;
  target: InventoryItem;
}

export interface SplitStackResult {
  remaining: InventoryItem;
  split: InventoryItem;
}

export type MoveFailureReason =
  | "missing-source"
  | "missing-target"
  | "invalid-target"
  | "invalid-swap"
  | "full-stack";

export interface MoveItemResult {
  inventory: InventoryCollections;
  moved: boolean;
  valid: boolean;
  reason?: MoveFailureReason;
}

type AnyInventorySlot = BackpackSlot | EquipmentSlot | HotbarSlot;

const equipmentSlotTypesByItemType: Record<
  InventoryItem["type"],
  readonly SlotType[]
> = {
  weapon: ["mainHand", "offHand"],
  armor: ["head", "chest", "hands", "legs", "feet"],
  accessory: ["neck", "ring", "trinket", "back"],
  consumable: [],
  material: [],
  quest: [],
  currency: [],
};

/** Checks whether an item is allowed in a specific equipment slot. */
export function canEquip(
  item: InventoryItem | null,
  slot: EquipmentSlot | SlotType,
): boolean {
  if (!item) {
    return false;
  }

  const slotType = typeof slot === "string" ? slot : slot.type;
  const validSlots = equipmentSlotTypesByItemType[item.type];

  // Base item category must be equippable before item-specific slot rules apply.
  if (!validSlots.includes(slotType)) {
    return false;
  }

  // allowedSlots narrows an item to specific slots, such as bows being main-hand only.
  return item.allowedSlots ? item.allowedSlots.includes(slotType) : true;
}

/** Calculates total carried and equipped weight, treating stack weight as per item. */
export function calculateWeight(
  backpack: readonly BackpackSlot[],
  equipment: readonly EquipmentSlot[],
): number {
  const backpackWeight = backpack.reduce(
    (total, slot) => total + getItemStackWeight(slot.item),
    0,
  );
  const equipmentWeight = equipment.reduce(
    (total, slot) => total + getItemStackWeight(slot.item),
    0,
  );

  return backpackWeight + equipmentWeight;
}

/** Merges matching stackable items while respecting the target stack limit. */
export function mergeStacks(
  source: InventoryItem,
  target: InventoryItem,
): StackMergeResult {
  if (!canMergeStacks(source, target)) {
    return { source, target };
  }

  const targetSpace = target.maxStack - target.quantity;
  const movedQuantity = Math.min(source.quantity, targetSpace);

  // Returning new objects preserves immutability and keeps total quantity unchanged.
  return {
    source:
      source.quantity === movedQuantity
        ? null
        : { ...source, quantity: source.quantity - movedQuantity },
    target: { ...target, quantity: target.quantity + movedQuantity },
  };
}

/** Splits one stack into two stacks without changing the total quantity. */
export function splitStack(
  item: InventoryItem,
  amount: number,
): SplitStackResult | null {
  if (item.maxStack <= 1 || amount <= 0 || amount >= item.quantity) {
    return null;
  }

  return {
    remaining: { ...item, quantity: item.quantity - amount },
    split: { ...item, quantity: amount },
  };
}

/** Moves an item into an empty compatible slot or merges compatible stacks. */
export function moveItem(
  inventory: InventoryCollections,
  from: SlotReference,
  to: SlotReference,
): InventoryCollections {
  return moveItemWithResult(inventory, from, to).inventory;
}

/** Moves an item and reports whether the attempted drop was valid. */
export function moveItemWithResult(
  inventory: InventoryCollections,
  from: SlotReference,
  to: SlotReference,
): MoveItemResult {
  if (isSameSlot(from, to)) {
    return { inventory, moved: false, valid: true };
  }

  const sourceSlot = findSlot(inventory, from);
  const targetSlot = findSlot(inventory, to);

  if (!sourceSlot?.item) {
    return {
      inventory,
      moved: false,
      reason: "missing-source",
      valid: false,
    };
  }

  if (!targetSlot) {
    return {
      inventory,
      moved: false,
      reason: "missing-target",
      valid: false,
    };
  }

  if (!canPlaceItemInSlot(sourceSlot.item, targetSlot)) {
    return {
      inventory,
      moved: false,
      reason: "invalid-target",
      valid: false,
    };
  }

  if (targetSlot.item) {
    const merged = mergeStacks(sourceSlot.item, targetSlot.item);

    if (merged.target.quantity !== targetSlot.item.quantity) {
      return {
        inventory: updateSlots(inventory, [
          { reference: from, item: merged.source },
          { reference: to, item: merged.target },
        ]),
        moved: true,
        valid: true,
      };
    }

    if (canMergeItems(sourceSlot.item, targetSlot.item)) {
      return {
        inventory,
        moved: false,
        reason: "full-stack",
        valid: false,
      };
    }

    if (!canPlaceItemInSlot(targetSlot.item, sourceSlot)) {
      return {
        inventory,
        moved: false,
        reason: "invalid-swap",
        valid: false,
      };
    }

    // Non-mergeable occupied slots become a replacement, returning the old item.
    return {
      inventory: updateSlots(inventory, [
        { reference: from, item: targetSlot.item },
        { reference: to, item: sourceSlot.item },
      ]),
      moved: true,
      valid: true,
    };
  }

  return {
    inventory: updateSlots(inventory, [
      { reference: from, item: null },
      { reference: to, item: sourceSlot.item },
    ]),
    moved: true,
    valid: true,
  };
}

/** Swaps two occupied or empty slots when both items are valid in their destinations. */
export function swapItems(
  inventory: InventoryCollections,
  first: SlotReference,
  second: SlotReference,
): InventoryCollections {
  if (isSameSlot(first, second)) {
    return inventory;
  }

  const firstSlot = findSlot(inventory, first);
  const secondSlot = findSlot(inventory, second);

  if (!firstSlot || !secondSlot) {
    return inventory;
  }

  if (
    !canPlaceItemInSlot(firstSlot.item, secondSlot) ||
    !canPlaceItemInSlot(secondSlot.item, firstSlot)
  ) {
    return inventory;
  }

  return updateSlots(inventory, [
    { reference: first, item: secondSlot.item },
    { reference: second, item: firstSlot.item },
  ]);
}

/** Finds the first equipment slot where the provided item can be equipped. */
export function findValidEquipmentSlot(
  item: InventoryItem | null,
  equipment: readonly EquipmentSlot[],
): EquipmentSlot | null {
  return equipment.find((slot) => canEquip(item, slot)) ?? null;
}

function canMergeStacks(
  source: InventoryItem,
  target: InventoryItem,
): boolean {
  return (
    canMergeItems(source, target) &&
    target.quantity < target.maxStack
  );
}

function canMergeItems(source: InventoryItem, target: InventoryItem): boolean {
  return (
    source.id === target.id &&
    source.maxStack > 1 &&
    target.maxStack > 1
  );
}

function canPlaceItemInSlot(
  item: InventoryItem | null,
  slot: AnyInventorySlot,
): boolean {
  if (!item) {
    return true;
  }

  return isEquipmentSlot(slot) ? canEquip(item, slot) : true;
}

function findSlot(
  inventory: InventoryCollections,
  reference: SlotReference,
): AnyInventorySlot | undefined {
  return inventory[reference.container].find((slot) => slot.id === reference.slotId);
}

function getItemStackWeight(item: InventoryItem | null): number {
  return item ? item.weight * item.quantity : 0;
}

function isEquipmentSlot(slot: AnyInventorySlot): slot is EquipmentSlot {
  return "type" in slot;
}

function isSameSlot(first: SlotReference, second: SlotReference): boolean {
  return first.container === second.container && first.slotId === second.slotId;
}

function updateSlots(
  inventory: InventoryCollections,
  updates: readonly {
    reference: SlotReference;
    item: InventoryItem | null;
  }[],
): InventoryCollections {
  return {
    backpack: updateContainer(inventory.backpack, "backpack", updates),
    equipment: updateContainer(inventory.equipment, "equipment", updates),
    hotbar: updateContainer(inventory.hotbar, "hotbar", updates),
  };
}

function updateContainer<TSlot extends AnyInventorySlot>(
  slots: readonly TSlot[],
  container: InventoryContainer,
  updates: readonly {
    reference: SlotReference;
    item: InventoryItem | null;
  }[],
): readonly TSlot[] {
  return slots.map((slot) => {
    const update = updates.find(
      (candidate) =>
        candidate.reference.container === container &&
        candidate.reference.slotId === slot.id,
    );

    return update ? ({ ...slot, item: update.item } as TSlot) : slot;
  });
}
