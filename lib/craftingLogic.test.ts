import { describe, expect, it } from "vitest";
import { craftingRecipes } from "@/lib/craftingRecipes";
import { itemTemplates } from "@/lib/itemFixtures";
import type { BackpackSlot, InventoryItem } from "@/types/inventory";
import { craftItem } from "./craftingLogic";
import type { InventoryCollections } from "./inventoryLogic";

const ironSwordRecipe = craftingRecipes[0];

const makeItem = (
  template: InventoryItem,
  overrides: Partial<InventoryItem> = {},
): InventoryItem => ({
  ...template,
  id: overrides.id ?? template.id,
  templateId: template.templateId ?? template.id,
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

const makeInventory = (
  backpack: readonly BackpackSlot[],
): InventoryCollections => ({
  backpack,
  equipment: [],
  hotbar: [],
});

describe("craftingLogic", () => {
  it("removes material ingredients and adds the crafted result", () => {
    const ore = makeItem(itemTemplates.ironOre, { quantity: 4 });
    const wood = makeItem(itemTemplates.wood, { quantity: 2 });
    const inventory = makeInventory([
      makeBackpackSlot("slot-1", 0, ore),
      makeBackpackSlot("slot-2", 1, wood),
      makeBackpackSlot("slot-3", 2, null),
    ]);

    const result = craftItem(
      inventory,
      ironSwordRecipe,
      "10000000-0000-4000-8000-000000000101",
    );

    expect(result.crafted).toBe(true);
    expect(result.inventory.backpack[0].item?.quantity).toBe(2);
    expect(result.inventory.backpack[1].item?.quantity).toBe(1);
    expect(result.inventory.backpack[2].item?.name).toBe("Iron Sword");
    expect(inventory.backpack[0].item?.quantity).toBe(4);
  });

  it("can consume ingredients across multiple material stacks", () => {
    const firstOre = makeItem(itemTemplates.ironOre, {
      id: "10000000-0000-4000-8000-000000000102",
      quantity: 1,
    });
    const secondOre = makeItem(itemTemplates.ironOre, {
      id: "10000000-0000-4000-8000-000000000103",
      quantity: 1,
    });
    const wood = makeItem(itemTemplates.wood, { quantity: 1 });
    const inventory = makeInventory([
      makeBackpackSlot("slot-1", 0, firstOre),
      makeBackpackSlot("slot-2", 1, secondOre),
      makeBackpackSlot("slot-3", 2, wood),
      makeBackpackSlot("slot-4", 3, null),
    ]);

    const result = craftItem(
      inventory,
      ironSwordRecipe,
      "10000000-0000-4000-8000-000000000104",
    );

    expect(result.crafted).toBe(true);
    expect(result.inventory.backpack[0].item?.name).toBe("Iron Sword");
    expect(result.inventory.backpack[1].item).toBeNull();
    expect(result.inventory.backpack[2].item).toBeNull();
    expect(result.inventory.backpack[3].item).toBeNull();
  });

  it("does not change inventory when ingredients are missing", () => {
    const ore = makeItem(itemTemplates.ironOre, { quantity: 1 });
    const inventory = makeInventory([
      makeBackpackSlot("slot-1", 0, ore),
      makeBackpackSlot("slot-2", 1, null),
    ]);

    const result = craftItem(
      inventory,
      ironSwordRecipe,
      "10000000-0000-4000-8000-000000000105",
    );

    expect(result.crafted).toBe(false);
    expect(result.reason).toBe("missing-ingredients");
    expect(result.inventory).toBe(inventory);
  });

  it("does not remove ingredients when the crafted result has no slot", () => {
    const ore = makeItem(itemTemplates.ironOre, { quantity: 4 });
    const wood = makeItem(itemTemplates.wood, { quantity: 2 });
    const inventory = makeInventory([
      makeBackpackSlot("slot-1", 0, ore),
      makeBackpackSlot("slot-2", 1, wood),
    ]);

    const result = craftItem(
      inventory,
      ironSwordRecipe,
      "10000000-0000-4000-8000-000000000106",
    );

    expect(result.crafted).toBe(false);
    expect(result.reason).toBe("no-space");
    expect(result.inventory).toBe(inventory);
    expect(inventory.backpack[0].item?.quantity).toBe(4);
    expect(inventory.backpack[1].item?.quantity).toBe(2);
  });
});
