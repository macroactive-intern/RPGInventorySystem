import { create } from "zustand";
import { craftItem as craftInventoryItem } from "@/lib/craftingLogic";
import { craftingRecipes } from "@/lib/craftingRecipes";
import {
  starterBackpack,
  starterEquipment,
  starterHotbar,
} from "@/lib/itemFixtures";
import {
  canEquip,
  findValidEquipmentSlot,
  moveItemWithResult,
  splitStack as splitInventoryStack,
  type InventoryCollections,
  type InventoryContainer,
  type SlotReference,
} from "@/lib/inventoryLogic";
import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
  UUID,
} from "@/types/inventory";
import type { CraftingRecipe } from "@/types/crafting";

type InventorySlot = BackpackSlot | EquipmentSlot | HotbarSlot;

export type SlotPointer = SlotReference;

export interface DraggedItemMetadata {
  item: InventoryItem;
  source: SlotPointer;
}

export interface RejectionAnimationState {
  slot: SlotPointer;
  reason?: string;
}

export interface ContextMenuState {
  item: InventoryItem;
  slot: SlotPointer;
  x: number;
  y: number;
}

export interface TooltipState {
  item: InventoryItem;
  slot?: SlotPointer;
  x: number;
  y: number;
}

export interface SplitStackModalState {
  item: InventoryItem;
  slot: SlotPointer;
}

export interface ItemInspectionModalState {
  item: InventoryItem;
  slot: SlotPointer;
}

export interface InventoryStoreState extends InventoryCollections {
  craftingRecipes: readonly CraftingRecipe[];
  draggedItem: DraggedItemMetadata | null;
  rejectedSlot: RejectionAnimationState | null;
  contextMenu: ContextMenuState | null;
  itemInspectionModal: ItemInspectionModalState | null;
  inventorySearchQuery: string;
  splitStackModal: SplitStackModalState | null;
  tooltip: TooltipState | null;
  moveItem: (from: SlotPointer, to: SlotPointer) => boolean;
  equipItem: (from: SlotPointer, preferredSlotId?: UUID) => void;
  unequipItem: (equipmentSlotId: UUID, targetBackpackSlotId?: UUID) => void;
  craftItem: (recipeId: UUID) => boolean;
  splitStack: (
    source: SlotPointer,
    amount: number,
    target?: SlotPointer,
  ) => boolean;
  removeItem: (slot: SlotPointer) => void;
  openContextMenu: (
    slot: SlotPointer,
    position: { x: number; y: number },
  ) => void;
  closeContextMenu: () => void;
  openItemInspectionModal: (slot: SlotPointer) => void;
  closeItemInspectionModal: () => void;
  openSplitStackModal: (slot: SlotPointer) => void;
  closeSplitStackModal: () => void;
  setInventorySearchQuery: (query: string) => void;
  setRejectedSlot: (slot: SlotPointer, reason?: string) => void;
  clearRejectedSlot: () => void;
  setDraggedItem: (metadata: DraggedItemMetadata | null) => void;
  setTooltip: (tooltip: TooltipState | null) => void;
}

const initialInventory = (): InventoryCollections => ({
  backpack: cloneSlots(starterBackpack),
  equipment: cloneSlots(starterEquipment),
  hotbar: cloneSlots(starterHotbar),
});

