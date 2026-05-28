import type { InventoryItem, UUID } from "@/types/inventory";

/** Ingredient requirement matched by item template identity, not stack instance id. */
export interface CraftingIngredient {
  label: string;
  templateId: UUID;
  quantity: number;
}

/** Recipe definition for combining material stacks into one crafted result. */
export interface CraftingRecipe {
  id: UUID;
  name: string;
  ingredients: readonly CraftingIngredient[];
  result: InventoryItem;
}
