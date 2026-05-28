import { beforeEach, describe, expect, it } from "vitest";
import { useInventoryStore } from "@/store/inventoryStore";
import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
} from "@/types/inventory";

const makeItem = (
  overrides: Partial<InventoryItem> = {},
): InventoryItem => ({
  id: "10000000-0000-4000-8000-000000000001",
  name: "Test Item",
  type: "accessory",
  rarity: "common",
  stats: {},
  weight: 0.1,
  maxStack: 1,
  quantity: 1,
  allowedSlots: ["ring"],
  ...overrides,
});

const makeBackpackSlot = (
  id: string,
  index: number,
  item: InventoryItem | null,
): BackpackSlot => ({
  id,
  index,
  item,
});

const makeEquipmentSlot = (
  id: string,
  type: EquipmentSlot["type"],
  item: InventoryItem | null,
): EquipmentSlot => ({
  id,
  type,
  item,
});

describe("inventoryStore", () => {
  beforeEach(() => {
    useInventoryStore.setState({
      backpack: [],
      contextMenu: null,
      draggedItem: null,
      equipment: [],
      hotbar: [] satisfies HotbarSlot[],
      inventorySearchQuery: "",
      itemInspectionModal: null,
      rejectedSlot: null,
      splitStackModal: null,
      tooltip: null,
    });
  });

  it("equips into an empty compatible slot before replacing existing gear", () => {
    const equippedRing = makeItem({
      id: "10000000-0000-4000-8000-000000000101",
      name: "Garnet Ring",
    });
    const backpackRing = makeItem({
      id: "10000000-0000-4000-8000-000000000102",
      name: "Sapphire Ring",
    });
    const backpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000101",
      0,
      backpackRing,
    );
    const occupiedRingSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000101",
      "ring",
      equippedRing,
    );
    const emptyRingSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000102",
      "ring",
      null,
    );

    useInventoryStore.setState({
      backpack: [backpackSlot],
      equipment: [occupiedRingSlot, emptyRingSlot],
    });

    useInventoryStore.getState().equipItem({
      container: "backpack",
      slotId: backpackSlot.id,
    });

    const state = useInventoryStore.getState();

    expect(state.backpack[0].item).toBeNull();
    expect(state.equipment[0].item?.id).toBe(equippedRing.id);
    expect(state.equipment[1].item?.id).toBe(backpackRing.id);
  });
});
