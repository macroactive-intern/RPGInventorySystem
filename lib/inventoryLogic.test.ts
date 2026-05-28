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
  moveItemWithResult,
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

  it("merges separate stack instances that share an item template", () => {
    const templateId = "10000000-0000-4000-8000-000000000019";
    const source = makeItem({
      id: "10000000-0000-4000-8000-000000000020",
      templateId,
      name: "Minor Healing Potion",
      maxStack: 10,
      quantity: 4,
    });
    const target = makeItem({
      id: "10000000-0000-4000-8000-000000000021",
      templateId,
      name: "Minor Healing Potion",
      maxStack: 10,
      quantity: 3,
    });

    const result = mergeStacks(source, target);

    expect(result.source).toBeNull();
    expect(result.target.id).toBe(target.id);
    expect(result.target.quantity).toBe(7);
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

  it("splits a stack into a distinct stack instance", () => {
    const arrows = makeItem({
      id: "10000000-0000-4000-8000-000000000022",
      name: "Broadhead Arrows",
      maxStack: 20,
      quantity: 12,
    });
    const splitId = "10000000-0000-4000-8000-000000000023";

    const result = splitStack(arrows, 5, splitId);

    expect(result?.remaining.id).toBe(arrows.id);
    expect(result?.split.id).toBe(splitId);
    expect(result?.split.templateId).toBe(arrows.id);
    expect(result?.remaining.templateId).toBe(arrows.id);
  });

  it("rejects fractional stack splits", () => {
    const arrows = makeItem({
      id: "10000000-0000-4000-8000-000000000024",
      name: "Broadhead Arrows",
      maxStack: 20,
      quantity: 12,
    });

    expect(splitStack(arrows, 2.5)).toBeNull();
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

  it("rejects invalid equipment drops without changing inventory", () => {
    const potion = makeItem({
      id: "10000000-0000-4000-8000-000000000014",
      name: "Minor Healing Potion",
      type: "consumable",
      maxStack: 10,
      quantity: 2,
    });
    const backpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000004",
      0,
      potion,
    );
    const headSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000007",
      "head",
      null,
    );
    const inventory = makeInventory([backpackSlot], [headSlot]);

    const result = moveItemWithResult(
      inventory,
      { container: "backpack", slotId: backpackSlot.id },
      { container: "equipment", slotId: headSlot.id },
    );

    expect(result.valid).toBe(false);
    expect(result.moved).toBe(false);
    expect(result.inventory.backpack[0].item?.id).toBe(potion.id);
    expect(result.inventory.equipment[0].item).toBeNull();
  });

  it("swaps different backpack items without losing either item", () => {
    const ore = makeItem({
      id: "10000000-0000-4000-8000-000000000015",
      name: "Iron Ore",
      maxStack: 20,
      quantity: 3,
    });
    const pelt = makeItem({
      id: "10000000-0000-4000-8000-000000000016",
      name: "Cured Wolf Pelt",
      maxStack: 15,
      quantity: 2,
    });
    const firstBackpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000005",
      0,
      ore,
    );
    const secondBackpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000006",
      1,
      pelt,
    );
    const inventory = makeInventory([firstBackpackSlot, secondBackpackSlot], []);

    const result = moveItemWithResult(
      inventory,
      { container: "backpack", slotId: firstBackpackSlot.id },
      { container: "backpack", slotId: secondBackpackSlot.id },
    );

    expect(result.valid).toBe(true);
    expect(result.moved).toBe(true);
    expect(result.inventory.backpack[0].item?.id).toBe(pelt.id);
    expect(result.inventory.backpack[1].item?.id).toBe(ore.id);
  });

  it("allows unequipping to an empty backpack slot", () => {
    const helmet = makeItem({
      id: "10000000-0000-4000-8000-000000000017",
      name: "Iron Helm",
      type: "armor",
      allowedSlots: ["head"],
    });
    const backpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000007",
      0,
      null,
    );
    const headSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000008",
      "head",
      helmet,
    );
    const inventory = makeInventory([backpackSlot], [headSlot]);

    const result = moveItemWithResult(
      inventory,
      { container: "equipment", slotId: headSlot.id },
      { container: "backpack", slotId: backpackSlot.id },
    );

    expect(result.valid).toBe(true);
    expect(result.moved).toBe(true);
    expect(result.inventory.equipment[0].item).toBeNull();
    expect(result.inventory.backpack[0].item?.id).toBe(helmet.id);
  });

  it("rejects full stack merges without changing quantities", () => {
    const source = makeItem({
      id: "10000000-0000-4000-8000-000000000018",
      name: "Iron Ore",
      maxStack: 10,
      quantity: 4,
    });
    const target = makeItem({
      id: source.id,
      name: "Iron Ore",
      maxStack: 10,
      quantity: 10,
    });
    const sourceSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000008",
      0,
      source,
    );
    const targetSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000009",
      1,
      target,
    );
    const inventory = makeInventory([sourceSlot, targetSlot], []);

    const result = moveItemWithResult(
      inventory,
      { container: "backpack", slotId: sourceSlot.id },
      { container: "backpack", slotId: targetSlot.id },
    );

    expect(result.valid).toBe(false);
    expect(result.moved).toBe(false);
    expect(result.inventory.backpack[0].item?.quantity).toBe(source.quantity);
    expect(result.inventory.backpack[1].item?.quantity).toBe(target.quantity);
  });

  it("rejects unequipping into a full incompatible backpack slot without loss", () => {
    const helmet = makeItem({
      id: "10000000-0000-4000-8000-000000000025",
      name: "Iron Helm",
      type: "armor",
      allowedSlots: ["head"],
    });
    const potion = makeItem({
      id: "10000000-0000-4000-8000-000000000026",
      name: "Minor Healing Potion",
      type: "consumable",
      maxStack: 10,
      quantity: 2,
    });
    const backpackSlot = makeBackpackSlot(
      "30000000-0000-4000-8000-000000000010",
      0,
      potion,
    );
    const headSlot = makeEquipmentSlot(
      "20000000-0000-4000-8000-000000000009",
      "head",
      helmet,
    );
    const inventory = makeInventory([backpackSlot], [headSlot]);

    const result = moveItemWithResult(
      inventory,
      { container: "equipment", slotId: headSlot.id },
      { container: "backpack", slotId: backpackSlot.id },
    );

    expect(result.valid).toBe(false);
    expect(result.moved).toBe(false);
    expect(result.inventory.equipment[0].item?.id).toBe(helmet.id);
    expect(result.inventory.backpack[0].item?.id).toBe(potion.id);
  });
});
