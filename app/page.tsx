export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-3xl rounded-lg border border-emerald-400/30 bg-slate-900 p-8 shadow-2xl shadow-emerald-950/40">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-300">
          Foundation ready
        </p>
        <h1 className="text-4xl font-bold tracking-normal text-white sm:text-6xl">
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
    </main>
  );
}
