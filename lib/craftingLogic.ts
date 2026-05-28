import type { CraftingIngredient, CraftingRecipe } from "@/types/crafting";
import type { BackpackSlot, InventoryItem, UUID } from "@/types/inventory";
import type { InventoryCollections } from "@/lib/inventoryLogic";

export type CraftFailureReason =
  | "invalid-recipe"
  | "missing-ingredients"
  | "no-space";

export interface CraftItemResult {
  crafted: boolean;
  inventory: InventoryCollections;
  reason?: CraftFailureReason;
}

interface IngredientRemoval {
  quantity: number;
  slotId: UUID;
}

/** Crafts one recipe from backpack material stacks without mutating inventory. */
export function craftItem(
  inventory: InventoryCollections,
  recipe: CraftingRecipe,
  resultItemId: UUID,
): CraftItemResult {
  if (!isValidRecipe(recipe)) {
    return {
      crafted: false,
      inventory,
      reason: "invalid-recipe",
    };
  }

  const removals = collectIngredientRemovals(
    inventory.backpack,
    recipe.ingredients,
  );

  if (!removals) {
    return {
      crafted: false,
      inventory,
      reason: "missing-ingredients",
    };
  }

  const backpackAfterRemoval = removeIngredients(inventory.backpack, removals);
  const resultItem = createCraftedResult(recipe.result, resultItemId);
  const backpackWithResult = addItemToBackpack(backpackAfterRemoval, resultItem);

  if (!backpackWithResult) {
    return {
      crafted: false,
      inventory,
      reason: "no-space",
    };
  }

  return {
    crafted: true,
    inventory: {
      ...inventory,
      backpack: backpackWithResult,
    },
  };
}

function isValidRecipe(recipe: CraftingRecipe): boolean {
  return (
    recipe.ingredients.length > 0 &&
    recipe.ingredients.every(
      (ingredient) =>
        Number.isInteger(ingredient.quantity) && ingredient.quantity > 0,
    ) &&
    Number.isInteger(recipe.result.quantity) &&
    recipe.result.quantity > 0 &&
    recipe.result.quantity <= recipe.result.maxStack
  );
}

function collectIngredientRemovals(
  backpack: readonly BackpackSlot[],
  ingredients: readonly CraftingIngredient[],
): IngredientRemoval[] | null {
  const removals: IngredientRemoval[] = [];

  for (const ingredient of combineIngredients(ingredients)) {
    let remainingQuantity = ingredient.quantity;

    for (const slot of backpack) {
      if (remainingQuantity === 0) {
        break;
      }

      if (!isMatchingMaterial(slot.item, ingredient.templateId)) {
        continue;
      }

      const quantityToRemove = Math.min(slot.item.quantity, remainingQuantity);

      removals.push({
        quantity: quantityToRemove,
        slotId: slot.id,
      });
      remainingQuantity -= quantityToRemove;
    }

    if (remainingQuantity > 0) {
      return null;
    }
  }

  return removals;
}

function removeIngredients(
  backpack: readonly BackpackSlot[],
  removals: readonly IngredientRemoval[],
): readonly BackpackSlot[] {
  return backpack.map((slot) => {
    if (!slot.item) {
      return slot;
    }

    const quantityToRemove = removals
      .filter((removal) => removal.slotId === slot.id)
      .reduce((total, removal) => total + removal.quantity, 0);

    if (quantityToRemove === 0) {
      return slot;
    }

    const remainingQuantity = slot.item.quantity - quantityToRemove;

    return {
      ...slot,
      item:
        remainingQuantity > 0
          ? { ...slot.item, quantity: remainingQuantity }
          : null,
    };
  });
}

function addItemToBackpack(
  backpack: readonly BackpackSlot[],
  item: InventoryItem,
): readonly BackpackSlot[] | null {
  const mergedBackpack = mergeIntoExistingStacks(backpack, item);
  const remainingQuantity = getRemainingQuantity(item, backpack, mergedBackpack);

  if (remainingQuantity === 0) {
    return mergedBackpack;
  }

  const emptySlot = mergedBackpack.find((slot) => slot.item === null);

  if (!emptySlot) {
    return null;
  }

  return mergedBackpack.map((slot) =>
    slot.id === emptySlot.id
      ? {
          ...slot,
          item: {
            ...item,
            quantity: remainingQuantity,
          },
        }
      : slot,
  );
}

function mergeIntoExistingStacks(
  backpack: readonly BackpackSlot[],
  item: InventoryItem,
): readonly BackpackSlot[] {
  if (item.maxStack <= 1) {
    return backpack;
  }

  let remainingQuantity = item.quantity;

  return backpack.map((slot) => {
    if (
      remainingQuantity === 0 ||
      !slot.item ||
      !canReceiveStack(item, slot.item)
    ) {
      return slot;
    }

    const availableSpace = slot.item.maxStack - slot.item.quantity;
    const quantityToAdd = Math.min(availableSpace, remainingQuantity);

    if (quantityToAdd === 0) {
      return slot;
    }

    remainingQuantity -= quantityToAdd;

    return {
      ...slot,
      item: {
        ...slot.item,
        quantity: slot.item.quantity + quantityToAdd,
      },
    };
  });
}

function getRemainingQuantity(
  originalItem: InventoryItem,
  before: readonly BackpackSlot[],
  after: readonly BackpackSlot[],
): number {
  const beforeQuantity = countMatchingQuantity(before, originalItem);
  const afterQuantity = countMatchingQuantity(after, originalItem);

  return originalItem.quantity - (afterQuantity - beforeQuantity);
}

function countMatchingQuantity(
  backpack: readonly BackpackSlot[],
  item: InventoryItem,
): number {
  return backpack.reduce((total, slot) => {
    return isSameStackableItem(item, slot.item)
      ? total + (slot.item?.quantity ?? 0)
      : total;
  }, 0);
}

function createCraftedResult(item: InventoryItem, id: UUID): InventoryItem {
  return {
    ...item,
    id,
    templateId: getTemplateId(item),
  };
}

function isMatchingMaterial(
  item: InventoryItem | null,
  templateId: UUID,
): item is InventoryItem {
  return item?.type === "material" && getTemplateId(item) === templateId;
}

function canReceiveStack(
  first: InventoryItem,
  second: InventoryItem | null,
): second is InventoryItem {
  return (
    isSameStackableItem(first, second) &&
    second.quantity < second.maxStack
  );
}

function isSameStackableItem(
  first: InventoryItem,
  second: InventoryItem | null,
): second is InventoryItem {
  return (
    second !== null &&
    getTemplateId(first) === getTemplateId(second) &&
    first.maxStack > 1 &&
    second.maxStack > 1
  );
}

function combineIngredients(
  ingredients: readonly CraftingIngredient[],
): CraftingIngredient[] {
  return ingredients.reduce<CraftingIngredient[]>((combined, ingredient) => {
    const existing = combined.find(
      (candidate) => candidate.templateId === ingredient.templateId,
    );

    if (existing) {
      return combined.map((candidate) =>
        candidate.templateId === ingredient.templateId
          ? {
              ...candidate,
              quantity: candidate.quantity + ingredient.quantity,
            }
          : candidate,
      );
    }

    return [...combined, ingredient];
  }, []);
}

function getTemplateId(item: InventoryItem): UUID {
  return item.templateId ?? item.id;
}
