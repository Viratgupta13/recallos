import { getMemoryColor } from '@/lib/utils';

interface MemoryRingProps {
  strength: number; // 0–100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function MemoryRing({ strength, size = 80, strokeWidth = 8, showLabel = true }: MemoryRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (strength / 100) * circumference;
  const color = getMemoryColor(strength);
  const center = size / 2;

  return (
    <div className="memory-ring-container" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="memory-ring-svg"
        aria-label={`Memory strength: ${strength}%`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-surface-alt)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: size < 70 ? '0.875rem' : '1.125rem', fontWeight: 700, color, lineHeight: 1 }}>
            {strength}%
          </span>
          {size >= 80 && (
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Memory
            </span>
          )}
        </div>
      )}
    </div>
  );
}
