import { create } from "zustand";
import {
  starterBackpack,
  starterEquipment,
  starterHotbar,
} from "@/lib/itemFixtures";
import {
  canEquip,
  findValidEquipmentSlot,
  moveItem as moveInventoryItem,
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

export interface InventoryStoreState extends InventoryCollections {
  draggedItem: DraggedItemMetadata | null;
  rejectedSlot: RejectionAnimationState | null;
  contextMenu: ContextMenuState | null;
  tooltip: TooltipState | null;
  moveItem: (from: SlotPointer, to: SlotPointer) => boolean;
  equipItem: (from: SlotPointer, preferredSlotId?: UUID) => void;
  unequipItem: (equipmentSlotId: UUID, targetBackpackSlotId?: UUID) => void;
  splitStack: (
    source: SlotPointer,
    amount: number,
    target?: SlotPointer,
  ) => void;
  removeItem: (slot: SlotPointer) => void;
  openContextMenu: (
    slot: SlotPointer,
    position: { x: number; y: number },
  ) => void;
  closeContextMenu: () => void;
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
  draggedItem: null,
  rejectedSlot: null,
  contextMenu: null,
  tooltip: null,
  moveItem: (from, to) => {
    const result = moveItemWithResult(getInventoryCollections(get()), from, to);

    if (result.moved) {
      set({ ...result.inventory });
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

      return {
        ...moveInventoryItem(getInventoryCollections(state), from, {
          container: "equipment",
          slotId: targetSlot.id,
        }),
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

      return {
        ...moveInventoryItem(
          getInventoryCollections(state),
          { container: "equipment", slotId: equipmentSlot.id },
          { container: "backpack", slotId: targetBackpackSlot.id },
        ),
      };
    }),
  splitStack: (source, amount, target) =>
    set((state) => {
      const sourceSlot = findSlot(state, source);
      const targetSlot = target
        ? findSlot(state, target)
        : state.backpack.find((slot) => slot.item === null);

      if (!sourceSlot?.item || !targetSlot || targetSlot.item) {
        return {};
      }

      if (isEquipmentSlot(targetSlot) && !canEquip(sourceSlot.item, targetSlot)) {
        return {};
      }

      const splitResult = splitInventoryStack(sourceSlot.item, amount);

      if (!splitResult) {
        return {};
      }

      const targetSlotPointer: SlotPointer = target ?? {
        container: "backpack",
        slotId: targetSlot.id,
      };

      return {
        ...updateSlots(state, [
          { slot: source, item: splitResult.remaining },
          { slot: targetSlotPointer, item: splitResult.split },
        ]),
      };
    }),
  removeItem: (slot) =>
    set((state) => ({
      ...updateSlots(state, [{ slot, item: null }]),
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
      };
    }),
  closeContextMenu: () => set({ contextMenu: null }),
  setRejectedSlot: (slot, reason) =>
    set({
      rejectedSlot: {
        slot,
        reason,
      },
    }),
  clearRejectedSlot: () => set({ rejectedSlot: null }),
  setDraggedItem: (metadata) => set({ draggedItem: metadata }),
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
