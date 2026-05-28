import { itemTemplates } from "@/lib/itemFixtures";
import type { CraftingRecipe } from "@/types/crafting";
import type { InventoryItem } from "@/types/inventory";

export const craftingRecipes: readonly CraftingRecipe[] = [
  {
    id: "0d7ba289-a0ab-40ee-9d7f-8fdc4228fa68",
    name: "Iron Sword",
    ingredients: [
      {
        templateId: getTemplateId(itemTemplates.ironOre),
        quantity: 2,
      },
      {
        templateId: getTemplateId(itemTemplates.wood),
        quantity: 1,
      },
    ],
    result: createRecipeResult(itemTemplates.ironSword),
  },
];

function createRecipeResult(item: InventoryItem): InventoryItem {
  return {
    ...item,
    templateId: getTemplateId(item),
    quantity: 1,
  };
}

function getTemplateId(item: InventoryItem): string {
  return item.templateId ?? item.id;
}
