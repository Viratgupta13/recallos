
interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 16,
            width: i === lines - 1 ? '65%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '40%' }} />
        </div>
      </div>
      <LoadingSkeleton lines={3} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 12, width: 80 }} />
        <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 'var(--radius-md)' }} />
      </div>
      <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '70%' }} />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: i === 0 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  );
}
