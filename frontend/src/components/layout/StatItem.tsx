export default function StatItem({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-5xl font-serif mb-2">{number}</p>
      <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
