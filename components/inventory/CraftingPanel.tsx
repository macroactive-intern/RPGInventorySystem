"use client";

import { useMemo, useState } from "react";
import { getIconPlaceholder } from "@/lib/inventoryDisplay";
import { getTemplateId } from "@/lib/itemIdentity";
import { useInventoryStore } from "@/store/inventoryStore";
import type { CraftingIngredient, CraftingRecipe } from "@/types/crafting";
import type { BackpackSlot, InventoryItem } from "@/types/inventory";

interface MaterialOption {
  item: InventoryItem;
  label: string;
  templateId: string;
  quantity: number;
}

export function CraftingPanel() {
  const backpack = useInventoryStore((state) => state.backpack);
  const craftItem = useInventoryStore((state) => state.craftItem);
  const recipes = useInventoryStore((state) => state.craftingRecipes);
  const materialOptions = useMemo(() => getMaterialOptions(backpack), [backpack]);
  const ingredientCounts = useMemo(() => countIngredients(backpack), [backpack]);
  const [firstMaterialId, setFirstMaterialId] = useState("");
  const [secondMaterialId, setSecondMaterialId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const availableMaterialIds = new Set(
    materialOptions.map((option) => option.templateId),
  );
  const safeFirstMaterialId = availableMaterialIds.has(firstMaterialId)
    ? firstMaterialId
    : "";
  const safeSecondMaterialId = availableMaterialIds.has(secondMaterialId)
    ? secondMaterialId
    : "";
  const selectedRecipe = findRecipeForMaterials(
    recipes,
    safeFirstMaterialId,
    safeSecondMaterialId,
  );
  const canCraft = selectedRecipe
    ? hasRequiredIngredients(selectedRecipe, ingredientCounts)
    : false;

  function handleCraft() {
    if (!selectedRecipe) {
      setStatus("No matching recipe.");
      return;
    }

    const crafted = craftItem(selectedRecipe.id);

    setStatus(
      crafted
        ? `${selectedRecipe.result.name} crafted.`
        : `Could not craft ${selectedRecipe.result.name}.`,
    );
  }

  return (
    <section
      aria-labelledby="crafting-heading"
      className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white" id="crafting-heading">
          Crafting
        </h2>
        <p className="mt-1 text-sm text-slate-400">Combine two materials</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <MaterialBox
          label="Material 1"
          materialOptions={materialOptions}
          onChange={(value) => {
            setFirstMaterialId(value);
            setStatus(null);
          }}
          selectedTemplateId={safeFirstMaterialId}
        />
        <div
          aria-hidden="true"
          className="flex items-center justify-center text-lg font-bold text-slate-500"
        >
          +
        </div>
        <MaterialBox
          label="Material 2"
          materialOptions={materialOptions}
          onChange={(value) => {
            setSecondMaterialId(value);
            setStatus(null);
          }}
          selectedTemplateId={safeSecondMaterialId}
        />
      </div>

      <RecipePreview
        ingredientCounts={ingredientCounts}
        recipe={selectedRecipe}
        selectedCount={
          [safeFirstMaterialId, safeSecondMaterialId].filter(Boolean).length
        }
      />

      <button
        className="mt-3 w-full rounded-md bg-amber-400 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        disabled={!canCraft}
        onClick={handleCraft}
        type="button"
      >
        Craft
      </button>

      {status ? (
        <div
          className="mt-4 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          role="status"
        >
          {status}
        </div>
      ) : null}
    </section>
  );
}

interface MaterialBoxProps {
  label: string;
  materialOptions: readonly MaterialOption[];
  onChange: (value: string) => void;
  selectedTemplateId: string;
}

function MaterialBox({
  label,
  materialOptions,
  onChange,
  selectedTemplateId,
}: MaterialBoxProps) {
  const selectedMaterial =
    materialOptions.find((option) => option.templateId === selectedTemplateId) ??
    null;

  return (
    <label className="block rounded-md border border-slate-800 bg-slate-950 p-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-2 flex min-h-16 flex-col justify-between rounded border border-dashed border-slate-700 bg-slate-900 p-1.5 sm:min-h-20">
        <div className="flex min-h-8 flex-1 items-center justify-center rounded bg-slate-950 text-base font-bold text-slate-200">
          {selectedMaterial ? getIconPlaceholder(selectedMaterial.item) : "--"}
        </div>
        <div className="mt-1 text-center text-[0.65rem] text-slate-300">
          {selectedMaterial ? (
            <>
              <div className="truncate font-semibold text-white">
                {selectedMaterial.label}
              </div>
              <div className="mt-0.5 text-slate-500">
                x{selectedMaterial.quantity}
              </div>
            </>
          ) : (
            "Empty"
          )}
        </div>
      </div>
      <select
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none transition focus:border-amber-300"
        onChange={(event) => onChange(event.target.value)}
        value={selectedTemplateId}
      >
        <option value="">Choose</option>
        {materialOptions.map((option) => (
          <option key={option.templateId} value={option.templateId}>
            {option.label} x{option.quantity}
          </option>
        ))}
      </select>
    </label>
  );
}

interface RecipePreviewProps {
  ingredientCounts: ReadonlyMap<string, number>;
  recipe: CraftingRecipe | null;
  selectedCount: number;
}

function RecipePreview({
  ingredientCounts,
  recipe,
  selectedCount,
}: RecipePreviewProps) {
  if (!recipe) {
    return (
      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-500">
        {selectedCount === 2 ? "No matching recipe" : "Select two materials"}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-amber-400/40 bg-amber-950/20 px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-amber-300">
        Creates
      </div>
      <div className="mt-1 text-sm font-semibold text-white">
        {recipe.result.name}
      </div>
      <div className="mt-3 grid gap-2">
        {recipe.ingredients.map((ingredient) => (
          <IngredientRequirement
            ingredient={ingredient}
            key={ingredient.templateId}
            owned={ingredientCounts.get(ingredient.templateId) ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

interface IngredientRequirementProps {
  ingredient: CraftingIngredient;
  owned: number;
}

function IngredientRequirement({ ingredient, owned }: IngredientRequirementProps) {
  const hasEnough = owned >= ingredient.quantity;

  return (
    <div className="flex items-center justify-between gap-3 rounded bg-slate-950/70 px-2 py-1.5 text-xs">
      <span className="truncate text-slate-300">{ingredient.label}</span>
      <span className={hasEnough ? "font-semibold text-emerald-300" : "text-red-300"}>
        {owned} / {ingredient.quantity}
      </span>
    </div>
  );
}

function findRecipeForMaterials(
  recipes: readonly CraftingRecipe[],
  firstMaterialId: string,
  secondMaterialId: string,
): CraftingRecipe | null {
  if (!firstMaterialId || !secondMaterialId) {
    return null;
  }

  return (
    recipes.find((recipe) => {
      if (recipe.ingredients.length !== 2) {
        return false;
      }

      const recipeIds = recipe.ingredients
        .map((ingredient) => ingredient.templateId)
        .sort();
      const selectedIds = [firstMaterialId, secondMaterialId].sort();

      return recipeIds.every((templateId, index) => templateId === selectedIds[index]);
    }) ?? null
  );
}

function hasRequiredIngredients(
  recipe: CraftingRecipe,
  ingredientCounts: ReadonlyMap<string, number>,
): boolean {
  return recipe.ingredients.every(
    (ingredient) =>
      (ingredientCounts.get(ingredient.templateId) ?? 0) >= ingredient.quantity,
  );
}

function getMaterialOptions(backpack: readonly BackpackSlot[]): MaterialOption[] {
  const optionsByTemplateId = new Map<string, MaterialOption>();

  for (const slot of backpack) {
    if (slot.item?.type !== "material") {
      continue;
    }

    const templateId = getTemplateId(slot.item);
    const existing = optionsByTemplateId.get(templateId);

    if (existing) {
      optionsByTemplateId.set(templateId, {
        ...existing,
        quantity: existing.quantity + slot.item.quantity,
      });
      continue;
    }

    optionsByTemplateId.set(templateId, {
      item: slot.item,
      label: slot.item.name,
      quantity: slot.item.quantity,
      templateId,
    });
  }

  return [...optionsByTemplateId.values()].sort((first, second) =>
    first.label.localeCompare(second.label),
  );
}

function countIngredients(
  backpack: readonly BackpackSlot[],
): Map<string, number> {
  return backpack.reduce((counts, slot) => {
    if (slot.item?.type !== "material") {
      return counts;
    }

    const templateId = getTemplateId(slot.item);

    counts.set(templateId, (counts.get(templateId) ?? 0) + slot.item.quantity);
    return counts;
  }, new Map<string, number>());
}

