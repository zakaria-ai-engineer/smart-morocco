export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-white">{title}</h2>
      {subtitle ? <p className="mt-2 text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
