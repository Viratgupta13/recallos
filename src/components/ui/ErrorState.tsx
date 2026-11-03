import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)' }}>Error</h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', maxWidth: 300 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: 8 }}>
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}
