import { describe, expect, it } from "vitest";
import type {
  BackpackSlot,
  EquipmentSlot,
  HotbarSlot,
  InventoryItem,
} from "@/types/inventory";
import {
  calculateWeight,
  canEquip,
  mergeStacks,
  moveItem,
  splitStack,
  swapItems,
  type InventoryCollections,
} from "./inventoryLogic";

const makeItem = (
  overrides: Partial<InventoryItem> = {},
): InventoryItem => ({
  id: "10000000-0000-4000-8000-000000000001",
  name: "Test Item",
  type: "material",
  rarity: "common",
  stats: {},
  weight: 1,
  maxStack: 1,
  quantity: 1,
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

const makeInventory = (
  backpack: readonly BackpackSlot[],
  equipment: readonly EquipmentSlot[],
  hotbar: readonly HotbarSlot[] = [],
): InventoryCollections => ({
  backpack,
  equipment,
  hotbar,
});

describe("inventoryLogic", () => {
  it("allows a valid item to be equipped in a matching slot", () => {
    const helmet = makeItem({
      id: "10000000-0000-4000-8000-000000000002",
      name: "Iron Helm",
      type: "armor",
      allowedSlots: ["head"],
    });
    const headSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000001",
      "head",
      null,
    );

    expect(canEquip(helmet, headSlot)).toBe(true);
  });

  it("rejects an invalid item for an equipment slot", () => {
    const potion = makeItem({
      id: "10000000-0000-4000-8000-000000000003",
      name: "Healing Potion",
      type: "consumable",
      maxStack: 10,
      quantity: 1,
    });
    const headSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000002",
      "head",
      null,
    );

    expect(canEquip(potion, headSlot)).toBe(false);
  });

  it("merges compatible stacks successfully", () => {
    const source = makeItem({
      id: "10000000-0000-4000-8000-000000000004",
      name: "Iron Ore",
      maxStack: 10,
      quantity: 4,
    });
    const target = makeItem({
      id: source.id,
      name: "Iron Ore",
      maxStack: 10,
      quantity: 3,
    });

    const result = mergeStacks(source, target);

    expect(result.source).toBeNull();
    expect(result.target.quantity).toBe(7);
  });

  it("merges stacks with overflow left in the source stack", () => {
    const source = makeItem({
      id: "10000000-0000-4000-8000-000000000005",
      name: "Moonlit Thread",
      maxStack: 10,
      quantity: 8,
    });
    const target = makeItem({
      id: source.id,
      name: "Moonlit Thread",
      maxStack: 10,
      quantity: 7,
    });

    const result = mergeStacks(source, target);

    expect(result.source?.quantity).toBe(5);
    expect(result.target.quantity).toBe(10);
    expect((result.source?.quantity ?? 0) + result.target.quantity).toBe(15);
  });

  it("splits a stack while preserving total quantity", () => {
    const arrows = makeItem({
      id: "10000000-0000-4000-8000-000000000006",
      name: "Broadhead Arrows",
      maxStack: 20,
      quantity: 12,
    });

    const result = splitStack(arrows, 5);

    expect(result?.split.quantity).toBe(5);
    expect(result?.remaining.quantity).toBe(7);
    expect((result?.split.quantity ?? 0) + (result?.remaining.quantity ?? 0)).toBe(
      arrows.quantity,
    );
  });

  it("calculates total backpack and equipment weight", () => {
    const potions = makeItem({
      id: "10000000-0000-4000-8000-000000000007",
      name: "Minor Healing Potion",
      weight: 0.3,
      maxStack: 10,
      quantity: 4,
    });
    const ore = makeItem({
      id: "10000000-0000-4000-8000-000000000008",
      name: "Iron Ore",
      weight: 2,
      maxStack: 20,
      quantity: 3,
    });
    const helmet = makeItem({
      id: "10000000-0000-4000-8000-000000000009",
      name: "Iron Helm",
      type: "armor",
      weight: 1.5,
      allowedSlots: ["head"],
    });

    const backpack = [
      makeBackpackSlot("30000000-0000-4000-8000-000000000001", 0, potions),
      makeBackpackSlot("30000000-0000-4000-8000-000000000002", 1, ore),
    ];
    const equipment = [
      makeEquipmentSlot("20000000-0000-4000-8000-000000000003", "head", helmet),
    ];

    expect(calculateWeight(backpack, equipment)).toBeCloseTo(8.7);
  });

  it("swaps equipped items when both destination slots are valid", () => {
    const rubyRing = makeItem({
      id: "10000000-0000-4000-8000-000000000010",
      name: "Ruby Ring",
      type: "accessory",
      allowedSlots: ["ring"],
    });
    const sapphireRing = makeItem({
      id: "10000000-0000-4000-8000-000000000011",
      name: "Sapphire Ring",
      type: "accessory",
      allowedSlots: ["ring"],
    });
    const firstRingSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000004",
      "ring",
      rubyRing,
    );
    const secondRingSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000005",
      "ring",
      sapphireRing,
    );
    const inventory = makeInventory([], [firstRingSlot, secondRingSlot]);

    const result = swapItems(
      inventory,
      { container: "equipment", slotId: firstRingSlot.id },
      { container: "equipment", slotId: secondRingSlot.id },
    );

    expect(result.equipment[0].item?.id).toBe(sapphireRing.id);
    expect(result.equipment[1].item?.id).toBe(rubyRing.id);
    expect(inventory.equipment[0].item?.id).toBe(rubyRing.id);
  });

  it("replaces equipment and returns the previous item to the source slot", () => {
    const oldHelmet = makeItem({
      id: "10000000-0000-4000-8000-000000000012",
      name: "Leather Cap",
      type: "armor",
      allowedSlots: ["head"],
    });
    const newHelmet = makeItem({
      id: "10000000-0000-4000-8000-000000000013",
      name: "Steel Helm",
      type: "armor",
      allowedSlots: ["head"],
    });
    const backpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000003",
      0,
      newHelmet,
    );
    const headSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000006",
      "head",
      oldHelmet,
    );
    const inventory = makeInventory([backpackSlot], [headSlot]);

    const result = moveItem(
      inventory,
      { container: "backpack", slotId: backpackSlot.id },
      { container: "equipment", slotId: headSlot.id },
    );

    expect(result.equipment[0].item?.id).toBe(newHelmet.id);
    expect(result.backpack[0].item?.id).toBe(oldHelmet.id);
    expect(inventory.equipment[0].item?.id).toBe(oldHelmet.id);
  });
});
