'use client';

function nextIn(value: number, options: number[]): number {
  if (options.includes(value)) {
    return options[(options.indexOf(value) + 1) % options.length];
  }
  return options.find(v => v > value) ?? options[0];
}

export function CyclingPill({
  value,
  options,
  onChange,
  label,
  title,
}: {
  value: number;
  options: number[];
  onChange: (n: number) => void;
  label: string;
  title: string;
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(nextIn(value, options)); }}
      title={title}
      className="rounded-full px-3 py-2 text-xs font-mono tabular-nums text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
    >
      {label}
      <span className="ml-1">{value}</span>
    </button>
  );
}
