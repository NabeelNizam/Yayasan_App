export function toPercent(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)))
}

export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = toPercent(value, max)
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[#0B7932] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
