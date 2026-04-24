type ProgressBarProps = {
  value: number | null
}

export default function ProgressBar({ value }: ProgressBarProps) {
  if (value === null) {
    return <span className="text-xs text-gray-400">—</span>
  }

  const pct = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gray-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 tabular-nums w-9 text-right">
        {pct}%
      </span>
    </div>
  )
}
