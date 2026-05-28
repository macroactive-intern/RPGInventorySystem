"use client";

import { useInventoryStore } from "@/store/inventoryStore";

export function InventorySearch() {
  const inventorySearchQuery = useInventoryStore(
    (state) => state.inventorySearchQuery,
  );
  const setInventorySearchQuery = useInventoryStore(
    (state) => state.setInventorySearchQuery,
  );

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/20">
      <label
        className="block text-sm font-semibold text-slate-200"
        htmlFor="inventory-search"
      >
        Search Inventory
      </label>
      <div className="mt-2 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300"
          id="inventory-search"
          onChange={(event) => setInventorySearchQuery(event.target.value)}
          placeholder="Type an item name"
          type="search"
          value={inventorySearchQuery}
        />
        {inventorySearchQuery ? (
          <button
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            onClick={() => setInventorySearchQuery("")}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