export const useInventoryStore = create<InventoryStoreState>((set, get) => ({
  ...initialInventory(),
  craftingRecipes,
  draggedItem: null,
  rejectedSlot: null,
  contextMenu: null,
  itemInspectionModal: null,
  inventorySearchQuery: "",
  splitStackModal: null,
  tooltip: null,
  moveItem: (from, to) => {
    const result = moveItemWithResult(getInventoryCollections(get()), from, to);

    if (result.moved) {
      set({
        ...result.inventory,
        contextMenu: null,
        draggedItem: null,
        tooltip: null,
      });
    }

    return result.valid;
  },
  equipItem: (from, preferredSlotId) =>
    set((state) => {
      const sourceSlot = findSlot(state, from);

      if (!sourceSlot?.item) {
        return {};
      }

      const preferredSlot = preferredSlotId
        ? state.equipment.find((slot) => slot.id === preferredSlotId)
        : null;
      const targetSlot =
        preferredSlot && findValidEquipmentSlot(sourceSlot.item, [preferredSlot])
          ? preferredSlot
          : findValidEquipmentSlot(sourceSlot.item, state.equipment);

      if (!targetSlot) {
        return {};
      }

      const result = moveItemWithResult(getInventoryCollections(state), from, {
        container: "equipment",
        slotId: targetSlot.id,
      });

      if (!result.moved) {
        return {};
      }

      return {
        ...result.inventory,
        contextMenu: null,
        tooltip: null,
      };
    }),
  unequipItem: (equipmentSlotId, targetBackpackSlotId) =>
    set((state) => {
      const equipmentSlot = state.equipment.find(
        (slot) => slot.id === equipmentSlotId,
      );
      const targetBackpackSlot = targetBackpackSlotId
        ? state.backpack.find((slot) => slot.id === targetBackpackSlotId)
        : state.backpack.find((slot) => slot.item === null);

      if (!equipmentSlot?.item || !targetBackpackSlot) {
        return {};
      }

      const result = moveItemWithResult(
        getInventoryCollections(state),
        { container: "equipment", slotId: equipmentSlot.id },
        { container: "backpack", slotId: targetBackpackSlot.id },
      );

      if (!result.moved) {
        return {};
      }

      return {
        ...result.inventory,
        contextMenu: null,
        tooltip: null,
      };
    }),
  craftItem: (recipeId) => {
    const state = get();
    const recipe = state.craftingRecipes.find(
      (candidate) => candidate.id === recipeId,
    );

    if (!recipe) {
      return false;
    }

    const result = craftInventoryItem(
      getInventoryCollections(state),
      recipe,
      createRuntimeUuid(),
    );

    if (!result.crafted) {
      return false;
    }

    set({
      ...result.inventory,
      contextMenu: null,
      itemInspectionModal: null,
      splitStackModal: null,
      tooltip: null,
    });

    return true;
  },
  splitStack: (source, amount, target) => {
    const state = get();
    const sourceSlot = findSlot(state, source);
    const targetSlot = target
      ? findSlot(state, target)
      : state.backpack.find((slot) => slot.item === null);

    if (!sourceSlot?.item || !targetSlot || targetSlot.item) {
      return false;
    }

    if (isEquipmentSlot(targetSlot) && !canEquip(sourceSlot.item, targetSlot)) {
      return false;
    }

    const splitResult = splitInventoryStack(
      sourceSlot.item,
      amount,
      createRuntimeUuid(),
    );

    if (!splitResult) {
      return false;
    }

    const targetSlotPointer: SlotPointer = target ?? {
      container: "backpack",
      slotId: targetSlot.id,
    };

    set({
      ...updateSlots(state, [
        { slot: source, item: splitResult.remaining },
        { slot: targetSlotPointer, item: splitResult.split },
      ]),
      contextMenu: null,
      splitStackModal: null,
      tooltip: null,
    });

    return true;
  },
  removeItem: (slot) =>
    set((state) => ({
      ...updateSlots(state, [{ slot, item: null }]),
      contextMenu: null,
      itemInspectionModal: null,
      splitStackModal: null,
      tooltip: null,
    })),
  openContextMenu: (slot, position) =>
    set((state) => {
      const targetSlot = findSlot(state, slot);

      if (!targetSlot?.item) {
        return { contextMenu: null };
      }

      return {
        contextMenu: {
          item: targetSlot.item,
          slot,
          x: position.x,
          y: position.y,
        },
        tooltip: null,
      };
    }),
  closeContextMenu: () => set({ contextMenu: null }),
  openItemInspectionModal: (slot) =>
    set((state) => {
      const targetSlot = findSlot(state, slot);

      if (!targetSlot?.item) {
        return { itemInspectionModal: null };
      }

      return {
        itemInspectionModal: {
          item: targetSlot.item,
          slot,
        },
        tooltip: null,
      };
    }),
  closeItemInspectionModal: () => set({ itemInspectionModal: null }),
  openSplitStackModal: (slot) =>
    set((state) => {
      const targetSlot = findSlot(state, slot);

      if (!targetSlot?.item || targetSlot.item.quantity <= 1) {
        return { splitStackModal: null };
      }

      return {
        splitStackModal: {
          item: targetSlot.item,
          slot,
        },
        tooltip: null,
      };
    }),
  closeSplitStackModal: () => set({ splitStackModal: null }),
  setInventorySearchQuery: (query) => set({ inventorySearchQuery: query }),
  setRejectedSlot: (slot, reason) =>
    set({
      rejectedSlot: {
        slot,
        reason,
      },
    }),
  clearRejectedSlot: () => set({ rejectedSlot: null }),
  setDraggedItem: (metadata) =>
    set(
      metadata
        ? {
            contextMenu: null,
            draggedItem: metadata,
            tooltip: null,
          }
        : { draggedItem: null },
    ),
  setTooltip: (tooltip) => set({ tooltip }),
}));

function cloneSlots<TSlot extends InventorySlot>(slots: readonly TSlot[]): TSlot[] {
  return slots.map((slot) => ({
    ...slot,
    item: slot.item ? { ...slot.item } : null,
  }));
}

function getInventoryCollections(
  state: InventoryStoreState,
): InventoryCollections {
  return {
    backpack: state.backpack,
    equipment: state.equipment,
    hotbar: state.hotbar,
  };
}

function findSlot(
  inventory: InventoryCollections,
  slot: SlotPointer,
): InventorySlot | undefined {
  return inventory[slot.container].find((candidate) => candidate.id === slot.slotId);
}

function isEquipmentSlot(slot: InventorySlot): slot is EquipmentSlot {
  return "type" in slot;
}

function createRuntimeUuid(): UUID {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomTail = Math.floor(Math.random() * 0xffffffffffff)
    .toString(16)
    .padStart(12, "0")
    .slice(0, 12);

  return `10000000-0000-4000-8000-${randomTail}`;
}

function updateSlots(
  inventory: InventoryCollections,
  updates: readonly {
    slot: SlotPointer;
    item: InventoryItem | null;
  }[],
): InventoryCollections {
  return {
    backpack: updateContainer(inventory.backpack, "backpack", updates),
    equipment: updateContainer(inventory.equipment, "equipment", updates),
    hotbar: updateContainer(inventory.hotbar, "hotbar", updates),
  };
}

function updateContainer<TSlot extends InventorySlot>(
  slots: readonly TSlot[],
  container: InventoryContainer,
  updates: readonly {
    slot: SlotPointer;
    item: InventoryItem | null;
  }[],
): TSlot[] {
  return slots.map((slot) => {
    const update = updates.find(
      (candidate) =>
        candidate.slot.container === container && candidate.slot.slotId === slot.id,
    );

    return update ? ({ ...slot, item: update.item } as TSlot) : slot;
  });
}
