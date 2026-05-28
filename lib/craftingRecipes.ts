import { itemTemplates } from "@/lib/itemFixtures";
import type { CraftingRecipe } from "@/types/crafting";
import type { InventoryItem } from "@/types/inventory";

export const craftingRecipes: readonly CraftingRecipe[] = [
  {
    id: "0d7ba289-a0ab-40ee-9d7f-8fdc4228fa68",
    name: "Iron Sword",
    ingredients: [
      {
        label: itemTemplates.ironOre.name,
        templateId: getTemplateId(itemTemplates.ironOre),
        quantity: 2,
      },
      {
        label: itemTemplates.wood.name,
        templateId: getTemplateId(itemTemplates.wood),
        quantity: 1,
      },
    ],
    result: createRecipeResult(itemTemplates.ironSword),
  },
  {
    id: "d06f5503-14e6-4ca3-aa93-ff86ff06f8ed",
    name: "Stitched Trail Backpack",
    ingredients: [
      {
        label: itemTemplates.wolfPelt.name,
        templateId: getTemplateId(itemTemplates.wolfPelt),
        quantity: 2,
      },
      {
        label: itemTemplates.moonlitThread.name,
        templateId: getTemplateId(itemTemplates.moonlitThread),
        quantity: 3,
      },
    ],
    result: createRecipeResult(itemTemplates.stitchedBackpack),
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
