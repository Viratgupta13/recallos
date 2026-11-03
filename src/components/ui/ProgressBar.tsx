
interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({ value, color, height = 6, showLabel = false, label, animated = true }: ProgressBarProps) {
  const fillColor = color || (
    value >= 80 ? 'var(--color-success)' :
    value >= 60 ? 'var(--color-warning)' :
    'var(--color-danger)'
  );

  return (
    <div style={{ width: '100%' }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{label}</span>}
          {showLabel && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: fillColor }}>{value}%</span>}
        </div>
      )}
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: fillColor,
            transition: animated ? 'width 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
