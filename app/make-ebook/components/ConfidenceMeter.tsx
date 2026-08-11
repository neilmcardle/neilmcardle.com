"use client";

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  showPercent?: boolean;
}

export function ConfidenceMeter({ value, label, showPercent = true }: ConfidenceMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const isHigh = clampedValue >= 80;
  const isMedium = clampedValue >= 50 && clampedValue < 80;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-11 text-gray-600 dark:text-[#a3a3a3] min-w-max">{label}</span>}
      <div className="flex-1 flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#3a3a3a] rounded-pill overflow-hidden">
          <div
            className={`h-full rounded-pill transition-all duration-300 ${
              isHigh
                ? "bg-action-primary-500 dark:bg-action-primary-dark"
                : isMedium
                  ? "bg-yellow-500 dark:bg-yellow-400"
                  : "bg-gray-400 dark:bg-[#737373]"
            }`}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
        {showPercent && (
          <span className="text-10 font-mono text-gray-600 dark:text-[#a3a3a3] tabular-nums w-7 text-right">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    </div>
  );
}
