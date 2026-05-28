import { BackpackGrid } from "@/components/inventory/BackpackGrid";
import { EquipmentPanel } from "@/components/inventory/EquipmentPanel";
import { Hotbar } from "@/components/inventory/Hotbar";
import { InventoryDndProvider } from "@/components/inventory/InventoryDnd";
import { WeightPanel } from "@/components/inventory/WeightPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
              Quartermaster
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              RPG Inventory System
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <StatusPill label="Slots" value="30" />
            <StatusPill label="Hotbar" value="1-5" />
            <StatusPill label="Capacity" value="20kg" />
          </div>
        </header>

        <InventoryDndProvider>
          <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
            <aside className="flex flex-col gap-5">
              <EquipmentPanel />
              <WeightPanel />
            </aside>
            <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
              <BackpackGrid />
            </section>
          </div>
          <Hotbar />
        </InventoryDndProvider>
      </div>
    </main>
  );
}

interface StatusPillProps {
  label: string;
  value: string;
}

function StatusPill({ label, value }: StatusPillProps) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-right">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-100">{value}</div>
    </div>
  );
}
