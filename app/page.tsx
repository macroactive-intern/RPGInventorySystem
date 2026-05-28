import { BackpackGrid } from "@/components/inventory/BackpackGrid";
import { EquipmentPanel } from "@/components/inventory/EquipmentPanel";
import { Hotbar } from "@/components/inventory/Hotbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-lg border border-emerald-400/30 bg-slate-900 p-6 shadow-2xl shadow-emerald-950/40 sm:p-8">
          <p className="mb-4 text-sm font-semibold uppercase text-emerald-300">
            Foundation ready
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-6xl">
            RPG inventory system
          </h1>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Next.js", "TypeScript", "Tailwind CSS"].map((label) => (
              <div
                className="rounded-md border border-slate-700 bg-slate-800 px-4 py-3 text-center text-sm font-medium text-slate-200"
                key={label}
              >
                {label}
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
          <EquipmentPanel />
          <BackpackGrid />
        </div>
        <Hotbar />
      </div>
    </main>
  );
}
